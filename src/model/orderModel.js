const Mongoose = require('mongoose');
const createError = require('http-errors');
const User = require('./userModel');
const Product = require('./productModel');

const OrderSchema = new Mongoose.Schema({
  idUser:{
    type: String,
    required: true
  },
  productList:[
    {
      idProduct: String,
      title: String,
      price: Number,
      qty: Number
    }
  ],
  total:{
    type: Number,
    default: 0
  },
  createdDate:{
    type: Date
  },
  updatedDate:{
    type: Date
  }
});

OrderSchema.pre('save', async function (next) {
  this.createdDate = new Date();
  this.updatedDate = new Date();
  if(this.isModified('productList') || this.isNew){
    const document = this;
    const idUser = document.idUser;
    const productList = document.productList;
    document.total = 0;
    let user;
    let promises = [];
    try {
      user = await User.findById(idUser);
    } catch (error) {
      next(new Error("Usuario no encontrado"));
    }
    if(user){
      try {
        if(productList === 0){
          next(new Error("No hay productos en la lista"));
        } else {
          for(const product of productList){
            promises.push(await Product.findById(product.idProduct))
          }
          const resultPromises = await Promise.all(promises);
          resultPromises.forEach((product, index) => {
            document.total += product.price * productList[index].qty;
            document.productList[index].title = product.title;
            document.productList[index].price = product.price;
            document.productList[index].department = product.department;
          });
        }
      } catch (error) {
        next(new Error("Error en la informacion de los productos"));
      }
    }
  } else {
    next();
  }
});


module.exports = Mongoose.model('Order', OrderSchema);