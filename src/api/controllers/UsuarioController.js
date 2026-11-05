const bcrypt = require('bcryptjs');

const repository = require('../../infrastructure/repositories/UsuarioRepository');

const CreateUsuarioUseCase = require('../../application/features/createUsuario/CreateUsuarioUseCase');
const ListUsuariosUseCase = require('../../application/features/listUsuarios/ListUsuariosUseCase');
const GetUsuarioUseCase = require('../../application/features/getUsuario/GetUsuarioUseCase');
const UpdateUsuarioUseCase = require('../../application/features/updateUsuario/UpdateUsuarioUseCase');
const DeleteUsuarioUseCase = require('../../application/features/deleteUsuario/DeleteUsuarioUseCase');

const createUsuario = new CreateUsuarioUseCase(repository);
const listUsuarios = new ListUsuariosUseCase(repository);
const getUsuario = new GetUsuarioUseCase(repository);
const updateUsuario = new UpdateUsuarioUseCase(repository);
const deleteUsuario = new DeleteUsuarioUseCase(repository);

function tratarErro(res, error) {
    if (error.number === 2627 || error.number === 2601) {
        return res.status(409).json({
            erro: 'Já existe um usuário com este e-mail.'
        });
    }

    if (error.message && (
        error.message.includes('inválido') ||
        error.message.includes('inválida') ||
        error.message.includes('obrigatório') ||
        error.message.includes('permitido') ||
        error.message.includes('Informe')
    )) {
        return res.status(400).json({
            erro: error.message
        });
    }

    console.error('Erro interno na API de Usuários:', error);

    return res.status(500).json({
        erro: 'Erro interno do servidor.'
    });
}

class UsuarioController {
    async criar(req, res) {
        try {
            const { nome, email, senha, perfil } = req.body || {};

            if (typeof senha !== 'string' || senha.length < 8) {
                return res.status(400).json({
                    erro: 'A senha deve possuir pelo menos 8 caracteres.'
                });
            }

            const senhaHash = await bcrypt.hash(senha, 12);

            const usuario = await createUsuario.executar({
                nome,
                email,
                senhaHash,
                perfil
            });

            return res.status(201).json({
                mensagem: 'Usuário criado com sucesso.',
                usuario
            });
        } catch (error) {
            return tratarErro(res, error);
        }
    }

    async listar(req, res) {
        try {
            const usuarios = await listUsuarios.executar();

            return res.status(200).json(usuarios);
        } catch (error) {
            return tratarErro(res, error);
        }
    }

    async buscarPorId(req, res) {
        try {
            const usuario = await getUsuario.executar(req.params.id);

            if (!usuario) {
                return res.status(404).json({
                    erro: 'Usuário não encontrado.'
                });
            }

            return res.status(200).json(usuario);
        } catch (error) {
            return tratarErro(res, error);
        }
    }

    async atualizar(req, res) {
        try {
            const usuario = await updateUsuario.executar(
                req.params.id,
                req.body
            );

            if (!usuario) {
                return res.status(404).json({
                    erro: 'Usuário não encontrado.'
                });
            }

            return res.status(200).json({
                mensagem: 'Usuário atualizado com sucesso.',
                usuario
            });
        } catch (error) {
            return tratarErro(res, error);
        }
    }

    async excluir(req, res) {
        try {
            const excluido = await deleteUsuario.executar(req.params.id);

            if (!excluido) {
                return res.status(404).json({
                    erro: 'Usuário não encontrado.'
                });
            }

            return res.status(200).json({
                mensagem: 'Usuário excluído com sucesso.'
            });
        } catch (error) {
            return tratarErro(res, error);
        }
    }
}

module.exports = new UsuarioController();