const Sequelize = require('sequelize');
const database = require('../db');

const ProdutoPedido = database.define('produto_pedidos', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    id_produto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'produtos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    id_pedido: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'pedidos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    quantidade:{
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 1
    },
    status:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
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

module.exports = ProdutoPedido;