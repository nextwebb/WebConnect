
const User = require('../models/User');

exports.mustBeloggedIn = function(req, res, next) {
    if (req.session.user) {
        next()// we're telling express to call the next function 
    } else {
        req.flash("errors", "You must be logged in to perform that action")
        req.session.save( function() {
            res.redirect("/")
        })
    }
}

exports.login = function(req, res) {
    let user = new User(req.body);//new instance
    user.login().then(function(result) {
        // console.log(req.session.user)
        req.session.user = {
            //in memory there will be a property named avater our object
            avatar:user.avatar,
             username: user.data.username,
             _id: user.data._id
        }
       // console.log(user.avatar)
        req.session.save( function() {
            res.redirect("/")
        })
    }).catch(function(e){
        req.flash('errors', e) 
        //this flash message array saves in the database
        req.session.save( function() {
            res.redirect("/")
        })
        
    })
}

exports.logout = function(req, res) {
    req.session.destroy( function() {
        res.redirect('/')
    }) 
}

exports.register =  function(req, res) {
   let user = new User(req.body);//object
   //this object has access to every property and method of the user function object
     user.register().then(function() {
         //Upon correct registering 
         //Update the session  property with new user
        req.session.user = {
            avatar:user.avatar,
            username: user.data.username,
            _id: user.data._id
        }
        req.session.save(function(){// make sure the session data is saved to the server database b4 redirecting
            res.redirect('/');
        })
     }).catch(function(regErrors){
        regErrors.forEach(function(error){
            req.flash('regErrors', error)//modify the session data and flash messages
       })
       req.session.save(function(){
           // make sure the session data is saved to the server database b4 redirecting
           res.redirect('/');
       })

     })
  
}

exports.home = function(req, res) {
    //if the session has the user property
   if( req.session.user){
        res.render('dashboard');
   } else{
         //calls the appropriate view
    res.render('guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')} )
   }
}