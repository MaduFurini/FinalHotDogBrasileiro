const express = require('express');
const path = require("path");
const bcrypt = require('bcrypt');

const ProdutoPedido = require("../models/produtoPedido");
const Produto = require('../models/produto');
const Categoria = require('../models/categoria');
const RegistroLog = require('../models/registroLogs');
const Funcionario = require('../models/usuario');
const Sequelize = require("sequelize");

const indexFuncionarios = async (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    try {
        const { count, rows: funcionarios } = await Funcionario.findAndCountAll({
            where: {
                tipo_usuario: 'admin'
            },
            limit: limit,
            offset: offset
        });
        const totalPages = Math.ceil(count / limit);

        return { funcionarios, currentPage: page, totalPages };
    } catch (error) {
        console.error("Erro ao listar funcionários:", error);
        return { error: "Erro ao listar funcionários" };
    }
};

async function getFuncionarios(req, res) {
    const funcionarioId = req.params.id;
    try {
        const funcionario = await Funcionario.findByPk(funcionarioId);
        if (!funcionario) {
            return { error: 'Funcionário não encontrada' };
        }

        return funcionario;
    } catch (error) {
        console.error('Erro ao buscar funcionário:', error);
        return { error: 'Erro ao buscar funcionário' };
    }
}

const storeFuncionarios = async (req) => {
    const { nome, cpf, email, senha } = req.body;

    try {
        const senhaHasheada = await bcrypt.hash(senha, 10);

        const user = await Funcionario.findOne({
            where: {
                email: email
            }
        });

        if (user) {
            return { success: false, message: 'Email já existente' };
        }

        await Funcionario.create({
            nome,
            cpf,
            email,
            senha: senhaHasheada,
            tipo_usuario: 'admin',
            status: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return { success: true, message: 'Funcionário criado com sucesso.' };
    } catch (e) {
        console.log(e.message);
        return { success: false, message: `Erro: ${e.message}` };
    }
};

const updateFuncionarios = async (req) => {
    const { nome, cpf, email, senha } = req.body;
    const { id } = req.params;

    try {
        const funcionario = await Funcionario.findByPk(id);

        if (!funcionario) {
            return 'Funcionário não encontrada';
        }

        const senhaHasheada = await bcrypt.hash(senha, 10);

        const user = await Funcionario.findOne({
            where: {
                email: email
            }
        });

        if (user) {
            return { success: false, message: 'Email já existente' };
        }

        funcionario.nome = nome || funcionario.nome;
        funcionario.cpf = cpf || funcionario.cpf;
        funcionario.email = email || funcionario.email;
        funcionario.senha = senhaHasheada || funcionario.senha;

        await funcionario.save();

        return true;
    } catch (error) {
        console.log(error.message)
        return error.message;
    }
};

const updateStatusFuncionarios = async (req) => {
    try {
        return await Funcionario.update(
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
        console.error("Erro ao atualizar status da funcionário:", error);
        return { error: "Erro ao atualizar status da funcionário" };
    }
};

const destroyFuncionarios = async (req) => {
    try {
        const funcionario = await Funcionario.findByPk(req.params.id);

        if (!funcionario) {
            return 'Funcionário não encontrado';
        }

        const registro = await RegistroLog.findOne({ where: { id_usuario: req.params.id } });

        if (registro) {
            funcionario.status = 0;
            await funcionario.save();

            return 'Fucnionário inativado devido a vínculos existentes';
        } else {
            await funcionario.destroy();

            return true;
        }
    } catch (error) {
        console.error('Erro ao processar exclusão:', error);
        return 'Erro ao processar a exclusão do funcionário';
    }
};



module.exports = { indexFuncionarios, getFuncionarios, storeFuncionarios, updateFuncionarios, updateStatusFuncionarios, destroyFuncionarios };
