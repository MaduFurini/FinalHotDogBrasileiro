// ===== IMPORTAÇÕES DE BIBLIOTECA =====
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require("fs");
const jwt = require('jsonwebtoken');

// ===== CONFIGURAÇÕES DO SERVER =====
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ===== INSTÂNCIAS =====
const db = require('./db');
const { Op } = require('sequelize');

// ===== INSTÂNCIAS DE MODELS =====
const Produto = require('./models/produto');
const Categoria = require('./models/categoria');
const Usuario = require('./models/usuario');
const PedidoProduto = require('./models/produtoPedido');
const Pedido = require('./models/pedido');
const Token = require('./models/personalAccessTokens');

// ===== INSTÂNCIAS DE CONTROLLER =====
const {
    upload,
    indexProdutos,
    storeProdutos,
    updateStatusProdutos,
    updateProdutos,
    getProdutos,
    destroyProdutos
} = require('./controllers/produtoController');
const {
    indexCategorias,
    storeCategorias,
    getCategorias,
    updateCategorias,
    updateStatusCategorias,
    destroyCategorias
} = require('./controllers/categoriaController');
const {
    indexFuncionarios,
    getFuncionarios,
    storeFuncionarios,
    updateFuncionarios,
    updateStatusFuncionarios,
    destroyFuncionarios
} = require('./controllers/funcionarioController');
const {
    indexPedidos,
    getPedidos,
    updatePedidos,
    destroyPedidos
} = require('./controllers/pedidoController');
const {
    sendOtpEmail,
    generateOtp
} = require('./controllers/authController');
const Funcionario = require("./models/usuario");
const e = require("express");

// ===== ROTAS DE GERENCIAMENTO DE LOGIN =====
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const user = await Usuario.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.status(401).json({ message: 'Senha inválida' });
        }

        const tokenExistence = await Token.findOne({ where: {
                id_usuario: user.id,
                tipo_usuario: user.tipo_usuario,
            } });

        if (tokenExistence) {
            await tokenExistence.destroy();
        }

        const token = jwt.sign({ id: user.id, tipo_usuario: user.tipo_usuario }, 'secret_key', { expiresIn: '1h' });
        const expiresAt = new Date(Date.now() + 3600 * 1000 - (3 * 60 * 60 * 1000));

        await Token.create({
            id_usuario: user.id,
            tipo_usuario: user.tipo_usuario,
            token: token,
            expires_at: expiresAt
        });

        return res.redirect(`/home?userId=${user.id}&token=${token}`);

    } catch (error) {
        console.error('Erro ao autenticar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
app.post('/forgotPassword', async (req, res) => {
    const { email } = req.body;

    const otp = generateOtp();

    try {
        const user = await Usuario.findOne({
            where: { email: email }
        });

        if (user) {
            await user.update({
                otp: otp,
                otp_expiresAt:  new Date(Date.now() + 15 * 60 * 1000)
            });
            sendOtpEmail(email, otp);
            return res.redirect(`/resetPassword?email=${email}`);
        }

        res.status(500).json({ message: 'Email não encontrado' });
    } catch (error) {
        console.error('Erro ao enviar OTP:', error);
        res.status(500).json({ message: 'Erro ao enviar OTP' });
    }
});
app.post('/resetPassword', async (req, res) => {
    const { otp, email } = req.body;

    try {
        const usuario = await Usuario.findOne({
            where: { email: email }
        });

        if (usuario.otp.toString() === otp) {
            console.log(usuario.id)
            return res.redirect(`/newPassword?userId=${usuario.id}&email=${email}`);
        } else {
            console.log('OTP não corresponde.');
            return res.status(400).json({ message: 'OTP não corresponde.' });
        }


    } catch (error) {
        console.error('Erro ao encontrar email:', error);
        res.status(500).json({ message: 'Erro ao encontrar email' });
    }
});
app.post('/newPassword', async (req, res) => {
    const { password, confirmPassword, email, userId } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(confirmPassword, salt);

        const usuario = await Usuario.findByPk(userId);

        console.log(usuario)

        if (usuario) {
            await Usuario.update(
                { senha: hash, otp: null },
                { where: { id: usuario.id } }
            );

            const token = jwt.sign({ id: usuario.id, email: usuario.email }, 'seu_segredo', {
                expiresIn: '1h'
            });

            return res.redirect('/home');
        }

        return res.status(404).json({ message: 'Usuário não encontrado' });

    } catch (e) {
        console.error('Erro ao atualizar senha:', e);
        return res.status(500).json({ message: 'Erro ao atualizar senha' });
    }
});

// ===== ROTAS DE GERENCIAMENTO DE CLIENTES =====
app.post('/clientes/create', async (req, res) => {
    const { nome, email, senha, cpf } = req.body;

    const user = await Funcionario.findOne({
        where: {
            [Op.or]: [
                {email: email},
                {cpf: cpf}
            ]
        }
    });

    if (user) {
        let message;
        if (user.email === email) {
            message = 'Email já existente';
        } else {
            message = 'CPF já existente';
        }
        return {success: false, message};
    }


    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(senha, salt);

    try {
        const cliente = await Usuario.create({
            nome: nome,
            email: email,
            senha: hash,
            cpf: cpf,
            tipo_usuario: 'cliente',
            status: 1
        });

        const tokenExistence = await Token.findOne({ where: {
                id_usuario: cliente.id,
                tipo_usuario: 'cliente',
            } });

        if (tokenExistence) {
            await tokenExistence.destroy();
        }

        const token = jwt.sign({ id: cliente.id, tipo_usuario: 'Cliente' }, 'secret_key', { expiresIn: '1h' });
        const expiresAt = new Date(Date.now() + 3600 * 1000 - (3 * 60 * 60 * 1000));

        await Token.create({
            id_usuario: cliente.id,
            tipo_usuario: 'Cliente',
            token: token,
            expires_at: expiresAt
        });

        return res.redirect(`/home?userId=${cliente.id}&token=${token}`);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'Email já existe' });
        } else {
            res.status(500).json({ message: 'Erro ao criar cliente', error });
        }
    }
});


