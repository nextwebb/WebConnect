const bcrypt = require('bcryptjs');
//reurns the db obj
const usersCollection = require('../db').db().collection('users');
const validator = require("validator");
const md5 = require('md5')

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

    User.prototype.validate = function(){
        return new Promise(async (resolve, reject)=> {
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
            if(this.data.password.lengthh > 50){
                this.errors.push("Password cannot exceed 50 characters")
            }
            if(this.data.username.length > 0 &&this.data.username.length < 3){
                this.errors.push("Username must be at least 3 characters.")
            }
            if(this.data.password.lengt > 30){
                this.errors.push("Username cannot exceed 30 characters")
            }
    
            // Only if username is valid then check to see if its already taken
            if (this.data.username.length > 2 && this.data.length < 31 && validator.isAlphanumeric(this.data.username)){
                let usernameExists = await usersCollection.findOne({username: this.data.username})//this resolves to an object that represent a document 
                //else it resolves to null
                //waits till the promise rejects or resolves
                if(usernameExists){ this.errors.push("That username is already taken.")}
    
            }
    
    
            // Only if email is valid then check to see if it's already taken
            if ( validator.isEmail(this.data.email)){
                let emailExists = await usersCollection.findOne({email: this.data.email})//this resolves to an object that represent a document 
                //else it resolves to null
                //waits till the promise rejects or resolves
                if(emailExists){ this.errors.push("That email is already been used.")}
    
            }
            resolve()//this action has completed
            
        })
    }

    User.prototype.login = function() {
        //we use a promise for asynchronous operations
        //tasks that we dont how long it'll take to execute
            return new Promise( (resolve, reject) => {
                //the "this" keyword here refers to the global object and the instance object
        this.cleanUp()

        usersCollection.findOne({username: this.data.username}).then((attemptedUser)=>{
            if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
                this.getAvater()
                resolve("Congrats!")

             } else {
                 reject("Invalid username / Password!")
                
             }
        }).catch(function(){
            reject("PLease try again later.")
        })

        }) 
    }

     User.prototype.register = function(){
         return new Promise(  async (resolve, reject)=> {
            //step #1: Validate user data
            this.cleanUp();
           await this.validate(); // so upon receiving a promise that resolves; it waits completes this action
    
            // step #2: Only if there are no validation errors
            // then save the user data into a database
            if (!this.errors.length) {
                //hash user password
                let salt = bcrypt.genSaltSync(10) //10 degree rounds of randomness
                this.data.password = bcrypt.hashSync(this.data.password, salt)
                usersCollection.insertOne(this.data)
                this.getAvater()
                resolve();
            } else {
                reject(this.errors)
            }
        })
     }

     User.prototype.getAvater = function () {
         //local scope
         //only accessed through the getAvater contructor
         this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
        //  https://gravatar.com/avatar/f64fc44c03a8a7eb1d52502950879659?s=128
     }
module.exports = User;