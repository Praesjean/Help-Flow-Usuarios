const Usuario = require('../../../domain/entities/Usuario');

class CreateUsuarioUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async executar(dados) {
        const novoUsuario = Usuario.criar(dados);

        return this.repository.criar(novoUsuario);
    }
}

module.exports = CreateUsuarioUseCase;