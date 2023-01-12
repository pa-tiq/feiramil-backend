const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const Product = require('../models/product');
const Image = require('../models/image');
const User = require('../models/user');
const error_messages = require('../constants/error_messages.json');
const success_messages = require('../constants/success_messages.json');
const Favourite = require('../models/favourite');

exports.getProductsExeptUser = (req, res, next) => {
  Product.fetchAllExeptUserId(req.userId)
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
      //if (products.length === 0) {
      //  const error = new Error(error_messages.user_products_not_found);
      //  error.statusCode = 404;
      //  throw error;
      //}
      res.status(200).json({
        message: `Produtos do usuário ${req.userId} obtidos`,
        products: products,
      }); // 200 = success
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getUserFavourites = (req, res, next) => {
  Product.findFavouriteIdsByUserId(req.userId)
    .then(([productIds]) => {
      let ids = [];
      productIds.forEach((item) => {
        ids.push(item.productId);
      });
      res.status(200).json({
        message: `Favoritos do usuário ${req.userId} obtidos`,
        productIds: ids,
      }); // 200 = success
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.addUserFavourite = (req, res, next) => {
  const userId = req.userId;
  const productId = req.body.productId;
  const favourite = new Favourite(null, userId, productId);
  favourite
    .save()
    .then((result) => {
      res.status(201).json({
        message: success_messages.user_favourite_added,
        favouriteId: result[0].insertId,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.removeUserFavourite = (req, res, next) => {
  const userId = req.userId;
  const productId = req.body.productId;
  Favourite.findByUserIdAndProductId(userId, productId)
    .then(([favourites]) => {
      if (favourites.length === 0) {
        const error = new Error(error_messages.product_not_found);
        error.statusCode = 404;
        throw error;
      }
      if (favourites[0].userId != req.userId) {
        const error = new Error(error_messages.not_authorized);
        error.statusCode = 403;
        throw error;
      }
      return Favourite.deleteById(favourites[0].id);
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

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then(([products]) => {
      if (products.length === 0) {
        const error = new Error(error_messages.product_not_found);
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({ message: 'Produto encontrado', product: products[0] });
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
    next(error);
  }
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const city = req.body.city;
  const state = req.body.state;
  const userId = req.userId;

  const product = new Product(
    null,
    title,
    price,
    description,
    city,
    state,
    userId
  );
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

exports.uploadProductImage = (req, res) => {
  try {
    const result = req.pipe(
      fs.createWriteStream('./productPictures/' + uuidv4() + '.png')
    );
    res.status(201).json({
      message: success_messages.product_image_added,
      path: result.path,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

exports.addProductImagePaths = (req, res, next) => {
  const userId = req.userId;
  const productId = req.params.productId;
  const paths = req.body.paths;
  let imageIds = [];
  for (const path of paths) {
    const image = new Image(null, path, productId);
    image
      .save()
      .then((result) => {
        imageIds.push({ imageId: result[0].insertId });
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        next(error);
      });
  }
  res.status(201).json({
    message: success_messages.product_image_path_added,
    imageIds: imageIds,
  });
};

exports.deleteProductImagePaths = (req, res, next) => {
  const productId = req.params.productId;
  const paths = req.body.paths;
  for (const path of paths) {
    const oldFileExists = fs.existsSync('.' + path);
    if (oldFileExists) {
      fs.unlinkSync('.' + path);
    }
    Image.findByProductIdAndPath(productId, path).then(([images]) => {
      Image.deleteById(images[0].id)
        .then((r) => {})
        .catch((error) => {
          if (!error.statusCode) {
            error.statusCode = 500;
          }
          next(error);
        });
    });
  }
  res.status(200).json({
    message: success_messages.product_image_deleted,
  });
};

exports.updateProductImagePaths = (req, res, next) => {
  const productId = req.params.productId;
  let oldImageIds = [];
  let counter = 0;
  for (const oldpath of req.body.oldpaths) {
    const oldFileExists = fs.existsSync('.' + oldpath);
    if (oldFileExists) {
      fs.unlinkSync('.' + oldpath);
    }
    Image.findByProductIdAndPath(productId, oldpath).then(([images]) => {
      oldImageIds.push(images[0].id);
      const image = new Image(images[0].id, req.body.paths[counter], productId);
      image
        .update()
        .then((r) => {})
        .catch((error) => {
          if (!error.statusCode) {
            error.statusCode = 500;
          }
          next(error);
        });
      counter++;
    });
  }

  res.status(201).json({
    message: success_messages.product_image_path_added,
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
  const price = req.body.price;
  const description = req.body.description;
  const city = req.body.city;
  const state = req.body.state;
  const userId = req.userId;

  Product.findById(productId)
    .then(([products]) => {
      if (products.length === 0) {
        const error = new Error(error_messages.product_not_found);
        error.statusCode = 404;
        throw error;
      }
      if (products[0].userId.toString() !== userId) {
        const error = new Error(error_messages.not_authorized);
        error.statusCode = 403;
        throw error;
      }
      const product = new Product(
        productId,
        title,
        price,
        description,
        city,
        state,
        userId
      );
      return product.update();
    })
    .then((result) => {
      res.status(200).json({
        message: success_messages.product_updated,
        changedRows: result[0].changedRows,
      });
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
      if (images.length !== 0) {
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
