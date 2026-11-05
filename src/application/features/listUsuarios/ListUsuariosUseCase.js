class ListUsuariosUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async executar() {
        return this.repository.listar();
    }
}

module.exports = ListUsuariosUseCase;