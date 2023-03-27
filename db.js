const mongoose = require('mongoose');
import env from "dotenv";

const connectToMongo = ()=>{
    mongoose.connect(process.env.mongoURI, ()=>{
        console.log("Connnected to Mongo Successfully !!")
    })
}

module.exports = connectToMongo;