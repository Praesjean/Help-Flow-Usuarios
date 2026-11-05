const express = require('express');

const usuarioController = require('../controllers/UsuarioController');
const autenticar = require('../middlewares/AuthMiddleware');
const autorizarPerfis = require('../middlewares/AutorizarPerfis');

const router = express.Router();

router.use(autenticar);

router.post('/', autorizarPerfis('ADMIN'), (req, res) => {
    return usuarioController.criar(req, res);
});

router.get('/', autorizarPerfis('ADMIN', 'ATENDENTE'), (req, res) => {
    return usuarioController.listar(req, res);
});

router.get('/:id', (req, res, next) => {
    if (
        req.usuario.perfil === 'CLIENTE' &&
        String(req.usuario.id) !== String(req.params.id)
    ) {
        return res.status(403).json({
            erro: 'Você não possui permissão para consultar este usuário.'
        });
    }

    return next();
}, autorizarPerfis('ADMIN', 'ATENDENTE', 'CLIENTE'), (req, res) => {
    return usuarioController.buscarPorId(req, res);
});

router.put('/:id', autorizarPerfis('ADMIN'), (req, res) => {
    return usuarioController.atualizar(req, res);
});

router.delete('/:id', autorizarPerfis('ADMIN'), (req, res) => {
    return usuarioController.excluir(req, res);
});

module.exports = router;