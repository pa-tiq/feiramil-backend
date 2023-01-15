const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../keys.json');
const error_messages = require('../constants/error_messages.json');
const mailer = require('../util/email');
const User = require('../models/user');
const email_confirmation_screen = require('../util/email_confirmation_screen');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(error_messages.validation_failed);
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  const confirmation_code = `${Math.random()}`.substring(2, 7);
  let emailSent = false;
  let hashedPassword = '';
  bcrypt
    .hash(password, 12)
    .then((hash) => {
      hashedPassword = hash;
      const mailOptions = {
        from: 'patrick@ime.eb.br',
        to: email,
        subject: 'Feiramil - E-mail de confirmação',
        html: email_confirmation_screen(confirmation_code),
      };
      return mailer.sendMail(mailOptions);
    })
    .then((info) => {
      emailSent = false;
      if (info.rejected.length > 0) {
        const err = new Error(error_messages.email_error);
        err.statusCode = 403;
        throw err;
      } else {
        console.log('Email sent: ' + info.response);
        emailSent = true;
      }
      if (emailSent) {
        const user = new User(
          null,
          email,
          hashedPassword,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          '0',
          confirmation_code
        );
        return user.save();
      } else {
        const err = new Error(error_messages.email_error);
        err.statusCode = 403;
        throw err;
      }
    })
    .then((result) => {
      res.status(201).json({
        message: 'Usuário criado e e-mail de confirmação enviado',
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmationCode = req.body.confirmationCode;
  let loadedUser;
  User.findByEmail(email)
    .then(([users]) => {
      if (users.length === 0) {
        const error = new Error(error_messages.user_not_found);
        error.statusCode = 404;
        throw error;
      }
      loadedUser = users[0];
      return bcrypt.compare(password, loadedUser.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error(error_messages.wrong_password);
        error.statusCode = 401;
        throw error;
      }
      return User.checkEmailConfirmatedById(loadedUser.id.toString());
    })
    .then(([result]) => {
      if (result[0].emailConfirmed === 1) {
        const token = jwt.sign(
          {
            email: loadedUser.email,
            userId: loadedUser.id.toString(),
          },
          keys.jsonwebtoken_secret
          //{ expiresIn: '1h' }
        );
        res.status(200).json({
          token: token,
          userId: loadedUser.id.toString(),
          emailConfirmed: true,
        });
      } else {
        User.findEmailConfirmationCodeById(loadedUser.id.toString()).then(
          ([result]) => {
            if (!confirmationCode) {
              res.status(200).json({
                emailConfirmed: false,
                message: error_messages.email_confirmation_code_missing,
              });
            } else {
              if (confirmationCode === result[0].emailConfirmationCode) {
                const token = jwt.sign(
                  {
                    email: loadedUser.email,
                    userId: loadedUser.id.toString(),
                  },
                  keys.jsonwebtoken_secret
                  //{ expiresIn: '1h' }
                );
                User.confirmEmailById(loadedUser.id.toString())
                  .then(() => {
                    res.status(200).json({
                      token: token,
                      userId: loadedUser.id.toString(),
                      emailConfirmed: true,
                    });
                  })
                  .catch((error) => {
                    if (!error.statusCode) {
                      error.statusCode = 500;
                    }
                    next(error);
                  });
              } else {
                res.status(401).json({
                  emailConfirmed: false,
                  message: error_messages.email_confirmation_code_wrong,
                });
              }
            }
            return;
          }
        );
      }
    })

    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.tokenLogin = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('Usuário não encontrado');
        error.statusCode = 404;
        throw error;
      }
      return res
        .status(200)
        .json({ userId: `${req.userId}`, message: 'Token válido.' });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getUserOM = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('Usuário não encontrado');
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({ om: user.om });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.updateUserOM = (req, res, next) => {
  const newOM = req.body.om;
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('Usuário não encontrado');
        error.statusCode = 404;
        throw error;
      }
      user.om = newOM;
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'OM atualizada' });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
