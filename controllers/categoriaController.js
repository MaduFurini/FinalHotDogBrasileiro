const express = require('express');
const path = require("path");
const fs = require("fs");

const ProdutoPedido = require("../models/produtoPedido");
const Produto = require('../models/produto');
const Categoria = require('../models/categoria');

const indexCategorias = async (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    try {
        const { count, rows: categorias } = await Categoria.findAndCountAll({
            limit: limit,
            offset: offset
        });
        const totalPages = Math.ceil(count / limit);

        return { categorias, currentPage: page, totalPages };
    } catch (error) {
        console.error("Erro ao listar categorias:", error);
        return { error: "Erro ao listar categorias" };
    }
};

const storeCategorias = async (req) => {
    const { nome, descricao } = req.body;

    try {
        const categoria = await Categoria.create({
            nome: nome,
            descricao: descricao,
            status: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log(categoria)

        return true;
    } catch (e) {
        return e.message;
    }
};

async function getCategorias(req, res) {
    const categoriaId = req.params.id;
    try {
        const categoria = await Categoria.findByPk(categoriaId);
        if (!categoria) {
            return { error: 'Categoria não encontrada' };
        }

        return categoria;
    } catch (error) {
        console.error('Erro ao buscar categoria:', error);
        return { error: 'Erro ao buscar categoria' };
    }
}

const updateCategorias = async (req) => {
    const { nome, descricao } = req.body;
    const { id } = req.params;

    try {
        const categoria = await Categoria.findByPk(id);

        if (!categoria) {
            return 'Categoria não encontrada';
        }

        categoria.nome = nome || categoria.nome;
        categoria.descricao = descricao || categoria.descricao;

        await categoria.save();

        return true;
    } catch (error) {
        return error.message;
    }
};

const updateStatusCategorias = async (req) => {
    try {
        return await Categoria.update(
            {
                status: req.body.status ? 1 : 0
            },
            {
                where: {
                    id: req.params.id,
                },
            }
        );

    } catch (error) {
        console.error("Erro ao atualizar status da categoria:", error);
        return { error: "Erro ao atualizar status da categoria" };
    }
};

const destroyCategorias = async (req) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);

        if (!categoria) {
            return 'Categoria não encontrada';
        }

        const produto = await Produto.findOne({ where: { id_categoria: req.params.id } });

        if (produto) {
            categoria.status = 0;
            await categoria.save();

            return 'Categoria inativada devido a vínculos existentes';
        } else {
            await categoria.destroy();

            return true;
        }
    } catch (error) {
        console.error('Erro ao processar exclusão:', error);
        return 'Erro ao processar a exclusão da categoria';
    }
};



module.exports = { indexCategorias, storeCategorias, getCategorias, updateCategorias, updateStatusCategorias, destroyCategorias };
