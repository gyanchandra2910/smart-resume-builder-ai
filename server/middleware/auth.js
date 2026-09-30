const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwt');

const requireAuth = (req, res, next) => {
    const authorization = req.get('authorization') || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    try {
        const payload = jwt.verify(token, getJwtSecret());
        req.userId = payload.userId;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token'
        });
    }
};

module.exports = requireAuth;
