const Sequelize = require('sequelize');
const database = require('../db');

const Endereco = database.define('enderecos', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    logradouro:{
        type: Sequelize.STRING,
        allowNull: false
    },
    bairro:{
        type: Sequelize.STRING,
        allowNull: true
    },
    numero:{
        type: Sequelize.STRING,
        allowNull: false
    },
    cep:{
        type: Sequelize.STRING,
        allowNull: false
    },
    cidade:{
        type: Sequelize.STRING,
        allowNull: false
    },
    estado:{
        type: Sequelize.STRING,
        allowNull: false
    },
    complemento:{
        type: Sequelize.STRING,
        allowNull: false
    },
    referencia:{
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        default: true
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
});

module.exports = Endereco;