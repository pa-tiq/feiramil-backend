const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');

const Product = require('../models/product');
const Image = require('../models/image');
const User = require('../models/user');
const error_messages = require('../util/error_messages.json');
const success_messages = require('../util/success.messages.json');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([products]) => {
      res.status(200).json({ message: 'Produtos obtidos', products: products }); // 200 = success
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getUserProducts = (req, res, next) => {
  Product.findByUserId(req.userId)
    .then(([products]) => {
      if (products.length === 0) {
        const error = new Error(error_messages.user_products_not_found);
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: `Produtos do usuário ${req.userId} obtidos`, products: products }); // 200 = success
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
    .then(([products]) => {
      if (products.length === 0) {
        const error = new Error(error_messages.product_not_found);
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Produto encontrado', product: products[0] });
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
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.userId;

  const product = new Product(null,title, price, description, userId);
  product
    .save()
    .then((result) => {
      // 201 = success, a resource was created
      res.status(201).json({
        message: 'Post created successfully',
        result: result,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.uploadProductImage = (req, res, next) => {
  try {
    const result = req.pipe(
      fs.createWriteStream('./productPictures/image' + Date.now() + '.png')
    );
    res.status(201).json({
      message: success_messages.user_profile_picture_edited,
      path: result.path,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

exports.addProductImagePath = (req, res, next) => {
  const userId = req.userId;
  const productId = req.params.productId;
  const image = new Image(null, req.body.path, productId);
  image
    .save()
    .then((result) => {
      res.status(201).json({
        message: success_messages.product_image_path_added,
        imageId: result[0].insertId
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
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

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then(([products]) => {
      if (products.length === 0) {
        const error = new Error(error_messages.product_not_found);
        error.statusCode = 404;
        throw error;
      }
      if (products[0].userId != req.userId) {
        const error = new Error(error_messages.not_authorized);
        error.statusCode = 403;
        throw error;
      }
      return Image.findByProductId(productId);
    })
    .then(([images]) => {
      if(images.length !== 0){
        console.log(images);
        try {
          fs.unlinkSync('.' + images[0].image);
        } catch (error) {
          console.log(error);
        } 
      }      
    })        
    .then(() => {
      return Image.deleteByProductId(productId);
    })     
    .then(() => {
      return Product.deleteById(productId);
    })    
    .then(() => {
      res.status(200).json({ message: success_messages.product_deleted });
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
