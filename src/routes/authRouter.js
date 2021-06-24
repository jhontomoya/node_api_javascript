var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const User = require('../model/userModel');
const Token = require('../model/tokenModel');
const { ACCESS_TOKEN, REFRESH_TOKEN } = process.env;
const { jsonResponse } = require('../lib/jsonResponse');

router.post('/signup', async function(req, res, next){
  const { username, password, name, email, phone, jobTitle } = req.body;
  if(!username || !password || !name || !email || !phone || !jobTitle){
    next(createError(404, "Faltan datos por enviar"));
  } else if(username && password && name && email && phone && jobTitle){
    try {
      const user = new User({username, password, name, email, phone, jobTitle});
      const exists = await user.userNameExists(username);
      if(exists){
        next(createError(404, "El usuario ya se encuentra registrado"));
      } else {
        const accessToken = await user.createAccessToken();
        const refreshToken = await user.createRefreshToken();
        let newUser = await user.save();
        newUser.password = "";
        res.status(200).json(
          jsonResponse(
            {user: newUser, accessToken: accessToken, refreshToken: refreshToken}, 
            "Usuario registrado", 200
          )
        );
      }
    } catch (error) {
      next(createError(500, "Servicio no disponible"));
    }
  }
});

router.post('/login', async function(req, res, next){
  const { username, password } = req.body;
  if(!username || !password){
    next(createError(404, "Ingresar usuario y/o contraseña"));
  } else if(username && password ){
    try {
      let userRes = {};
      const user = new User({username, password});
      const exists = await user.userNameExists(username);
      if(exists){
        console.log("Existe")
        userRes = await User.findOne({username: username});
        const passwordCorrect = user.isCorrectPassword(password, userRes.password);
        if(passwordCorrect){
          console.log("OK Pass")
          const accessToken = await userRes.createAccessToken();
          const refreshToken = await userRes.createRefreshToken();
          userRes.password = "";
          res.status(200).json(
            jsonResponse(
              {user: userRes, accessToken: accessToken, refreshToken: refreshToken}, 
              "Login correcto", 200
            )
          );
        } else {
          next(createError(404, "Usuario y/o contraseña incorrectos"));
        }
      } else {
        next(createError(404, "Usuario y/o contraseña incorrectos"));
      }
    } catch (error) {
      
    }
  }
});

router.post('/logout', async function(req, res, next){
  const {refreshToken} = req.body;
  if(!refreshToken) next(createError(404, "Faltan parametros"));
  try {
    await Token.findOneAndRemove({token: refreshToken})
    res.status(200).json(
      jsonResponse(
        null, 
        "Logout correcto", 200
      )
    );
  } catch (error) {
    next(createError(404, "No se encontro el token"));
  }
});

router.post('/refresh-token', async function(req, res, next){
  const {refreshToken} = req.body;
  if(!refreshToken) next(createError(404, "Faltan parametros"));
  try {
    const tokenDoc = await Token.findOne({token: refreshToken});
    if(!tokenDoc) {
      next(createError(404, "No se encontro el token"));
    } else {
      const payload = jwt.verify(tokenDoc.token, REFRESH_TOKEN);
      const accessToken = jwt.sign(
        {
        user:payload
        }, 
        ACCESS_TOKEN, 
        { 
          expiresIn: '1d'
        }
      );
      res.status(200).json(
        jsonResponse(
          {accessToken: accessToken}, 
          "Token Renovado", 200
        )
      );
    }
  } catch (error) {
    next(createError(404, "No se encontro el token"));
  }
});

module.exports = router;