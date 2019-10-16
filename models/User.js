//reurns the db obj
const usersCollection = require('../db').collection('users');

const validator = require("validator");

// function constructor
let User = function(data) {
   this.data = data;
   this.errors = [];
    
}
User.prototype.cleanUp = function() {
    if(typeof(this.data.username) != "string") {
        this.data.username = ""
    }
    if(typeof(this.data.email) != "string") {
        this.data.email = ""
    }
    if(typeof(this.data.password) != "string") {
        this.data.password = ""
    }

    // get rid of any bogus properties
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}

    User.prototype.validate = function() {
        if(this.data.username == ""){
            this.errors.push("You must provide a username.")
        }
        if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)){
            this.errors.push("Username can only contain letters and numbers.");
        }
        if(!validator.isEmail(this.data.email)){
            this.errors.push("You must provide a valid email address.")
        }
        if(this.data.password == ""){
            this.errors.push("You must provide a password.")
        }
        if(this.data.password.length > 0 &&this.data.password.length < 12){
            this.errors.push("Password must be at least 12 characters.")
        }
        if(this.data.password.lengthh > 100){
            this.errors.push("Password cannot exceed 100 characters")
        }
        if(this.data.username.length > 0 &&this.data.username.length < 3){
            this.errors.push("Username must be at least 3 characters.")
        }
        if(this.data.password.lengt > 30){
            this.errors.push("Username cannot exceed 30 characters")
        }
        
    }

    User.prototype.login = function(callback) {
        //the "this" keyword here refers to the global object and the instance object
        this.cleanUp()

        usersCollection.findOne({username: this.data.username}, (err, attemptedUser) => {
            if (attemptedUser && attemptedUser.password == this.data.password) {
               callback("Congrats!")
            } else {
                callback("Invalid username / Password!")
               
            }
        })

    }

     User.prototype.register = function() {
        //step #1: Validate user data
        this.cleanUp();
        this.validate();

        // step #2: Only if there are no validation errors
        // then save the user data into a database
        if (!this.errors.length) {
            usersCollection.insertOne(this.data)
        }
    }
module.exports = User;