const Mongoose = require('mongoose');

const ProductSchema = new Mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  price:{
    type: Number,
    required: true
  },
  department:{
    type: String,
    required: true
  },
  createdDate:{
    type: Date
  },
  updatedDate:{
    type: Date
  }
});

ProductSchema.pre('save', function (next) {
  this.createdDate = new Date();
  this.updatedDate = null;
  next();
});

ProductSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
  this._update.updatedDate = new Date();
  next();
});

module.exports = Mongoose.model('Product', ProductSchema);