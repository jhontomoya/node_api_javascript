var express = require('express');
var router = express.Router();
const createError = require('http-errors');
const Product = require('../model/productModel');
const Auth = require('../auth/authMiddleware');
const { jsonResponse } = require('../lib/jsonResponse');

router.post('/', Auth.checkAuth, async function(req, res, next){
  const { title, price, department } = req.body;
  let result = {};
  if(!title || !price || !department){
    next(createError(404, "Faltan datos por enviar"));
  } else if(title && price && department){
    try {
      const product = new Product({title, price, department});
      result = await product.save();
    } catch (error) {
      console.log(error)
      next(createError(500, "Servicio no disponible"));
    }
    res.status(200).json(
      jsonResponse({product: result}, "Producto registrado", 200)
    );
  } else {
    next(createError(404, "No se permiten datos en null"));
  }
});

router.get('/products', Auth.checkAuth, async function(req, res, next){
  let results = {};
  try {
    results = await Product.find({});
  } catch (error) {
    next(createError(500, "Servicio no disponible"));
  }
  res.status(200).json(
    jsonResponse({products: results}, "Lista de productos", 200)
  );
});

router.get('/products/:idproduct', Auth.checkAuth, async function(req, res, next){
  let result = {};
  const { idproduct } = req.params;
  if(!idproduct) next(createError(404, "Se requiere un Id"));
  try {
    result = await Product.findById(idproduct);
  } catch (error) {
    next(createError(500, "Servicio no disponible"));
  }
  res.status(200).json(
    jsonResponse({product: result}, "Información del producto", 200)
  );
});

router.patch('/', Auth.checkAuth, async function(req, res, next){
  let update = {};
  let result = {};
  const { id, title, price, department } = req.body;
  if(!id || !title || !price || !department){
    next(createError(404, "Faltan datos por enviar"));
  } else if(id && title && price && department){
    try {
      update['title'] = title;
      update['price'] = price;
      update['department'] = department;
      result = await Product.findByIdAndUpdate(id, update);
    } catch (error) {
      next(createError(500, "Servicio no disponible"));
    }
    res.status(200).json(
      jsonResponse({product: result}, "Se actualizo el producto", 200)
    );
  } else {
    next(createError(404, "No se permiten datos en null"));
  }
});

router.delete('/products/:idproduct', Auth.checkAuth, async function(req, res, next){
  let result = {};
  const {idproduct} = req.params;
  try {
    result = await Product.findByIdAndDelete(idproduct);
  } catch (error) {
    next(createError(500, "Servicio no disponible"));
  }
  res.status(200).json(
    jsonResponse({product: result}, "Se elimino el producto", 200)
  );
});

module.exports = router;