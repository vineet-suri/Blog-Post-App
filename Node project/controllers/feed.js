const { validationResult } = require('express-validator/check');
const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');
const io = require('../socket');

exports.getPosts = async (req, res, next) => {
  const currentpage = req.query.page;
  const postPerPage = 2;
  let totalPosts;

  try {
  const totalPosts = await Post.findAndCountAll()
  const offset = (currentpage - 1) * postPerPage;
  const posts = await Post.findAll( { offset: offset, limit: postPerPage });
    
  if(!posts){
    const error = new Error('No posts are available.');
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    message: 'Fetched posts successfully.',
    posts: posts,
    totalItems: totalPosts
  });  
  } catch (err) {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }  
};

exports.createPost = async (req, res, next) => {  

  const errors = validationResult(req);
  
  if(!errors.isEmpty()){

    const error = new Error('Validation failed!');
    error.statusCode = 422;
    throw error;
  }

  if(!req.file){
    const error = new Error('No file provided.');
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;

  try {
  const creator = await User.findByPk(req.userId)
    
  const post = await Post.create({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: { id: creator.id, name: creator.name }
  })   
  io.getIO().emit('posts', { action: 'create', post: post });
  res.status(200).json({
  message: 'Post created successfully!',
  post: post,
})
} catch(err) {
  if(!err.statusCode){
    err.statusCode = 500;
  }
  next(err);
}
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  
  try{
  const post = await Post.findByPk(postId)
    
  if(!post){
    const error = new Error('Could not find post.');
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    message: 'Fetching single post', 
    post: post
  })
} catch (err) {
  if(!err.statusCode){
    err.statusCode = 500;
  }
  next(err);
}
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  
  if(!errors.isEmpty()){

    const error = new Error('Validation failed!');
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if(req.file){
    imageUrl = req.file.path;
  }
  
  if(!imageUrl){
    const error = new Error('No file provided.');
    error.statusCode = 422;
    throw error;
  }

  try {
  const post = await Post.findByPk(postId)
  
  if(!post){
    const error = new Error('Could not find post.');
    error.statusCode = 404;
    throw error;
  }

  if(post.creator.id !== req.userId){
    const error = new Error('Not authorised.');
    error.statusCode = 403;
    throw error;
  }

  if(imageUrl !== post.image){
    clearImage(post.imageUrl);
  }

  post.title = title;
  post.imageUrl = imageUrl;
  post.content = content;
      
  const result = await post.save();
  io.getIO().emit('posts', { action: 'update', post: result });
  
  res.status(200).json({
    message: 'Single post updated', 
    post: result      
    })
  } catch(err) {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage= filePath => {
  fpath = path.join(__dirname, '..', filePath);
  fs.unlink(fpath, err => console.log(err));
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
  const post = await Post.findByPk(postId)
  if(!post){
    const error = new Error('Could not find post.');
    error.statusCode = 404;
    throw error;
  }

  if(post.creator.id !== req.userId){
    const error = new Error('Not authorised.');
    error.statusCode = 403;
    throw error;
  }

  clearImage(post.imageUrl);
  const result = await post.destroy();

  io.getIO().emit('posts', { action: 'delete', post: postId });

  res.status(200).json({message: 'Post deleted.'});
} catch (err) {
  if(!err.statusCode){
    err.statusCode = 500;
  }
  next(err);
}
};