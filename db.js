const { Sequelize } = require('sequelize');

const database = new Sequelize('newHotDog', 'root', 'S3mpher@0102', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = database;