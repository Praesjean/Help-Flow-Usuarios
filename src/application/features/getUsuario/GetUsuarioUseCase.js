class GetUsuarioUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async executar(id) {
        if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
            throw new Error('ID do usuário inválido.');
        }

        return this.repository.buscarPorId(Number(id));
    }
}

module.exports = GetUsuarioUseCase;