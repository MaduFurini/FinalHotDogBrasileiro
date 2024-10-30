'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('pedidos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      codigo:{
        type: Sequelize.STRING,
        allowNull: false
      },
      status:{
        type: Sequelize.ENUM ('Realizado', 'Em andamento', 'Entregue', 'Cancelado', 'Inativado'),
        allowNull: false,
      },
      valorTotal:{
        type: Sequelize.DOUBLE,
        allowNull: false,
        default: 0.0
      },
      observacao:{
        type: Sequelize.TEXT,
        allowNull: true
      },
      formaPagamento:{
        type: Sequelize.ENUM ('debito', 'credito', 'dinheiro', 'pix'),
        allowNull: false
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
    await queryInterface.dropTable('pedidos');
  }
};
