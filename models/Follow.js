const userCollection = require('../db').db().collection("users")
const followsCollection = require('../db').db().collection("follows")
const ObjectID = require('mongodb').ObjectID



let Follow = function(followedUsername, authorId) {

this.followedUsername = followedUsername
this.authorId = authorId
this.errors = []


}

Follow.prototype.cleanUp = function() {
    if ( typeof(this.followedUsername) != "string" ){
this.followedUsername = ""
    }
}

Follow.prototype.validate = async function(action) {
// followedUsername must exist in database
//gets the follow user acccount and Id
let followedAccount = await userCollection.findOne({username: this.followedUsername})
//saves it as a property
if (followedAccount) {
    this.followedId = followedAccount._id

} else {
    this.errors.push("You cannot follow a user that does not exist.")
}
   let doesFollowAlreadyExist = await  followsCollection.findOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)}) //Check if a follow exists or not
   if ( action == "create") {
       if (doesFollowAlreadyExist) {
           this.errors.push("You are already following this user.")
       }
   }

   if ( action == "delete") {
    if (!doesFollowAlreadyExist) {
        this.errors.push("You cannot stop following someone you don't already follow.")
    }
}

// should not be able to follow yourself
if (this.followedId.equals(this.authorId)) {
    this.errors.push("You cannot follow yourself.")
}

}

Follow.prototype.create = function(){

  //  console.log(follow)
    console.log(this.authorId)
    return new Promise(async (resolve, reject) =>{
        this.cleanUp()
        await this.validate("create")
        if (!this.errors.length) {
            await followsCollection.insertOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
            resolve()
        } else {
            reject(this.errors)
        }
    })
}

Follow.prototype.delete = function(){
    return new Promise(async (resolve, reject) =>{
        this.cleanUp()
        await this.validate("delete")
        if (!this.errors.length) {
            await followsCollection.deleteOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})
            resolve()
        } else {
            reject(this.errors)
        }
    })
}

Follow.isVisitorFollowing =  async function(followedId, visitorId) {
    let followDoc = await followsCollection.findOne({followedId:followedId, authorId: new ObjectID(visitorId) })
    if (followDoc) {
        return true
    } else {
        return false
    }
}

module.exports = Follow