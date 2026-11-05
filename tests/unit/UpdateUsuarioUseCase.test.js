const UpdateUsuarioUseCase = require('../../src/application/features/updateUsuario/UpdateUsuarioUseCase');

describe('UpdateUsuarioUseCase', () => {
    let repository;
    let useCase;

    const usuarioExistente = {
        id: 1,
        nome: 'Usuario Teste',
        email: 'teste@helpflow.com',
        perfil: 'CLIENTE',
        ativo: true
    };

    beforeEach(() => {
        repository = {
            buscarPorId: jest.fn(),
            atualizar: jest.fn()
        };

        useCase = new UpdateUsuarioUseCase(repository);

        repository.buscarPorId.mockResolvedValue({
            ...usuarioExistente
        });
    });

    test('deve atualizar um usuário com dados válidos', async () => {
        repository.atualizar.mockResolvedValue({
            ...usuarioExistente,
            nome: 'Usuario Atualizado'
        });

        const resultado = await useCase.executar(1, {
            nome: 'Usuario Atualizado'
        });

        expect(resultado.nome).toBe('Usuario Atualizado');

        expect(repository.atualizar).toHaveBeenCalledWith(1, expect.objectContaining({
                nome: 'Usuario Atualizado'
            })
        );
    });

    test('deve permitir atualizar apenas o perfil', async () => {
        repository.atualizar.mockResolvedValue({
            ...usuarioExistente,
            perfil: 'ATENDENTE'
        });

        await useCase.executar(1, {
            perfil: 'ATENDENTE'
        });

        expect(repository.atualizar).toHaveBeenCalledWith(1, expect.objectContaining({
                perfil: 'ATENDENTE'
            })
        );
    });

    test('deve retornar null quando o usuário não existir', async () => {
        repository.buscarPorId.mockResolvedValue(null);

        const resultado = await useCase.executar(999, {
            nome: 'Novo Nome'
        });

        expect(resultado).toBeNull();
        expect(repository.atualizar).not.toHaveBeenCalled();
    });

    test('deve rejeitar ID inválido', async () => {
        await expect(
            useCase.executar('abc', {
                nome: 'Novo Nome'
            })
        ).rejects.toThrow('ID do usuário inválido.');

        expect(repository.atualizar).not.toHaveBeenCalled();
    });

    test('deve rejeitar perfil inválido', async () => {
        await expect(
            useCase.executar(1, {
                perfil: 'SUPERADMIN'
            })
        ).rejects.toThrow('Perfil inválido.');

        expect(repository.atualizar).not.toHaveBeenCalled();
    });

    test('deve rejeitar campos não permitidos', async () => {
        await expect(
            useCase.executar(1, {
                senhaHash: 'hash-alterado'
            })
        ).rejects.toThrow('Campo não permitido: senhaHash');

        expect(repository.atualizar).not.toHaveBeenCalled();
    });

    test('deve rejeitar atualização sem campos', async () => {
        await expect(
            useCase.executar(1, {})
        ).rejects.toThrow('Informe pelo menos um campo.');

        expect(repository.atualizar).not.toHaveBeenCalled();
    });
});