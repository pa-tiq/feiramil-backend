const express = require("express");
const bodyParser = require("body-parser");
//const dataRoutes = require("./routes/data");
const db = require('./util/database');

//db.execute('SELECT * FROM products')
//  .then(result => {
//    console.log(result);
//  })
//  .catch(err => {
//    console.log(err);
//  });
//
const app = express();

app.use(bodyParser.json()); // parse incoming JSON data

app.use((req, res, next) => {
  //middleware to solve CORS error
  res.setHeader("Access-Control-Allow-Origin", "*"); //allow origins to access my data
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE"); //allow origins to use my HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-type, Authorization"); //allow origins to use certain headers
  next(); //the request can now continue
});

//app.use("/data", dataRoutes); // GET /feed/

app.listen(8080);



