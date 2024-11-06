const Sequelize = require('sequelize');
const database = require('../db');

const RegistroLogs = database.define('registro_logs', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    id_referencia: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    tipo_referencia: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    acao:{
        type: Sequelize.ENUM ('store', 'update', 'delete'),
        allowNull: false
    },
    estado_anterior:{
        type: Sequelize.JSON,
        allowNull: false
    },
    mensagem:{
        type: Sequelize.STRING,
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

module.exports = RegistroLogs;