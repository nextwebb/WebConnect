
const User = require('../models/User');

exports.login = function(req, res) {
    let user = new User(req.body);//new instance
    user.login( function(result) {
        res.send(result);
    })
   
}

exports.logout = function() {
    
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
    //calls the appropriate view
    res.render('home-guest');
}