// ===== ROTAS DE GERENCIAMENTO DE PRODUTOS =====
app.get('/produtos', async(req, res) => {
    const response = await indexProdutos(req);

    console.log(response);
    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    res.render('admin/produtos', {
        produtos: response.produtos,
        currentPage: response.currentPage,
        totalPages: response.totalPages
    });
});
app.get('/produtos/cardapio', async(req, res) => {
    const response = await indexProdutos(req);

    console.log(response);
    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    res.render('admin/produtos', {
        produtos: response.produtos,
        currentPage: response.currentPage,
        totalPages: response.totalPages
    });
});
app.get('/produtos/search' , async (req, res) => {
    const nome = req.query.nome;

    let produtos = null;
    try {
        if (nome) {
            produtos = await Produto.findAll({
                where: {
                    nome: {
                        [Op.like]: `%${nome}%`
                    }
                },
                limit: 5
            })
        }else {
            produtos = await Produto.findAll({
                limit: 5
            });
        }

        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
});
app.get('/produtos/:id' , async (req, res) => {
    const response = await getProdutos(req, res);

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    res.json(response);
});
app.post('/produto/create', upload.single('imagem'), async (req, res) => {
    try {
        const response = await storeProdutos(req);

        if (response === true) {
            res.redirect('/produtos?success=true&message=Produto criado com sucesso!');
        } else {
            res.redirect('/produtos?success=false&message=${encodeURIComponent(response)}');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        res.redirect('/produtos?success=false&message=Erro ao criar produto');
    }
});
app.post('/produtos/update/:id', upload.single('imagemUpdate'), async (req, res) => {
    try {
        const response = await updateProdutos(req);

        if (response === true) {
            res.redirect('/produtos?success=true&message=Produto atualizado com sucesso!');
        } else {
            res.redirect('/produtos?success=false&message=${encodeURIComponent(response)}');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        res.redirect('/produtos?success=false&message=Erro ao atualizar produto');
    }
})
app.put('/produtos/status/:id', async (req, res) => {
    try {
        await updateStatusProdutos(req);
        res.status(200).json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o status do produto', error });
    }
});
app.put('/produtos/removeImage/:id' ,async (req, res) => {
    try {
        const produto = await Produto.findByPk(req.params.id);

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        if (produto.img) {
            const imagePath = path.join('public', produto.img);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }

            produto.img = null;
            await produto.save();
        }

        res.status(200).json({ message: 'Imagem removida com sucesso' });
    } catch (error) {
        console.error('Erro ao remover imagem:', error);
        res.status(500).json({ message: 'Erro ao remover imagem', error });
    }
});
app.delete('/produtos/delete/:id' ,async (req, res) => {
    try {
        const response = await destroyProdutos(req);

        if (response === true) {
            res.json({ message: 'Produto excluído com sucesso' });
        } else {
            res.json({ message: response });
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ message: 'Erro ao excluir produto' });
    }
});

// ===== ROTAS DE GERENCIAMENTO DE CATEGORIAS =====
app.get('/categorias', async (req, res) => {
    const response = await indexCategorias(req);

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    res.render('admin/categorias', {
        categorias: response.categorias,
        currentPage: response.currentPage,
        totalPages: response.totalPages
    });
});
app.get('/categorias/all', async (req, res) => {
    try {
        const categorias = await Categoria.findAll({
            where: {
                status: 1
            }
        });

        res.json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar categorias');
    }
});
app.get('/categorias/search' , async (req, res) => {
    const nome = req.query.nome;

    let categorias = null;
    try {
        if (nome) {
            categorias = await Categoria.findAll({
                where: {
                    nome: {
                        [Op.like]: `%${nome}%`
                    }
                },
                limit: 5
            })
        }else {
            categorias = await Categoria.findAll({
                limit: 5
            });
        }

        res.json(categorias);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
});
app.get('/categorias/:id' , async (req, res) => {
    const response = await getCategorias(req, res);

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    res.json(response);
});
app.post('/categoria/create', async (req, res) => {
    try {
        const response = await storeCategorias(req);

        if (response === true) {
            res.redirect('/categorias?success=true&message=Categoria criada com sucesso!');
        } else {
            res.redirect('/categorias?success=false&message=${encodeURIComponent(response)}');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        res.redirect('/categorias?success=false&message=Erro ao criar categoria');
    }
});
app.post('/categorias/update/:id', async (req, res) => {
    try {
        const response = await updateCategorias(req);

        if (response === true) {
            res.redirect('/categorias?success=true&message=Categorias atualizada com sucesso!');
        } else {
            res.redirect('/categorias?success=false&message=${encodeURIComponent(response)}');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        res.redirect('/categorias?success=false&message=Erro ao atualizar categoria');
    }
})
app.put('/categorias/status/:id', async (req, res) => {
    try {
        await updateStatusCategorias(req);
        res.status(200).json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o status da categoria', error });
    }
});
app.delete('/categorias/delete/:id' ,async (req, res) => {
    try {
        const response = await destroyCategorias(req);

        if (response === true) {
            res.json({ message: 'Categoria excluída com sucesso' });
        } else {
            res.json({ message: response });
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ message: 'Erro ao excluir produto' });
    }
});

// ===== ROTAS DE GERENCIAMENTO DE FUNCIONÁRIOS =====
app.get('/funcionarios', async (req, res) => {
    const response = await indexFuncionarios(req);

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    res.render('admin/funcionarios', {
        funcionarios: response.funcionarios,
        currentPage: response.currentPage,
        totalPages: response.totalPages
    });
});
app.get('/funcionarios/search' , async (req, res) => {
    const nome = req.query.nome;

    let funcionarios = null;
    try {
        if (nome) {
            funcionarios = await Usuario.findAll({
                where: {
                    nome: {
                        [Op.like]: `%${nome}%`
                    },
                    tipo_usuario: 'admin'
                },
                limit: 5
            })
        }else {
            funcionarios = await Usuario.findAll({
                where: {
                    tipo_usuario: 'admin'
                },
                limit: 5
            });
        }

        res.json(funcionarios);
    } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
        res.status(500).json({ message: 'Erro ao buscar funcionários' });
    }
});
app.get('/funcionarios/:id' , async (req, res) => {
    const response = await getFuncionarios(req, res);

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    res.json(response);
});
app.post('/funcionario/create', async (req, res) => {
    try {
        const response = await storeFuncionarios(req);

        if (response.success) {
            return res.redirect('/funcionarios?success=true&message=Funcionário criado com sucesso!');
        } else {
            return res.redirect(`/funcionarios?success=false&message=${encodeURIComponent(response.message)}`);
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        return res.redirect('/funcionarios?success=false&message=Erro ao criar funcionário');
    }
});
app.post('/funcionarios/update/:id', async (req, res) => {
    try {
        const response = await updateFuncionarios(req);

        if (response.success) {
            return res.redirect('/funcionarios?success=true&message=Funcionário criado com sucesso!');
        } else {
            return res.redirect(`/funcionarios?success=false&message=${encodeURIComponent(response.message)}`);
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        return res.redirect('/funcionarios?success=false&message=Erro ao atualizar funcionário');
    }
})
app.put('/funcionarios/status/:id', async (req, res) => {
    try {
        await updateStatusFuncionarios(req);
        res.status(200).json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o status do funcionário', error });
    }
});
app.delete('/funcionarios/delete/:id' ,async (req, res) => {
    try {
        const response = await destroyFuncionarios(req);

        if (response === true) {
            res.json({ message: 'Funcionário excluído com sucesso' });
        } else {
            res.json({ message: response });
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ message: 'Erro ao excluir funcionário' });
    }
});

// ===== ROTAS DE GERENCIAMENTO DE PEDIDOS =====
app.get('/pedidos', async (req, res) => {
    const response = await indexPedidos(req);

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    res.render('admin/pedidos', {
        pedidos: response.pedidos,
        currentPage: response.currentPage,
        totalPages: response.totalPages
    });
});
app.get('/pedidos/all', async (req, res) => {
    try {
        const categorias = await Categoria.findAll({
            where: {
                status: 1
            }
        });

        res.json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar categorias');
    }
});
app.get('/pedidos/:id/produtos', async (req, res) => {
    try {
        const pedidoId = req.params.id;

        const pedidoValue = await Pedido.findByPk(pedidoId);

        const cliente = await Usuario.findByPk(pedidoValue.id_usuario, {
            attributes: ['nome']
        });

        const pedidos = await PedidoProduto.findAll({
            where: { id_pedido: pedidoId }
        });

        if (pedidos.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado para este pedido.' });
        }

        const produtosComNomes = await Promise.all(
            pedidos.map(async (pedido) => {
                const produto = await Produto.findByPk(pedido.id_produto, {
                    attributes: ['nome']
                });

                return {
                    id_produto: pedido.id_produto,
                    nome: produto ? produto.nome : 'Produto não encontrado',
                    quantidade: pedido.quantidade,
                    status: pedido.status,
                    cliente: cliente ? cliente.nome : 'Cliente não encontrado'
                };
            })
        );

        res.json(produtosComNomes);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
});
app.get('/pedidos/search' , async (req, res) => {
    const codigo = req.query.codigo;

    let pedidos = null;
    try {
        if (codigo) {
            pedidos = await Pedido.findAll({
                where: {
                    codigo: {
                        [Op.like]: `%${codigo}%`
                    }
                },
                limit: 5
            })
        }else {
            pedidos = await Pedido.findAll({
                limit: 5
            });
        }

        res.json(pedidos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
});
app.get('/pedidos/:id' , async (req, res) => {
    const response = await getPedidos(req, res);

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    res.json(response);
});
app.post('/pedidos/create', async (req, res) => {
    try {
        const response = await storeCategorias(req);

        if (response === true) {
            res.redirect('/categorias?success=true&message=Categoria criada com sucesso!');
        } else {
            res.redirect('/categorias?success=false&message=${encodeURIComponent(response)}');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        res.redirect('/categorias?success=false&message=Erro ao criar categoria');
    }
});
app.post('/pedidos/update/:id', async (req, res) => {
    try {
        const response = await updatePedidos(req);

        if (response === true) {
            res.redirect('/pedidos?success=true&message=Pedido atualizado com sucesso!');
        } else {
            res.redirect('/pedidos?success=false&message=${encodeURIComponent(response)}');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        res.redirect('/pedidos?success=false&message=Erro ao atualizar pedido');
    }
})
app.delete('/pedidos/delete/:id' ,async (req, res) => {
    try {
        const response = await destroyPedidos(req);

        if (response === true) {
            res.json({ message: 'Pedido excluído com sucesso' });
        } else {
            res.json({ message: response });
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ message: 'Erro ao excluir pedido' });
    }
});


// ===== ROTAS DE RENDERIZAÇÃO =====
app.get('/sair', (req, res) => {
    res.render('home/home');
});

app.get('/pedidos', (req, res) => {
    res.render('admin/pedidos');
});

app.get('/newPassword', (req, res) => {
    const { userId, email } = req.query || null;

    res.render('login/newPassword', { userId: userId, email: email });
});

app.get('/resetPassword', (req, res) => {
    const { userId, email } = req.query || null;

    res.render('login/resetPassword', { userId: userId, email: email });
});

app.get('/forgotPassword', (req, res) => {
    res.render('login/forgotPassword');
});

app.get('/entrar', (req, res) => {
    res.render('login/entrar')
});

app.get('/login', (req, res) => {
    res.render('login/login')
});

app.get('/cardapio', (req, res) => {
    res.render('cardapio/cardapio')
});

app.get('/home', (req, res) => {
    res.render('home/home')
});


// ===== FEEDBACK DE SERVIDOR =====
app.listen('3000', function (e) {
    if (e) {
        console.log(e);
    } else {
        console.log('Servidor iniciado');
    }
});

db.authenticate().then(() => {
    console.log('Conexão com o banco de dados realizada com sucesso.');
}).catch((e) => {
    console.log('Erro ao conectar ao banco de dados: ' + e);
});
