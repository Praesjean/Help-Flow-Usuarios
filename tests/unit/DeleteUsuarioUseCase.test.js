const DeleteUsuarioUseCase = require('../../src/application/features/deleteUsuario/DeleteUsuarioUseCase');

describe('DeleteUsuarioUseCase', () => {
    let repository;
    let useCase;

    beforeEach(() => {
        repository = {
            excluir: jest.fn()
        };

        useCase = new DeleteUsuarioUseCase(repository);
    });

    test('deve excluir um usuário existente', async () => {
        repository.excluir.mockResolvedValue(true);

        const resultado = await useCase.executar(1);

        expect(resultado).toBe(true);
        expect(repository.excluir).toHaveBeenCalledWith(1);
        expect(repository.excluir).toHaveBeenCalledTimes(1);
    });

    test('deve retornar false quando o usuário não existir', async () => {
        repository.excluir.mockResolvedValue(false);

        const resultado = await useCase.executar(999);

        expect(resultado).toBe(false);
    });

    test('deve rejeitar ID inválido', async () => {
        await expect(
            useCase.executar('abc')
        ).rejects.toThrow('ID do usuário inválido.');

        expect(repository.excluir).not.toHaveBeenCalled();
    });

    test('deve rejeitar ID negativo', async () => {
        await expect(
            useCase.executar(-1)
        ).rejects.toThrow('ID do usuário inválido.');

        expect(repository.excluir).not.toHaveBeenCalled();
    });
});