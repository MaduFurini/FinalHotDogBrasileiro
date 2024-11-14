const express = require('express');
const path = require("path");
const fs = require("fs");

const Endereco = require("../models/endereco");
const EnderecoUser = require('../models/usuarioEndereco');
const {Op} = require("sequelize");

const indexEnderecos = async (req, user) => {
    user = user.user;

    console.log(user);
    try {
        const enderecosUser = await EnderecoUser.findAll({
            where: {
                id_cliente: user.id
            }
        });

        const enderecoIds = enderecosUser.map(enderecoUser => enderecoUser.id_endereco);

        const endereco = await Endereco.findAll({
            where: {
                id: {
                    [Op.in]: enderecoIds
                }
            }
        });

        return endereco;
    } catch (error) {
        console.error("Erro ao listar endereços:", error);
        return { error: "Erro ao listar endereços" };
    }
};

module.exports = { indexEnderecos };
