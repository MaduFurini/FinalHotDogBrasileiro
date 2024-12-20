'use strict';

const bodyParser = require("body-parser");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('enderecos', {
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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('enderecos');
  }
};
