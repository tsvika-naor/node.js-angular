import {Post} from './post.model';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';

const BACKEND_URL = environment.apiURL + '/posts/';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{post: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {
  }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{ message: string, posts: any, maxPosts: number }>(BACKEND_URL + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map( post => {
          return {
            id: post._id,
            title: post.title,
            content: post.content,
            imagePath: post.imagePath,
            creator: post.creator
          };
        }),
          maxPosts: postData.maxPosts
      };
      }))
      .subscribe(transFormedPostsData => {
        this.posts = transFormedPostsData.posts;
        this.postsUpdated.next({post: [...this.posts], postCount: transFormedPostsData.maxPosts});
      });
    return [...this.posts];
  }

  getPost(id: string) {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string }>(BACKEND_URL + id);
  }

  getPostsUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(id: null, title: string, content: string, image: File) {
   const postData = new FormData();
   postData.append('title', title);
   postData.append('content', content);
   postData.append('image', image, title); // title will be the filename on the backend;


   this.http.post<{ message: string, post: Post }>(BACKEND_URL, postData).subscribe(
      () => {
      this.router.navigate(['/']);
    });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object' ) {
      postData = new FormData();
      postData.append('id' , id);
      postData.append('title' , title);
      postData.append('content' , content);
      postData.append('image', image, title);
    } else {
      postData = {
        id,
        title,
        content,
        imagePath: image
      };
    }
    this.http.put(BACKEND_URL + id, postData).subscribe(() => {
      this.router.navigate(['/']);
    });


  }
  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }
}




















// addPost(id: null, title: string, content: string, image: File) {
//   const postData = new FormData();
//   postData.append("title", title);
//   postData.append("content", content);
//   postData.append("image", image, title); // title will be the filename on the backend;
//
//
//   this.http.post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postData).subscribe(
//     responseData => {
//       //    const post: Post = {id: responseData.post.id , title: title, content: content, imagePath: responseData.post.imagePath};
//       //    String(this.posts.push(post));
//       //    this.postsUpdated.next([...this.posts]);
//
//       this.router.navigate(['/']);
//     });
// }
//
// updatePost(id: string, title: string, content: string, image: File | string) {
//   let postData: Post | FormData;
//   if (typeof(image) === 'object' ) {
//     postData = new FormData();
//     postData.append("id" , id);
//     postData.append("title" , title);
//     postData.append("content" , content);
//     postData.append("image", image, title);
//   }else {
//     postData = {
//       id: id,
//       title: title,
//       content: content,
//       imagePath: image
    // };
  // }
  // this.http.put('http://localhost:3000/api/posts/' + id, postData).subscribe(
  //   response => {
      // const updatedPosts = [...this.posts];
      // const oldPostIndex = updatedPosts.findIndex(p => p.id = id);
      // const post: Post = {
      //    id: id,
      //    title: title,
      //    content: content,
      //    imagePath: ""
      //  };
      // updatedPosts[oldPostIndex] = post;
      // this.postsUpdated.next([...updatedPosts]);
      // this.router.navigate(['/']);
      //
      // });
// }
// deletePost(postId: string) {
      // return this.http.delete('http://localhost:3000/api/posts/' + postId);
      // .subscribe(() => {
      // console.log('post deleted!');
      // const updatedPosts = this.posts.filter(post => post.id !== postId);
      // this.posts = updatedPosts;
      // this.postsUpdated.next([...this.posts]);
      // });
// }
// }
//     }




































