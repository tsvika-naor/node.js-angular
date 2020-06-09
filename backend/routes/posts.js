const express = require('express');
const Post = require('../models/post');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth')
const router = express.Router();
/*
Basic routing
Routing refers to determining how an application responds to a client request to a particular endpoint, which is a URI (or path) and a specific HTTP request method (GET, POST, and so on).

Each route can have one or more handler functions, which are executed when the route is matched.

Route definition takes the following structure:

app.METHOD(PATH, HANDLER) app.get,app.post etc. 
Where:

app is an instance of express.
METHOD is an HTTP request method, in lowercase.
PATH is a path on the server.
HANDLER is the function executed when the route is matched. */

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("invalid mime type");
    if (isValid) {
      error = null;//no error
    }
    cb(error, "backend/images")//null means detected no error, the second is the path for storing the image
  },
  //this is the given file name we create and
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});
//try to find incoming request for a single image property // multer detects the incoming file is an image file otherwise the call
//will be blocked if we want to store an avatar file with an ending of avatar we will change "image" to "avatar"
router.post("", checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: "post added successfully",
      post: {
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath
      }
    });
  })
  .catch( error => {
    res.status(500).json({
      message: 'Creating a post failed!'
    })
  })
});
router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();//return all the Posts
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize)
  }
    postQuery.then(documents => {
      fetchedPosts = documents;
      return Post.count();
    }).then( count => {
      res.status(200).json({
        message: 'posts fetch succesfully!',
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching posts failed!'
      });
    });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post)
    } else {
      res.status(404).json({message: 'Post not found!'});
    }
  }).catch(error => {
    res.status(500).json({
      message: 'Fetching posts failed!'
    });
  });
});
router.put("/:id", checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  Post.updateOne({_id: req.params.id,creator: req.userData.userId}, post).then(result => {
 if (result.nModified > 0) {
   res.status(200).json({
     message: "update successful!"
   })
 }else {
   res.status(401).json({message: "Not authorized!"});
 }
  });
});
router.delete("/:id", checkAuth,  (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then(result => {
    if (result.n > 0) {
      res.status(200).json({
        message: "Deletion successful!"
      })
    }else {
      res.status(401).json({message: "Not authorized!"});
    }
  })
  .catch(error => {
    res.status(500).json({
     message: "Fetching posts failed!"
    })
  })
});

module.exports = router;
