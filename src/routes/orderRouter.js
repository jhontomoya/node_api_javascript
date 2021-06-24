var express = require('express');
var router = express.Router();
const createError = require('http-errors');
const Order = require('../model/orderModel');
const Auth = require('../auth/authMiddleware');
const { jsonResponse } = require('../lib/jsonResponse');

router.post('/', Auth.checkAuth, async function(req, res, next){
  const { idUser, productList } = req.body;
  let result = {};
  if(!idUser || !productList){
    next(createError(404, "Faltan datos por enviar"));
  } else if(idUser && productList && productList.length > 0){
    try {
      const order = new Order({idUser, productList});
      result = await order.save();
    } catch (error) {
      return next(createError(404, error));
    }
    res.status(200).json(
      jsonResponse({order: result}, "Orden registrada", 200)
    );
  } else {
    next(createError(404, "No se permiten datos en null"));
  }
});

router.get('/orders', Auth.checkAuth, async function(req, res, next){
  let results = {};
  try {
    results = await Order.find({});
  } catch (error) {
    next(createError(500, "Servicio no disponible"));
  }
  res.status(200).json(
    jsonResponse({orders: results}, "Lista de ordenes", 200)
  );
});

module.exports = router;