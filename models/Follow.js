const userCollection = require('../db').db().collection("users")
const followsCollection = require('../db').db().collection("follows")
const ObjectID = require('mongodb').ObjectID
const User = require("./User")



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
    //added followedId to follow object
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

Follow.getFollowsById = function(id) {
    //id = profileId but it changes e.g from nextwebb id to ose's  Id
    return new Promise( async (resolve, reject)=>{
       try {
        let followers = await followsCollection.aggregate([
            {$match: {followedId : id}},
            //lookup is done on each doc the match stage returns
            {$lookup: {from: "users", localField:"authorId", foreignField: "_id", as: "userDoc"}},//an array of objects or user docs
            {$project: {
                username: {$arrayElemAt: ["$userDoc.username", 0]},
                email: {$arrayElemAt:  ["$userDoc.email", 0]}
            }
        }
        ]).toArray()

       // modified the followers array
        followers = followers.map(function(follower){
             let user = new User(follower, true)
             return {username: follower.username, avatar: user.avatar}
        })
        console.log(followers)
        resolve(followers)

       } catch(error) {
            reject()
       }
    })

}

Follow.getFollowingById = function(id) {
    //id = profileId
    return new Promise(async (resolve, reject) => {
      try {
        let followers = await followsCollection.aggregate([
          {$match: {authorId: id}},
          {$lookup: {from: "users", localField: "followedId", foreignField: "_id", as: "userDoc"}},
          {$project: {
            username: {$arrayElemAt: ["$userDoc.username", 0]},
            email: {$arrayElemAt: ["$userDoc.email", 0]}
          }}
        ]).toArray()
        followers = followers.map(function(follower) {
          let user = new User(follower, true)
          return {username: follower.username, avatar: user.avatar}
        })
        resolve(followers)
      } catch(error) {
        reject()
      }
    })
  }

  Follow.countFollowersById = function(id) {
    return new Promise (  async (resolve, reject)=>{
        let followerCount = await followsCollection.countDocuments({followedId: id})
        resolve(followerCount)
    })
  }

  Follow.countFollowingById = function(id) {
    return new Promise (  async (resolve, reject)=>{
        let count = await followsCollection.countDocuments({authorId: id})
        resolve(count)
    })
  }

module.exports = Follow