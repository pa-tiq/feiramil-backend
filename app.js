
const db = require('./util/database');

//db.execute('SELECT * FROM products')
//  .then(result => {
//    console.log(result);
//  })
//  .catch(err => {
//    console.log(err);
//  });
//

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const { v4:uuidv4 } = require('uuid');

const feedRoutes = require("./routes/feed_router");
const authRoutes = require("./routes/auth_router");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    //callback(null, new Date().toISOString() + "-" + file.originalname); //doesn't work in windows
    callback(null, uuidv4());
  },
});
const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    callback(null, true); //valid file
  } else {
    callback(null, false); //invalid file
  }
};

app.use(bodyParser.json()); // parse incoming JSON data

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image") 
  //extract a single file in a field named 'image' in the request
); //every incoming request will be parsed for files

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  //middleware to solve CORS error
  res.setHeader("Access-Control-Allow-Origin", "*"); //allow origins to access my data
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  ); //allow origins to use my HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-type, Authorization"); //allow origins to use these two headers
  next(); //the request can now continue
});

app.use("/feed", feedRoutes); // GET /feed/
app.use("/auth", authRoutes); // GET /auth/

app.use((error, req, res, next) => {
  // executed whenever an error is thrown with throw() or forwarded with next()
  console.log(error);
  const status = error.statusCode || 500; // if error.statusCode is undefined, then status = 500
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

