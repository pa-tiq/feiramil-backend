const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const feedRoutes = require('./routes/feed_router');
const authRoutes = require('./routes/auth_router');
const userRoutes = require('./routes/user_router');

const app = express();

const profilePictures = multer({ dest: 'profilePictures/' });

// This method will save the binary content of the request as a file.
//app.patch('/binary-upload', (req, res) => {
//  req.pipe(fs.createWriteStream('./uploads/image' + Date.now() + '.png'));
//  res.end('OK');
//});

//// This method will save a "photo" field from the request as a file.
//app.patch('/multipart-upload', upload.single('photo'), (req, res) => {
//  // You can access other HTTP parameters. They are located in the body object.
//  console.log(req.body);
//  res.end('OK');
//});


const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  //destination: "./images/",
  filename: (req, file, callback) => {
    //callback(null, new Date().toISOString() + "-" + file.originalname); //doesn't work in windows
    callback(null, uuidv4());
  },
});
const fileFilter = (req, file, callback) => {
  console.log('fileFilter', file);
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    callback(null, true); //valid file
  } else {
    callback(null, false); //invalid file
  }
};

app.use(bodyParser.json()); // parse incoming JSON data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
  //extract a single file in a field named 'image' in the request
); //every incoming request will be parsed for files

app.use('/profilePictures', express.static(path.join(__dirname, 'profilePictures')));

app.use((req, res, next) => {
  //middleware to solve CORS error
  res.setHeader('Access-Control-Allow-Origin', '*'); //allow origins to access my data
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  ); //allow origins to use my HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-type, Accept, Authorization'); //allow origins to use these two headers
  next(); //the request can now continue
});

app.use('/feed', feedRoutes);
app.use('/user', userRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  // executed whenever an error is thrown with throw() or forwarded with next()
  console.log('Erro capturado:', error);
  const status = error.statusCode || 500; // if error.statusCode is undefined, then status = 500
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

app.listen(8080);
