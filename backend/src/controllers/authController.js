const authService = require('../services/authService');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

const register = async (req, res) => {
    try {
        const userData = req.body;
        const result = await authService.register(userData);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        const result = await authService.googleLogin(idToken);
        res.json(result);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

const googleRegister = async (req, res) => {
    try {
        const result = await authService.googleRegister(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { login, register, googleLogin, googleRegister };
