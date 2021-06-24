require('dotenv').config();
const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN, REFRESH_TOKEN } = process.env;

exports.checkAuth = function(req, res, next){
  const header = req.header('Authorization')
  if(!header){
    throw new Error('Acceso Denegado');
  } else{
    const [bearer, token] = header.split(' ');
    if(token) console.log("Token OK")
    if(bearer === 'Bearer' && token){
      try {
        const payload = jwt.verify(token, ACCESS_TOKEN);
        req.user = payload.user;
        next();
      } catch (error) {
        if(error.name === 'TokenExpiredError'){
          throw new Error('Token Expirado');
        } else if(error.name === 'JsonWebTokenError'){
          throw new Error('Token Invalido');
        }
      }
    } else {
      throw new Error('Error en Token');
    }
  }
}