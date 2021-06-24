var express = require('express');
var router = express.Router();
const createError = require('http-errors');
const User = require('../model/userModel');
const Auth = require('../auth/authMiddleware');
const { jsonResponse } = require('../lib/jsonResponse');


router.post('/', Auth.checkAuth, async function(req, res, next){
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
        let newUser = await user.save();
        newUser.password = "";
        res.status(200).json(
          jsonResponse({user: newUser}, "Usuario registrado", 200)
        );
      }
    } catch (error) {
      next(createError(500, "Servicio no disponible"));
    }
  }
});


router.get('/users', Auth.checkAuth, async function(req, res, next) {
  let results = {};
  try {
    results = await User.find({}, '_id username name email phone jobTitle');
  } catch (error) {
    next(createError(500, "Servicio no disponible"));
  }
  res.status(200).json(
    jsonResponse({users: results}, "Lista de usuarios", 200)
  );
});

module.exports = router;
