
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash');
const app = express();


let sessionOptions = session({
    secret: "Javascript is soooo coool",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge:1000 * 60 * 60 * 24, httpOnly: true
    }
})

app.use(sessionOptions);
app.use(flash())

app.use(function(req, res, next) {
    //this session data is now made available across all ejs templates
    res.locals.user = req.session.user
    next() 
})

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
app.set('view engine', 'ejs');
 //we want to use the ejs template engine

app.use('/', router); //Every time the app receives any http request to the base directory the variable router gets executed and added to the server.



module.exports = app;