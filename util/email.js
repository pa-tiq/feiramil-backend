const keys = require('../keys.json');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  auth: {
    user: 'patrick@ime.eb.br',
    pass: keys.email_password
  }
});

//const mailOptions = {
//  from: 'feiramil',
//  to: 'patrickdsilva99@gmail.com',
//  subject: 'Sending Email using Node.js',
//  text: 'That was easy!'
//};
//
//transporter.sendMail(mailOptions, function(error, info){
//  if (error) {
//    console.log(error);
//  } else {
//    console.log('Email sent: ' + info.response);
//  }
//}); 

module.exports = transporter;