const Sequelize = require('sequelize');
const database = require('../db');

const PersonalAccessTokens = database.define('personal_access_tokens', {
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
    tipo_usuario: {
        type: Sequelize.ENUM ('Cliente', 'Admin'),
    },
    token:{
        type: Sequelize.TEXT,
        allowNull: false,
    },
    expires_at:{
        type: Sequelize.DATE,
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

module.exports = PersonalAccessTokens;