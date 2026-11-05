const jwt = require('jsonwebtoken');

const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');

async function autenticar(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            erro: 'Token de autenticação não informado.'
        });
    }

    const partes = authorization.split(' ');

    if (
        partes.length !== 2 ||
        partes[0] !== 'Bearer' ||
        !partes[1]
    ) {
        return res.status(401).json({
            erro: 'Formato do token inválido.'
        });
    }

    const token = partes[1];

    let payload;

    try {
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret || jwtSecret.length < 32) {
            console.error('JWT_SECRET não configurado corretamente.');

            return res.status(500).json({
                erro: 'Erro interno de autenticação.'
            });
        }

        payload = jwt.verify(token, jwtSecret, {
            algorithms: ['HS256']
        });
    } catch (error) {
        if (
            error instanceof jwt.TokenExpiredError ||
            error instanceof jwt.JsonWebTokenError
        ) {
            return res.status(401).json({
                erro: 'Token inválido ou expirado.'
            });
        }

        console.error('Erro na autenticação:', error.message);

        return res.status(500).json({
            erro: 'Erro interno de autenticação.'
        });
    }

    const id = Number(payload.sub);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(401).json({
            erro: 'Token inválido.'
        });
    }

    try {
        const usuario = await UsuarioRepository.buscarPorId(id);

        if (!usuario || !usuario.ativo) {
            return res.status(401).json({
                erro: 'Usuário inexistente ou desativado.'
            });
        }

        req.usuario = {
            id: usuario.id,
            perfil: usuario.perfil
        };

        return next();
    } catch (error) {
        console.error('Erro ao consultar usuário na autenticação:', error.message);

        return res.status(500).json({
            erro: 'Erro interno de autenticação.'
        });
    }
}

module.exports = autenticar;