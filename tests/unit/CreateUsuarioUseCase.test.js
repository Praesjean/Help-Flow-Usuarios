const CreateUsuarioUseCase = require('../../src/application/features/createUsuario/CreateUsuarioUseCase');

describe('CreateUsuarioUseCase', () => {
    let repository;
    let useCase;

    beforeEach(() => {
        repository = {
            criar: jest.fn()
        };

        useCase = new CreateUsuarioUseCase(repository);
    });

    test('deve criar um usuário com dados válidos', async () => {
        const dados = {
            nome: 'Usuario Teste',
            email: 'teste@helpflow.com',
            senhaHash: 'hash-de-teste',
            perfil: 'CLIENTE'
        };

        repository.criar.mockResolvedValue({
            id: 1,
            nome: dados.nome,
            email: dados.email,
            perfil: dados.perfil,
            ativo: true
        });

        const resultado = await useCase.executar(dados);

        expect(resultado.id).toBe(1);
        expect(resultado.nome).toBe('Usuario Teste');
        expect(repository.criar).toHaveBeenCalledTimes(1);
    });

    test('deve rejeitar nome vazio', async () => {
        await expect(
            useCase.executar({
                nome: '',
                email: 'teste@helpflow.com',
                senhaHash: 'hash-de-teste'
            })
        ).rejects.toThrow('Nome é obrigatório.');

        expect(repository.criar).not.toHaveBeenCalled();
    });

    test('deve rejeitar e-mail inválido', async () => {
        await expect(
            useCase.executar({
                nome: 'Usuario Teste',
                email: 'email-invalido',
                senhaHash: 'hash-de-teste'
            })
        ).rejects.toThrow('E-mail inválido.');

        expect(repository.criar).not.toHaveBeenCalled();
    });

    test('deve rejeitar perfil inválido', async () => {
        await expect(
            useCase.executar({
                nome: 'Usuario Teste',
                email: 'teste@helpflow.com',
                senhaHash: 'hash-de-teste',
                perfil: 'SUPERADMIN'
            })
        ).rejects.toThrow('Perfil inválido.');

        expect(repository.criar).not.toHaveBeenCalled();
    });

    test('deve utilizar CLIENTE como perfil padrão', async () => {
        repository.criar.mockResolvedValue({ id: 1 });

        await useCase.executar({
            nome: 'Usuario Teste',
            email: 'teste@helpflow.com',
            senhaHash: 'hash-de-teste'
        });

        expect(repository.criar).toHaveBeenCalledWith(
            expect.objectContaining({
                perfil: 'CLIENTE'
            })
        );
    });

    test('deve normalizar nome e e-mail', async () => {
        repository.criar.mockResolvedValue({ id: 1 });

        await useCase.executar({
            nome: '  Usuario Teste  ',
            email: '  TESTE@HELPFLOW.COM  ',
            senhaHash: 'hash-de-teste'
        });

        expect(repository.criar).toHaveBeenCalledWith({
            nome: 'Usuario Teste',
            email: 'teste@helpflow.com',
            senhaHash: 'hash-de-teste',
            perfil: 'CLIENTE'
        });
    });
});