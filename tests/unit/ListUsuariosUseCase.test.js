const ListUsuariosUseCase = require('../../src/application/features/listUsuarios/ListUsuariosUseCase');

describe('ListUsuariosUseCase', () => {
    let repository;
    let useCase;

    beforeEach(() => {
        repository = {
            listar: jest.fn()
        };

        useCase = new ListUsuariosUseCase(repository);
    });

    test('deve retornar a lista de usuários', async () => {
        const usuarios = [
            { id: 1, nome: 'Usuario 1', perfil: 'CLIENTE' },
            { id: 2, nome: 'Usuario 2', perfil: 'ATENDENTE' }
        ];

        repository.listar.mockResolvedValue(usuarios);

        const resultado = await useCase.executar();

        expect(resultado).toEqual(usuarios);
        expect(repository.listar).toHaveBeenCalledTimes(1);
    });

    test('deve retornar uma lista vazia quando não houver usuários', async () => {
        repository.listar.mockResolvedValue([]);

        const resultado = await useCase.executar();

        expect(resultado).toEqual([]);
        expect(repository.listar).toHaveBeenCalledTimes(1);
    });
});