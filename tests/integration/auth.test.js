const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../../src/infrastructure/repositories/UsuarioRepository', () => ({
    criar: jest.fn(),
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorEmail: jest.fn(),
    atualizar: jest.fn(),
    excluir: jest.fn()
}));

const repository = require('../../src/infrastructure/repositories/UsuarioRepository');
const app = require('../../src/app');

const JWT_SECRET_TESTE = 'segredo-exclusivo-para-testes-automatizados-123456789';

describe('API de Autenticação', () => {
    let jwtSecretOriginal;

    beforeAll(() => {
        jwtSecretOriginal = process.env.JWT_SECRET;
        process.env.JWT_SECRET = JWT_SECRET_TESTE;
    });

    afterAll(() => {
        if (jwtSecretOriginal === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = jwtSecretOriginal;
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /api/auth/login deve autenticar usuário válido', async () => {
        const senhaHash = await bcrypt.hash('Teste@123456', 4);

        repository.buscarPorEmail.mockResolvedValue({
            id: 1,
            nome: 'Usuario Teste',
            email: 'teste@helpflow.com',
            senhaHash,
            perfil: 'CLIENTE',
            ativo: true
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'teste@helpflow.com',
                senha: 'Teste@123456'
            });

        expect(response.status).toBe(200);
        expect(response.body.tokenType).toBe('Bearer');
        expect(response.body.token).toBeDefined();

        const payload = jwt.verify(
            response.body.token,
            JWT_SECRET_TESTE
        );

        expect(payload.sub).toBe('1');
        expect(response.body.usuario.perfil).toBe('CLIENTE');
        expect(response.body.usuario).not.toHaveProperty('senhaHash');
    });

    test('Login com senha incorreta deve retornar 401', async () => {
        const senhaHash = await bcrypt.hash('Teste@123456', 4);

        repository.buscarPorEmail.mockResolvedValue({
            id: 1,
            nome: 'Usuario Teste',
            email: 'teste@helpflow.com',
            senhaHash,
            perfil: 'CLIENTE',
            ativo: true
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'teste@helpflow.com',
                senha: 'SenhaIncorreta'
            });

        expect(response.status).toBe(401);
        expect(response.body).not.toHaveProperty('token');
    });

    test('Login com usuário inexistente deve retornar 401', async () => {
        repository.buscarPorEmail.mockResolvedValue(null);

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'inexistente@helpflow.com',
                senha: 'Teste@123456'
            });

        expect(response.status).toBe(401);
    });

    test('Login com usuário desativado deve retornar 401', async () => {
        repository.buscarPorEmail.mockResolvedValue({
            id: 1,
            email: 'teste@helpflow.com',
            perfil: 'CLIENTE',
            ativo: false
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'teste@helpflow.com',
                senha: 'Teste@123456'
            });

        expect(response.status).toBe(401);
    });

    test('Login sem senha deve retornar 400', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'teste@helpflow.com'
            });

        expect(response.status).toBe(400);
    });

    test('Cadastro público deve criar usuário CLIENTE', async () => {
        repository.criar.mockResolvedValue({
            id: 2,
            nome: 'Novo Cliente',
            email: 'cliente@helpflow.com',
            perfil: 'CLIENTE',
            ativo: true
        });

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nome: 'Novo Cliente',
                email: 'cliente@helpflow.com',
                senha: 'Teste@123456'
            });

        expect(response.status).toBe(201);
        expect(response.body.usuario.perfil).toBe('CLIENTE');

        const dados = repository.criar.mock.calls[0][0];

        expect(dados.perfil).toBe('CLIENTE');
        expect(dados.senhaHash).toMatch(/^\$2[aby]\$/);
    });

    test('Cadastro público não pode atribuir perfil ADMIN', async () => {
        repository.criar.mockResolvedValue({
            id: 3,
            nome: 'Cliente Teste',
            email: 'cliente2@helpflow.com',
            perfil: 'CLIENTE',
            ativo: true
        });

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nome: 'Cliente Teste',
                email: 'cliente2@helpflow.com',
                senha: 'Teste@123456',
                perfil: 'ADMIN'
            });

        expect(response.status).toBe(201);

        const dados = repository.criar.mock.calls[0][0];

        expect(dados.perfil).toBe('CLIENTE');
        expect(response.body.usuario.perfil).toBe('CLIENTE');
    });

    test('Cadastro público deve rejeitar senha curta', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nome: 'Cliente Teste',
                email: 'cliente@helpflow.com',
                senha: '123'
            });

        expect(response.status).toBe(400);
        expect(repository.criar).not.toHaveBeenCalled();
    });

    test('Cadastro público deve rejeitar e-mail duplicado', async () => {
        repository.criar.mockRejectedValue({
            number: 2627
        });

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                nome: 'Cliente Teste',
                email: 'duplicado@helpflow.com',
                senha: 'Teste@123456'
            });

        expect(response.status).toBe(409);
    });
});