const express = require('express');
const path = require("path");
const fs = require("fs");

const ProdutoPedido = require("../models/produtoPedido");
const Pedido = require("../models/pedido");
const Produto = require('../models/produto');
const Categoria = require('../models/categoria');
const Endereco = require("../models/endereco");
const Usuario = require("../models/usuario");
const UsuarioEndereco = require("../models/usuarioEndereco");
const {Op} = require("sequelize");

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

const storePedidos = async (req) => {
    const { user, produtos, formaPag, endereco } = req.body;

    console.log(produtos);
    try {
        const userAddresses = await UsuarioEndereco.findAll({
            where: {
                status: 1
            }
        })

        if (userAddresses.length > 0) {
            for (const address of userAddresses) {
                await address.update({ status: 0 });
            }
        }

        const enderecoAtual = (await UsuarioEndereco.findByPk(endereco)).update({
            status: 1
        });


        const prefix = "HDGBR";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let randomSuffix = "";

        for (let i = 0; i < 8; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomSuffix += characters[randomIndex];
        }

        const pedido = await Pedido.create({
            id_usuario: user.id,
            codigo: prefix + randomSuffix,
            status: 'Realizado',
            valorTotal: produtos.valorTotal,
            observacao: produtos.observacao,
            formaPagamento: formaPag
        });


        for (const produto of produtos.produtos) {
            const pedidoProduto = await ProdutoPedido.create({
                id_produto: produto.id,
                id_pedido: pedido.id,
                quantidade: produto.quantidade,
                status: 1
            });
        }

        return true;
    } catch (e) {
        console.log(e.message);
        return e.message;
    }
};

const pedidosCliente = async (req) => {
    console.log(req.params)
    const { id } = req.params;

    try {
        const cliente = await Usuario.findByPk(id);

        const pedidos = await Pedido.findAll({
            where: {
                id_usuario: cliente.id
            }
        });

        const pedidoIds = pedidos.map(pedido => pedido.id);

        const produtosPedidos = await ProdutoPedido.findAll({
            where: {
                id_pedido: {
                    [Op.in]: pedidoIds
                }
            }
        });

        const produtosComDetalhes = await Promise.all(
            produtosPedidos.map(async (produtoPedido) => {
                const produto = await Produto.findByPk(produtoPedido.id_produto, {
                    attributes: ['nome']
                });

                const pedido = await Pedido.findByPk(produtoPedido.id_pedido);

                return {
                    pedidoId: pedido.id,
                    codigo: pedido.codigo,
                    nome_produto: produto ? produto.nome : 'Produto não encontrado',
                    quantidade: produtoPedido.quantidade,
                    status: pedido.status,
                };
            })
        );

        const pedidosAgrupados = produtosComDetalhes.reduce((acc, produto) => {
            if (!acc[produto.pedidoId]) {
                acc[produto.pedidoId] = {
                    codigo: produto.codigo,
                    status: produto.status,
                    produtos: []
                };
            }
            acc[produto.pedidoId].produtos.push({
                nome_produto: produto.nome_produto,
                quantidade: produto.quantidade,
            });
            return acc;
        }, {});

        return Object.values(pedidosAgrupados);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return  'Erro ao buscar produtos';
    }
};
module.exports = { indexPedidos, getPedidos, updatePedidos, destroyPedidos, storePedidos, pedidosCliente };
