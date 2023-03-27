const jwt = require('jsonwebtoken');
const JWT_SECRET = '$&THISISASECRET&$';

const fetchuser = (req, res, next)=>{
    // get the user from the JWT Token and add id to req object
    const token = req.header('token');
    if(!token){
        res.status(401).send({error : "Please Authenticate using a valid token !"})
    }
    try{
        const data = jwt.verify(token,JWT_SECRET);
        req.user = data.user;
        next();
    }
    catch(error){
        res.status(401).send({error : "Please Authenticate using a valid token !"})
    }
}

module.exports = fetchuser;