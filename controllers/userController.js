
const User = require('../models/User');

exports.login = function(req, res) {
    let user = new User(req.body);//new instance
    user.login().then(function(result) {
        console.log(req.session.user)
        req.session.user = {
            favColor:"blue",
             username: user.data.username
        }
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

exports.register = function(req, res) {
   let user = new User(req.body);//object
   //this object has access to every property and method of the user function object
   user.register()
   if (user.errors.length){
    res.send(user.errors)
   } else {
       res.send('congrats, there are no errors.')
   }
}

exports.home = function(req, res) {
   if( req.session.user){
        res.render('home-dashboard', {username: req.session.user.username});
   } else{
         //calls the appropriate view
    res.render('home-guest', {errors: req.flash('errors')});
   }
}