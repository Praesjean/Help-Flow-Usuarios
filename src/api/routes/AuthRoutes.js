const express = require('express');

const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/login', (req, res) => {
    return AuthController.login(req, res);
});

router.post('/register', (req, res) => {
    return AuthController.registrar(req, res);
});

module.exports = router;