const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require("path");
const { Op } = require('sequelize');

const Categoria = require("../models/categoria");
const Produto = require('../models/produto');
const ProdutoPedido = require('../models/produtoPedido');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/produtos');
    },
    filename: function (req, file, cb) {
        const tempFileName = 'temp_' + Date.now() + path.extname(file.originalname);
        cb(null, tempFileName);
    }
});

const upload = multer({ storage: storage });

const indexProdutos = async (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    try {
        const { count, rows: produtos } = await Produto.findAndCountAll({
            limit: limit,
            offset: offset
        });

        const categoriaIds = produtos.map(produto => produto.id_categoria);

        const categorias = await Categoria.findAll({
            where: {
                id: categoriaIds
            }
        });

        const categoriaMap = {};
        categorias.forEach(categoria => {
            categoriaMap[categoria.id] = categoria.nome;
        });

        const produtosComCategoria = produtos.map(produto => ({
            ...produto.dataValues,
            categoria: categoriaMap[produto.id_categoria] || 'Categoria não encontrada'
        }));

        const totalPages = Math.ceil(count / limit);

        return { produtos: produtosComCategoria, currentPage: page, totalPages };
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        return { error: "Erro ao listar produtos" };
    }
};

const indexProdutosCardapio = async (req, res) => {
    try {
        const produtos = await Produto.findAll({
            where: { status: 1 },
        });

        const categoriaIds = [...new Set(produtos.map(p => p.id_categoria))];

        const categorias = await Categoria.findAll({
            where: {
                id: { [Op.in]: categoriaIds },
            },
        });

        const produtosPorCategoria = categorias.reduce((map, categoria) => {
            map[categoria.id] = produtos.filter(
                produto => produto.id_categoria === categoria.id
            );
            return map;
        }, {});


        return { categorias, produtosPorCategoria };
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        res.status(500).render('cardapio/cardapio', {
            categorias: [],
            produtosPorCategoria: {},
            error: "Erro ao listar produtos."
        });
    }
};

const storeProdutos = async (req) => {
    const { id_categoria, nome, descricao, preco } = req.body;

    try {
        const produto = await Produto.create({
            id_categoria: parseInt(id_categoria),
            nome: nome,
            descricao: descricao,
            preco: preco,
            img: '',
            status: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        if (req.file) {
            const newFileName = `${produto.id}${path.extname(req.file.originalname)}`;
            const newFilePath = path.join('public/images/produtos', newFileName);

            fs.renameSync(req.file.path, newFilePath);

            produto.img = `/images/produtos/${newFileName}`;
            await produto.save();
        }

        return true;
    } catch (e) {
        return e.message;
    }
};

const updateStatusProdutos = async (req) => {
    try {
        return await Produto.update(
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
        console.error("Erro ao atualizar status do produto:", error);
        return { error: "Erro ao atualizar status do produto" };
    }
};

const updateProdutos = async (req) => {
    const { id_categoria, nome, descricao, preco } = req.body;
    const { id } = req.params;

    try {
        const produto = await Produto.findByPk(id);

        if (!produto) {
            return 'Produto não encontrado';
        }

        produto.id_categoria = id_categoria || produto.id_categoria;
        produto.nome = nome || produto.nome;
        produto.descricao = descricao || produto.descricao;
        produto.preco = preco || produto.preco;

        if (req.file) {
            const newFileName = `${produto.id}${path.extname(req.file.originalname)}`;
            const newFilePath = path.join('public/images/produtos', newFileName);

            fs.renameSync(req.file.path, newFilePath);

            produto.img = `/images/produtos/${newFileName}`;
            await produto.save();
        }

        await produto.save();

        return true;
    } catch (error) {
        return error.message;
    }
};

async function getProdutos(req, res) {
    const productId = req.params.id;
    try {
        const product = await Produto.findByPk(productId);
        if (!product) {
            return { error: 'Produto não encontrado' };
        }

        return product;
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return { error: 'Erro ao buscar produto' };
    }
}

const destroyProdutos = async (req) => {
    try {
        const produto = await Produto.findByPk(req.params.id);

        if (!produto) {
            return 'Produto não encontrado';
        }

        const produtoPedido = await ProdutoPedido.findOne({ where: { id_produto: req.params.id } });

        if (produtoPedido) {
            produto.status = 0;
            await produto.save();

            return 'Produto inativado devido a vínculos existentes';
        } else {
            if (produto.img){
                const imagePath = path.join('public', produto.img);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            await produto.destroy();

            return true;
        }
    } catch (error) {
        console.error('Erro ao processar exclusão:', error);
        return 'Erro ao processar a exclusão do produto';
    }
};


module.exports = { upload, indexProdutos, storeProdutos, updateStatusProdutos, updateProdutos, getProdutos, destroyProdutos, indexProdutosCardapio };
