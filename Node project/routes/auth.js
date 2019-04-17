const express = require('express');
const { body } = require('express-validator/check');
const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express();

router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter valid email')
        .normalizeEmail(),
        // .customValidator(value => {
        //     User.findOne({where: {email: value}}).then(userDoc => {
        //         if(userDoc){
        //             return Promise.reject('E-Mail address already exists!');
        //         }
        //     })
        // }) ,
      
        // .custom((value, { req }) => {
        //     User.findAndCountAll({where: {email: value}}).then(result => {
        //         if(result.count > 0)
        //             return Promise.reject('E-Mail address already exists!');
        //     })
        // }),
    body('name').trim().isLength({min: 5}),
    body('password').trim().isLength({min: 5})
], authController.signup);

router.post('/login', authController.login);

module.exports = router;