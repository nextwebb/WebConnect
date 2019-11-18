
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const markdown = require('marked');
const csrf = require('csurf')
const app = express();
const sanitizeHTML = require("sanitize-html");

//boiler plate code
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use('/api', require('./router-api'))


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
    // make our markdown function available within ejs templates
    res.locals.filterUserHTML = function(content) {
        return sanitizeHTML(markdown(content),{allowedTags: ["p", "br", "ul", "ol", "li", "strong", "bold", "i", "em", "h1", "h2", "h3", "h4", "h5", "h6"  ], allowedAttributes: [] })
    }

    // make all error and success flash messages available from all templates

    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")


    // make current user id available on the req object
    if (req.session.user) {req.visitorId = req.session.user._id} else {req.visitorId = 0}
    
    // make logged in user session data available from within view templates
    res.locals.user = req.session.user
    next()
  })
  
const router = require('./router');//it expects a file


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

app.use(csrf()) //any request that modifies state must have a csrf token else it'll throw an error

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use('/', router); //Every time the app receives any http request to the base directory the variable router gets executed and added to the server.

app.use('/', function(err, req, res, next) {
    if(err){
        if(err.code == "EBADCSRFTOKEN") {
            req.flash('errors', 'Cross site request forgery detected.')
            req.session.save(() => res.redirect('/'))
        } else {
            res.render('404')
        }
    }

})

const server = require('http').createServer(app)
//we're creating a server and passing the express app as the handler

const io = require('socket.io')(server)//we're adding socket functionality to this server

// makes all session data about a user available within the socket
io.use(function(socket, next){
    sessionOptions(socket.request, socket.request.res, next )
})

io.on("connection", function(socket) {
   // console.log("A new user connected")
    if (socket.request.session.user) {
        let user = socket.request.session.user

        socket.emit("welcome", {username: user.username, avatar: user.avatar} )

        socket.on('chatMessageFromBrowser', function(data){
            // when we use io.emit() message gets broadcasted to any and  all browsers connected to this server
            //  socket.broadcast.emit() message gets broadcasted to all browser connected except the sender
            socket.broadcast.emit('chatMessageFromServer', {message: sanitizeHTML(data.message, { allowedTags: [],allowedAttributes: {} }), username:user.username, avatar: user.avatar})
        } ) 
    }
})



module.exports = server; // so we're powering the entire server
