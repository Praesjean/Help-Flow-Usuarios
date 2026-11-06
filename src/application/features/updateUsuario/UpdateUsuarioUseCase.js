const Usuario = require('../../../domain/entities/Usuario');

class UpdateUsuarioUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async executar(id, dados) {
        if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
            throw new Error('ID do usuário inválido.');
        }

        if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
            throw new Error('Dados inválidos.');
        }

        const camposPermitidos = Usuario.CAMPOS_ATUALIZAVEIS;

        if (Object.keys(dados).length === 0) {
            throw new Error('Informe pelo menos um campo.');
        }

        for (const campo of Object.keys(dados)) {
            if (!camposPermitidos.includes(campo)) {
                throw new Error(`Campo não permitido: ${campo}`);
            }
        }

        const usuarioAtual = await this.repository.buscarPorId(Number(id));

        if (!usuarioAtual) {
            return null;
        }

        const atualizacao = Usuario.prepararAtualizacao(
            usuarioAtual,
            dados
        );

        return this.repository.atualizar(Number(id), atualizacao);
    }
}

module.exports = UpdateUsuarioUseCase;