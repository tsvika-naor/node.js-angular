import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validator, Validators} from '@angular/forms';
import {PostsService} from '../posts.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Post} from '../post.model';
import {mimeType} from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {

  post: Post;
  private mode = 'create';
  private postId: string;
  imagePreview: string;
  form: FormGroup;
  isLoading = false;


  constructor(public postsService: PostsService, public route: ActivatedRoute, public router: Router) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(null,{validators: [Validators.required, Validators.minLength(3)]} ),
      content: new FormControl(null, {validators: [Validators.required]}),
      //image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
      image: new FormControl(null)
    })
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = {id: postData._id, title: postData.title, content: postData.content, imagePath: postData.imagePath};
          this.form.setValue(
            {
              title: this.post.title,
              content: this.post.content,
              image: this.post.imagePath
            })
        });
      } else {
        this.mode = 'create';
        this.postId = null;

      }
    });
  }

  onSavePost() {
    if (this.form.invalid) {
      this.isLoading = true;
      return;
    }
    if (this.mode === 'create') {
      this.postsService.addPost(
        null,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image);
    } else {
        this.postsService.updatePost(
          this.postId,
          this.form.value.title,
          this.form.value.content,
          this.form.value.image);
        this.router.navigate(['/']);
      }
    this.form.reset();
  }

  onImagePicked(event: Event) {

  const file = (event.target as HTMLInputElement).files[0];
  this.form.patchValue({image: file});//patch the image control of the form to the file
  this.form.get('image').updateValueAndValidity();//execute the validators optioins given in the form control!!!!
  const reader = new FileReader();
  reader.onload = () => {
    this.imagePreview = reader.result as string; //returns the file content
  }
  reader.readAsDataURL(file); // this functions fires the reader.onload which returns the (file) content and put it into this.imagePreview.

  }
}

