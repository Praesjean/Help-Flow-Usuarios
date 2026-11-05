const GetUsuarioUseCase = require('../../src/application/features/getUsuario/GetUsuarioUseCase');

describe('GetUsuarioUseCase', () => {
    let repository;
    let useCase;

    beforeEach(() => {
        repository = {
            buscarPorId: jest.fn()
        };

        useCase = new GetUsuarioUseCase(repository);
    });

    test('deve buscar um usuário pelo ID', async () => {
        const usuario = {
            id: 1,
            nome: 'Usuario Teste',
            email: 'teste@helpflow.com',
            perfil: 'CLIENTE'
        };

        repository.buscarPorId.mockResolvedValue(usuario);

        const resultado = await useCase.executar(1);

        expect(resultado).toEqual(usuario);
        expect(repository.buscarPorId).toHaveBeenCalledWith(1);
    });

    test('deve retornar null quando o usuário não existir', async () => {
        repository.buscarPorId.mockResolvedValue(null);

        const resultado = await useCase.executar(999);

        expect(resultado).toBeNull();
    });

    test('deve rejeitar ID inválido', async () => {
        await expect(
            useCase.executar('abc')
        ).rejects.toThrow('ID do usuário inválido.');

        expect(repository.buscarPorId).not.toHaveBeenCalled();
    });

    test('deve rejeitar ID negativo', async () => {
        await expect(
            useCase.executar(-1)
        ).rejects.toThrow('ID do usuário inválido.');

        expect(repository.buscarPorId).not.toHaveBeenCalled();
    });
});