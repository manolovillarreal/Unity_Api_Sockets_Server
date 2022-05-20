
const jwt = require('jsonwebtoken');

const secret = "PAS$w0rdXT2021";

const comprobarJWT = (token='')=>{

    try {
        const {uid} = jwt.verify(token,secret);
        return uid;
    } catch (error) {
        return false;
    }
}

module.exports = {
    comprobarJWT
}