class DeleteUsuarioUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async executar(id) {
        if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
            throw new Error('ID do usuário inválido.');
        }

        return this.repository.excluir(Number(id));
    }
}

module.exports = DeleteUsuarioUseCase;