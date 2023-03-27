const mongoose = require('mongoose');
require('dotenv').config()

const connectToMongo = ()=>{
    mongoose.connect(process.env.mongoURI, ()=>{
        console.log("Connnected to Mongo Successfully !!")
    })
}

module.exports = connectToMongo;