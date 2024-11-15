const { Sequelize } = require('sequelize');

const database = new Sequelize('DBName', 'User', 'Password', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = database;