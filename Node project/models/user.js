const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const Post = require('./post');

const User = sequelize.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'I am new!'
    },
    // posts: [{
    //     type: Sequelize.JSON,
    //     // references: {
    //     //     model: Post,
    //     //     key: 'id'
    //     // }
    // }]
});

module.exports = User;