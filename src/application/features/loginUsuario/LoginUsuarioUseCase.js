const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LoginUsuarioUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async executar(dados) {
        if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
            throw new Error('E-mail e senha são obrigatórios.');
        }

        const { email, senha } = dados;

        if (
            typeof email !== 'string' ||
            !email.trim() ||
            typeof senha !== 'string' ||
            !senha
        ) {
            throw new Error('E-mail e senha são obrigatórios.');
        }

        const emailNormalizado = email.trim().toLowerCase();

        const usuario = await this.repository.buscarPorEmail(emailNormalizado);

        if (!usuario || !usuario.ativo) {
            return null;
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senhaHash
        );

        if (!senhaCorreta) {
            return null;
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret || jwtSecret.length < 32) {
            throw new Error('JWT_SECRET não configurado corretamente.');
        }

        const token = jwt.sign(
            {
                perfil: usuario.perfil
            },
            jwtSecret,
            {
                subject: String(usuario.id),
                expiresIn: process.env.JWT_EXPIRES_IN || '8h',
                algorithm: 'HS256'
            }
        );

        return {
            token,
            tokenType: 'Bearer',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                ativo: usuario.ativo
            }
        };
    }
}

module.exports = LoginUsuarioUseCase;