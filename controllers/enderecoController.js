const express = require('express');
const path = require("path");
const fs = require("fs");

const Endereco = require("../models/endereco");
const EnderecoUser = require('../models/usuarioEndereco');
const {Op} = require("sequelize");
const Categoria = require("../models/categoria");
const Produto = require("../models/produto");
const ProdutoPedido = require("../models/produtoPedido");

const indexEnderecos = async (req, user) => {
    user = user.user;

    console.log(user);
    try {
        const enderecosUser = await EnderecoUser.findAll({
            where: {
                id_cliente: user.id,
            }
        });

        const enderecoIds = enderecosUser.map(enderecoUser => enderecoUser.id_endereco);

        return await Endereco.findAll({
            where: {
                id: {
                    [Op.in]: enderecoIds
                },
                status: 1
            }
        });
    } catch (error) {
        console.error("Erro ao listar endereços:", error);
        return { error: "Erro ao listar endereços" };
    }
};

const storeEnderecos = async (req) => {
    const { endereco, user } = req.body;
    console.log(endereco)
    console.log(user)
    try {
        const address = await Endereco.create({
            logradouro: endereco.nome,
            bairro: endereco.bairro,
            numero: endereco.numero,
            cidade: endereco.cidade,
            estado: endereco.estado,
            complemento: endereco.comp,
            referencia: endereco.ref,
            cep: endereco.cep,
            status: 1
        });

        const userAddress = await EnderecoUser.create({
            id_cliente: user.id,
            id_endereco: address.id,
            status: 0
        })

        return true;
    } catch (e) {
        console.log(e.message);
        return e.message;
    }
};

const destroyEnderecos = async (req) => {
    try {
        const endereco = await Endereco.findByPk(req.params.id);

        console.log(endereco)
        const enderecoUsuario = await EnderecoUser.findOne({ where: { id_endereco: req.params.id } });

        console.log(enderecoUsuario)
        if (enderecoUsuario) {
            enderecoUsuario.status = 0;
            await enderecoUsuario.save();

            endereco.status = 0;
            await endereco.save();

            return true
        } else {
            await endereco.destroy();

            return true;
        }
    } catch (error) {
        console.error('Erro ao processar exclusão:', error);
        return 'Erro ao processar a exclusão do produto';
    }
};


module.exports = { indexEnderecos, storeEnderecos, destroyEnderecos };
