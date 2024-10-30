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
const Funcionario = require('./models/usuario');

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
            funcionarios = await Funcionario.findAll({
                where: {
                    nome: {
                        [Op.like]: `%${nome}%`
                    },
                    tipo_usuario: 'admin'
                },
                limit: 5
            })
        }else {
            funcionarios = await Funcionario.findAll({
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
app.get('/pedidos/search' , async (req, res) => {
    const nome = req.query.nome;

    let categorias = null;
    try {
        if (nome) {
            produtos = await Categoria.findAll({
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

        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
});
app.get('/pedidos/:id' , async (req, res) => {
    const response = await getCategorias(req, res);

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
app.put('/pedidos/status/:id', async (req, res) => {
    try {
        await updateStatusCategorias(req);
        res.status(200).json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o status da categoria', error });
    }
});
app.delete('/pedidos/delete/:id' ,async (req, res) => {
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


// ===== ROTAS DE RENDERIZAÇÃO =====
app.get('/pedidos', (req, res) => {
    res.render('admin/pedidos');
});

app.get('/newPassword', (req, res) => {
    const { email } = req.query || null;

    res.render('login/newPassword', { email: email });
});

app.get('/resetPassword', (req, res) => {
    const { email } = req.query || null;

    res.render('login/resetPassword', { email: email });
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
