const Sequelize = require('sequelize');

const sequelize = new Sequelize('rest-api-project', 'root',  'jsatsf', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;