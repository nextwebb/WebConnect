
const User = require('../models/User');

exports.login = function(req, res) {
    let user = new User(req.body);//new instance
    user.login().then(function(result) {
        // console.log(req.session.user)
        req.session.user = {
            //in memory there will be a property named avater our object
            avatar:user.avatar,
             username: user.data.username
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
            username: user.data.username
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
        res.render('dashboard', {username: req.session.user.username, avatar: req.session.user.avatar });
   } else{
         //calls the appropriate view
    res.render('guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')} )
   }
}