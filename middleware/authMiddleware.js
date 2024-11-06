const jwt = require('jsonwebtoken');

const SECRET_KEY = 'exerIsTGHyhAPfuWDgjqWw';

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.redirect('/login');
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.redirect('/login');
        }

        const expiresAtFromDb = decoded.expires_at;
        const currentDate = new Date();

        if (new Date(expiresAtFromDb) < currentDate) {
            return res.redirect('/login');
        }

        req.user = decoded;
        next();
    });
};

module.exports = authMiddleware;
