const dotenv = require('dotenv');
dotenv.config()
const mongodb = require('mongodb');

mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser : true, useUnifiedTopology: true}, 
    function(err, client) {
        //returns database object we selected
        module.exports = client
        const app = require("./app");
        console.log(`listening on port ${process.env.PORT}`)
        app.listen(process.env.PORT);
})
