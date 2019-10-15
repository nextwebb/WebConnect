const express = require('express');
const app = express();

const router = require('./router');//it expects a file

//boiler plate code
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//we use the express feature to serve static files as images,css files and js files.
app.use(express.static('public')); 
// const log =function(req,res, next) {
//     console.log("hello world");
//     next();
// }
// app.use('/about',log); 
app.set('views', './views');
app.set('view engine', 'ejs'); //we want to use the ejs template engine

app.use('/', router); //Every time the app receives any http request to the base directory the variable router gets executed and added to the server.



app.listen(3000);