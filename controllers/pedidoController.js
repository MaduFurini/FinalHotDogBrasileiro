const express = require('express');
const path = require("path");
const fs = require("fs");

const ProdutoPedido = require("../models/produtoPedido");
const Pedido = require("../models/pedido");
const Produto = require('../models/produto');
const Categoria = require('../models/categoria');

const indexPedidos = async (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    try {
        const { count, rows: pedidos } = await Pedido.findAndCountAll({
            limit: limit,
            offset: offset
        });
        const totalPages = Math.ceil(count / limit);

        return { pedidos, currentPage: page, totalPages };
    } catch (error) {
        console.error("Erro ao listar pedidos:", error);
        return { error: "Erro ao listar pedidos" };
    }
};

async function getPedidos(req, res) {
    const pedidoId = req.params.id;
    try {
        const pedido = await Pedido.findByPk(pedidoId);
        if (!pedido) {
            return { error: 'Pedido não encontrado' };
        }

        return pedido;
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        return { error: 'Erro ao buscar pedido' };
    }
}

const updatePedidos = async (req) => {
    const { observacao, valor, status, pag } = req.body;
    const { id } = req.params;

    console.log(req.body);
    try {
        const pedido = await Pedido.findByPk(id);

        if (!pedido) {
            return 'Pedido não encontrado';
        }

        pedido.observacao = observacao || pedido.observacao;
        pedido.valorTotal = valor || pedido.valorTotal;
        pedido.status = status || pedido.status;
        pedido.formaPagamento = pag || pedido.formaPagamento;

        await pedido.save();

        return true;
    } catch (error) {
        return error.message;
    }
};

const destroyPedidos = async (req) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id);

        if (!pedido) {
            return 'Pedido não encontrado';
        }


        pedido.status = 'Inativado';
        await pedido.save();

        return 'Pedido inativado devido a vínculos existentes';
    } catch (error) {
        console.error('Erro ao processar exclusão:', error);
        return 'Erro ao processar a exclusão do pedido';
    }
};

module.exports = { indexPedidos, getPedidos, updatePedidos, destroyPedidos };
