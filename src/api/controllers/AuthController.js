const bcrypt = require('bcryptjs');

const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');

const LoginUsuarioUseCase = require('../../application/features/loginUsuario/LoginUsuarioUseCase');
const CreateUsuarioUseCase = require('../../application/features/createUsuario/CreateUsuarioUseCase');

const loginUsuarioUseCase = new LoginUsuarioUseCase(UsuarioRepository);
const createUsuarioUseCase = new CreateUsuarioUseCase(UsuarioRepository);

class AuthController {
    async login(req, res) {
        try {
            const resultado = await loginUsuarioUseCase.executar(req.body);

            if (!resultado) {
                return res.status(401).json({
                    erro: 'E-mail ou senha inválidos.'
                });
            }

            return res.status(200).json({
                mensagem: 'Login realizado com sucesso.',
                ...resultado
            });
        } catch (error) {
            if (error.message === 'E-mail e senha são obrigatórios.') {
                return res.status(400).json({
                    erro: error.message
                });
            }

            console.error('Erro ao realizar login:', error.message);

            return res.status(500).json({
                erro: 'Erro interno ao realizar login.'
            });
        }
    }

    async registrar(req, res) {
        try {
            const { nome, email, senha } = req.body || {};

            if (typeof senha !== 'string' || senha.length < 8) {
                return res.status(400).json({
                    erro: 'A senha deve possuir pelo menos 8 caracteres.'
                });
            }

            const senhaHash = await bcrypt.hash(senha, 12);

            const usuario = await createUsuarioUseCase.executar({
                nome,
                email,
                senhaHash,
                perfil: 'CLIENTE'
            });

            return res.status(201).json({
                mensagem: 'Cadastro realizado com sucesso.',
                usuario
            });
        } catch (error) {
            if (error.number === 2627 || error.number === 2601) {
                return res.status(409).json({
                    erro: 'Já existe um usuário com este e-mail.'
                });
            }

            if (
                error.message &&
                (
                    error.message.includes('inválido') ||
                    error.message.includes('inválida') ||
                    error.message.includes('obrigatório') ||
                    error.message.includes('permitido') ||
                    error.message.includes('Informe')
                )
            ) {
                return res.status(400).json({
                    erro: error.message
                });
            }

            console.error('Erro ao registrar usuário:', error.message);

            return res.status(500).json({
                erro: 'Erro interno ao registrar usuário.'
            });
        }
    }
}

module.exports = new AuthController();