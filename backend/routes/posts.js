const express = require('express');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

const router = express.Router();
const PostController = require('../controllers/posts');
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


//try to find incoming request for a single image property // multer detects the incoming file is an image file otherwise the call
//will be blocked if we want to store an avatar file with an ending of avatar we will change "image" to "avatar"
router.post("", checkAuth, extractFile, PostController.createPost);
router.put("/:id", checkAuth, extractFile, PostController.updatePost);
router.get("", PostController.getPosts);
router.get("/:id",PostController.getPost);
router.delete("/:id", checkAuth, PostController.deletePost);

module.exports = router;


