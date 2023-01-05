const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const error_messages = require('../util/error_messages.json');
const success_messages = require('../util/success.messages.json');

const Product = require('../models/product');
const User = require('../models/user');
const CityFilter =  require('../models/cityFilter');

exports.getUser = (req, res, next) => {
  const userId = req.userId;
  let loadedUser;
  User.findById(userId)
    .then(([users]) => {
      if (users.length === 0) {
        const error = new Error(error_messages.user_not_found);
        error.statusCode = 404;
        throw error;
      }
      loadedUser = users[0];
      res.status(200).json({ message: success_messages.user_fetched, user: loadedUser });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.deleteUser = (req, res, next) => {};

exports.updateUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(error_messages.validation_failed);
    error.statusCode = 422;
    throw error;
  }
  const userId = req.userId;
  const email = req.body.email;
  const name = req.body.name;
  const om = req.body.om;
  const phone = req.body.phone;
  const city = req.body.city;
  const state = req.body.state;
  const newPassword = req.body.password;
  if (!newPassword) {
    const user = new User(userId, email, null, name, om, phone, null, city, state);
    user
      .update()
      .then((result) => {
        res.status(201).json({
          message: 'Usuário editado',
          changedRows: result[0].changedRows,
        });
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        next(error);
      });
  } else {
    bcrypt
      .hash(newPassword, 12)
      .then((hashedPassword) => {
        const user = new User(userId, email, hashedPassword, name, om, phone, null, city, state);
        return user.update();
      })
      .then((result) => {
        res.status(201).json({
          message: success_messages.user_edited,
          changedRows: result[0].changedRows,
        });
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        next(error);
      });
  }
};

exports.updatePhotoPath = (req, res, next) => {
  const oldFileExists = fs.existsSync('.' + req.body.oldpath);
  if (oldFileExists) {
    fs.unlinkSync('.' + req.body.oldpath);
  }
  const userId = req.userId;
  const user = new User(userId, null, null, null, null, null, req.body.path);
  user
    .updatePhoto()
    .then((result) => {
      res.status(201).json({
        message: success_messages.user_profile_picture_path_edited,
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

exports.uploadPhoto = (req, res) => {
  try {
    const result = req.pipe(
      fs.createWriteStream('./profilePictures/image' + Date.now() + '.png')
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

exports.addFilter = (req,res) => {
  const userId = req.userId;
  const city = req.body.city;
  const state = req.body.state;
  const cityfilter = new CityFilter(null, userId, city, state);
  cityfilter
    .save()
    .then((result) => {
      res.status(201).json({
        message: success_messages.user_city_filter_added,
        changedRows: result[0].changedRows,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
}

exports.deleteFilter = (req, res, next) => {
  const userId = req.userId;
  const city = req.body.city;
  const state = req.body.state;
  CityFilter.findByUserIdCityState(userId,city,state)
    .then(([filters]) => {
      if(filters.length > 0){
        return CityFilter.deleteById(fiters[0].id);
      }
    })
    .then((result) => {
      res.status(201).json({
        message: success_messages.user_city_filter_added,
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
