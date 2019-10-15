
const User = require('../models/User');

exports.login = function() {

}

exports.logout = function() {
    
}

exports.register = function(req, res) {
   let user = new User(req.body);//object
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