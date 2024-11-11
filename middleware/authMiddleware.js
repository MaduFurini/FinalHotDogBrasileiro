const jwt = require('jsonwebtoken');
const Token = require('../models/personalAccessTokens');

const SECRET_KEY = 'exerIsTGHyhAPfuWDgjqWw';

const authMiddleware = async (req, res, next) => {
    const cookies = req.headers.cookie;

    if (!cookies) {
        return res.redirect('/login');
    }

    const cookiesArray = cookies.split('; ');

    const tokenCookie = cookiesArray.find(cookie => cookie.startsWith('token='));

    if (!tokenCookie) {
        return res.redirect('/login');
    }

    const token = tokenCookie.split('=')[1];

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = await jwt.verify(token, SECRET_KEY);

        const tokenDb = await Token.findOne({
            where: {
                token: token
            }
        });

        if (!tokenDb) {
            return res.redirect('/login?error=Token não encontrado no banco');
        }

        const expiresAtFromDb = tokenDb.expires_at;
        const currentDate = new Date();
        const currentDateUtcMinus3 = new Date(currentDate.setHours(currentDate.getHours() - 3));

        if (new Date(expiresAtFromDb) < currentDateUtcMinus3) {
            return res.redirect('/login?error=Usuário não autenticado');
        }

        req.user = decoded;

        next();
    } catch (err) {
        return res.redirect(`/login?error=${err.message}`);
    }
};

const verifyUserAbility = async (req, res, next) => {
    const cookies = req.headers.cookie;

    if (!cookies) {
        return res.redirect('/login');
    }

    const cookiesArray = cookies.split('; ');

    const tokenCookie = cookiesArray.find(cookie => cookie.startsWith('token='));
    const token = tokenCookie.split('=')[1];

    if (!token) {
        return res.redirect('/login');
    }

    const tokenDb = await Token.findOne({
        where: {
            token: token
        }
    })

    if (tokenDb) {
        if (tokenDb.tipo_usuario === 'Admin') {
            next();
        } else {
            return res.redirect('/login?error=Você não tem permissão para acessar essa rota');
        }
    }
};

module.exports = { authMiddleware, verifyUserAbility };
