const { Sequelize } = require('sequelize');

const database = new Sequelize('newHotDog', 'Furini', '1234', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = database;