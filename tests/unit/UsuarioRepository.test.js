jest.mock('../../src/infrastructure/database/azureSql', () => ({
    sql: {
        Int: 'Int',
        NVarChar: jest.fn((tamanho) => `NVarChar(${tamanho})`),
        Bit: 'Bit'
    },
    obterConexao: jest.fn()
}));

const {
    obterConexao
} = require('../../src/infrastructure/database/azureSql');

const repository = require('../../src/infrastructure/repositories/UsuarioRepository');

describe('UsuarioRepository', () => {
    let request;
    let pool;

    beforeEach(() => {
        jest.clearAllMocks();

        request = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn()
        };

        pool = {
            request: jest.fn().mockReturnValue(request)
        };

        obterConexao.mockReturnValue(pool);
    });

    test('deve criar um usuário no banco', async () => {
        const usuario = {
            nome: 'Usuario Teste',
            email: 'teste@helpflow.com',
            senhaHash: 'hash-de-teste',
            perfil: 'CLIENTE'
        };

        request.query.mockResolvedValue({
            recordset: [{ id: 1, ...usuario }]
        });

        const resultado = await repository.criar(usuario);

        expect(resultado.id).toBe(1);
        expect(request.input).toHaveBeenCalledTimes(4);
        expect(request.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO Usuarios')
        );
    });

    test('deve listar os usuários', async () => {
        const usuarios = [
            { id: 1, nome: 'Usuario 1' },
            { id: 2, nome: 'Usuario 2' }
        ];

        request.query.mockResolvedValue({
            recordset: usuarios
        });

        const resultado = await repository.listar();

        expect(resultado).toEqual(usuarios);
        expect(request.query).toHaveBeenCalledWith(
            expect.stringContaining('FROM Usuarios')
        );
    });

    test('deve buscar usuário pelo ID', async () => {
        request.query.mockResolvedValue({
            recordset: [{ id: 1, nome: 'Usuario Teste' }]
        });

        const resultado = await repository.buscarPorId(1);

        expect(resultado.id).toBe(1);
        expect(request.input).toHaveBeenCalledWith('id', 'Int', 1);
    });

    test('deve retornar null quando usuário não existir', async () => {
        request.query.mockResolvedValue({
            recordset: []
        });

        const resultado = await repository.buscarPorId(999);

        expect(resultado).toBeNull();
    });

    test('deve atualizar um usuário', async () => {
        const dados = {
            nome: 'Usuario Atualizado',
            email: 'teste@helpflow.com',
            perfil: 'ATENDENTE',
            ativo: true
        };

        request.query.mockResolvedValue({
            recordset: [{ id: 1, ...dados }]
        });

        const resultado = await repository.atualizar(1, dados);

        expect(resultado.nome).toBe('Usuario Atualizado');
        expect(request.input).toHaveBeenCalledTimes(5);
        expect(request.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE Usuarios')
        );
    });

    test('deve retornar null ao atualizar usuário inexistente', async () => {
        request.query.mockResolvedValue({
            recordset: []
        });

        const resultado = await repository.atualizar(999, {
            nome: 'Teste',
            email: 'teste@helpflow.com',
            perfil: 'CLIENTE',
            ativo: true
        });

        expect(resultado).toBeNull();
    });

    test('deve excluir um usuário', async () => {
        request.query.mockResolvedValue({
            recordset: [{ id: 1 }]
        });

        const resultado = await repository.excluir(1);

        expect(resultado).toBe(true);
        expect(request.query).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM Usuarios')
        );
    });

    test('deve retornar false ao excluir usuário inexistente', async () => {
        request.query.mockResolvedValue({
            recordset: []
        });

        const resultado = await repository.excluir(999);

        expect(resultado).toBe(false);
    });
});