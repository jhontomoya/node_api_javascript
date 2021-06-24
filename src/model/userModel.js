require('dotenv').config();

const Mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN, REFRESH_TOKEN } = process.env;

const Token = require('./tokenModel');

const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: Number
  },
  jobTitle: {
    type: String
  },
  createdDate:{
    type: Date
  },
  updatedDate:{
    type: Date
  }
});

UserSchema.pre('save', function (next) {
  if( this.isModified('password') || this.isNew ){
    const document = this;
    document.createdDate = new Date();
    document.updatedDate = null;
    bcrypt.hash(document.password, 10, (err, hash) => {
      if(err){
        next(err)
      } else {
        document.password = hash;
        next();
      }
    })
  } else {
    next();
  }
});

UserSchema.methods.userNameExists = async function(username) {
  try {
    let result = await Mongoose.model('User').find({username: username});
    return result.length > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
}

UserSchema.methods.isCorrectPassword = async function(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.log(error);
    return false;
  }
}

UserSchema.methods.createAccessToken = function(){
  const { id, username} = this;
  return jwt.sign(
    {
    user:{id, username}
    }, 
    ACCESS_TOKEN, 
    { 
      expiresIn: '5m'
    }
  );
}

UserSchema.methods.createRefreshToken = async function(){
  const { id, username} = this;
  const refreshToken = jwt.sign(
    {
    user:{id, username}
    }, 
    REFRESH_TOKEN, 
    { 
      expiresIn: '20d'
    }
  );
  try {
    await new Token({token: refreshToken}).save();
    return refreshToken;
  } catch (error) {
    next(new Error('Error creating refresfh token'));
  }
}

module.exports = Mongoose.model('User', UserSchema);