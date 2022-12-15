const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');

const Product = require('../models/product');
const Image = require('../models/image');
const User = require('../models/user');
const error_messages = require('../util/error_messages.json');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([products]) => {
      res
        .status(200)
        .json({ message: 'Produtos obtidos', products: products }); // 200 = success
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((post) => {
      if (!post) {
        const error = new Error(error_messages.product_not_found);
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Produto encontrado', post: post });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.createProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(error_messages.validation_failed);
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error(error_messages.no_image_found);
    error.statusCode = 422;
    throw error;
  }
  //const imageUrl = req.file.path; //doesn't work in windows
  const imageUri = req.file.path.replace('\\', '/');
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.userId;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUri: imageUri,
    userId: userId,
  });
  product
    .save()
    .then((result) => {
      // 201 = success, a resource was created
      res.status(201).json({
        message: 'Post created successfully',
        product: product,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
  console.log(title, content);
};

exports.updateProduct = (req, res, next) => {
  const productId = req.params.productId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(error_messages.validation_failed);
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image; // no new image was picked
  if (req.file) {
    // user picked a new image
    imageUrl = req.file.path.replace('\\', '/');
  }
  if (!imageUrl) {
    const error = new Error(error_messages.no_image_found);
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error(error_messages.product_not_found);
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error(error_messages.not_authorized);
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        // new image was uploaded
        deleteImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'Post updated', post: result });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error(error_messages.product_not_found);
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error(error_messages.not_authorized);
        error.statusCode = 403;
        throw error;
      }
      // check logged in user
      deleteImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'Post deleted' });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

const deleteImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
