const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Post = sequelize.define('post', {    
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull:false
    },
    content: {
        type: Sequelize.STRING,
        allowNull:false
    },
    creator: {
        type: Sequelize.JSON,
        allowNull:false
    }      
});

module.exports = Post;