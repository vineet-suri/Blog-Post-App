const User = require('../models/user');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
  
    if(!errors.isEmpty()){
        const error = new Error('Validation failed!');
        error.statusCode = 422;
        error.data= errors.array();
        throw error;
    }

    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;

    try{
      const hashedPw = await bcrypt.hash(password, 12)
      const user = await User.create({
              name: name,
              email:email,
              password:hashedPw
          })
    res.status(201).json({
    message: 'User created successfully!',
    userId: user.id
      })
  } catch (err) {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  try {
  const user = await User.findOne({where: { email: email}});
  if(!user){
    const error = new Error('User with that email not found.');
    error.statusCode = 401;
    throw error;
  }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);

    if(!isEqual){
        const error = new Error('Passowrd doesnt match.');
        error.statusCode = 401;
        throw error;
      }
      
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser.id
        },
        'secretstring',
        { expiresIn: '1h'}
      );
      res.status(200).json({ token: token, userId: loadedUser.id });
      } catch (err) {
        if(!err.statusCode){
          err.statusCode = 500;
        }
        next(err);
      }
};