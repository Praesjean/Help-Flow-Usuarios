const request = require('supertest');
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

const administrador = {
    id: 100,
    nome: 'Administrador Teste',
    email: 'admin@helpflow.com',
    perfil: 'ADMIN',
    ativo: true
};

const cliente = {
    id: 200,
    nome: 'Cliente Teste',
    email: 'cliente@helpflow.com',
    perfil: 'CLIENTE',
    ativo: true
};

function gerarToken(usuario) {
    return jwt.sign(
        { perfil: usuario.perfil },
        JWT_SECRET_TESTE,
        {
            subject: String(usuario.id),
            expiresIn: '1h',
            algorithm: 'HS256'
        }
    );
}

describe('API de Usuários', () => {
    let tokenAdmin;
    let tokenCliente;

    beforeAll(() => {
        process.env.JWT_SECRET = JWT_SECRET_TESTE;

        tokenAdmin = gerarToken(administrador);
        tokenCliente = gerarToken(cliente);
    });

    beforeEach(() => {
        jest.clearAllMocks();

        repository.buscarPorId.mockImplementation(async (id) => {
            if (Number(id) === administrador.id) {
                return administrador;
            }

            if (Number(id) === cliente.id) {
                return cliente;
            }

            return null;
        });
    });

    test('GET /api/usuarios deve listar usuários', async () => {
        repository.listar.mockResolvedValue([
            { id: 1, nome: 'Usuario Teste', perfil: 'CLIENTE' }
        ]);

        const response = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].nome).toBe('Usuario Teste');
    });

    test('GET /api/usuarios/:id deve buscar usuário', async () => {
        repository.buscarPorId.mockImplementation(async (id) => {
            if (Number(id) === administrador.id) {
                return administrador;
            }

            if (Number(id) === 1) {
                return {
                    id: 1,
                    nome: 'Usuario Teste',
                    perfil: 'CLIENTE',
                    ativo: true
                };
            }

            return null;
        });

        const response = await request(app)
            .get('/api/usuarios/1')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(1);
    });

    test('GET /api/usuarios/:id deve retornar 404', async () => {
        const response = await request(app)
            .get('/api/usuarios/999')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(404);
    });

    test('POST /api/usuarios deve criar usuário', async () => {
        repository.criar.mockResolvedValue({
            id: 1,
            nome: 'Novo Usuario',
            email: 'novo@helpflow.com',
            perfil: 'CLIENTE'
        });

        const response = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                nome: 'Novo Usuario',
                email: 'novo@helpflow.com',
                senha: 'Teste@123456',
                perfil: 'CLIENTE'
            });

        expect(response.status).toBe(201);
        expect(response.body.usuario.id).toBe(1);

        const dadosEnviados = repository.criar.mock.calls[0][0];

        expect(dadosEnviados.senhaHash).toMatch(/^\$2[aby]\$/);
        expect(dadosEnviados).not.toHaveProperty('senha');
    });

    test('POST /api/usuarios deve rejeitar senha curta', async () => {
        const response = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                nome: 'Novo Usuario',
                email: 'novo@helpflow.com',
                senha: '123'
            });

        expect(response.status).toBe(400);
        expect(repository.criar).not.toHaveBeenCalled();
    });

    test('POST /api/usuarios deve rejeitar e-mail inválido', async () => {
        const response = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                nome: 'Novo Usuario',
                email: 'email-invalido',
                senha: 'Teste@123456'
            });

        expect(response.status).toBe(400);
        expect(repository.criar).not.toHaveBeenCalled();
    });

    test('PUT /api/usuarios/:id deve atualizar usuário', async () => {
        repository.buscarPorId.mockImplementation(async (id) => {
            if (Number(id) === administrador.id) {
                return administrador;
            }

            if (Number(id) === 1) {
                return {
                    id: 1,
                    nome: 'Usuario Teste',
                    email: 'teste@helpflow.com',
                    perfil: 'CLIENTE',
                    ativo: true
                };
            }

            return null;
        });

        repository.atualizar.mockResolvedValue({
            id: 1,
            nome: 'Usuario Atualizado',
            email: 'teste@helpflow.com',
            perfil: 'CLIENTE',
            ativo: true
        });

        const response = await request(app)
            .put('/api/usuarios/1')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({ nome: 'Usuario Atualizado' });

        expect(response.status).toBe(200);
        expect(response.body.usuario.nome).toBe('Usuario Atualizado');
    });

    test('PUT /api/usuarios/:id deve retornar 404', async () => {
        const response = await request(app)
            .put('/api/usuarios/999')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({ nome: 'Novo Nome' });

        expect(response.status).toBe(404);
    });

    test('DELETE /api/usuarios/:id deve excluir usuário', async () => {
        repository.excluir.mockResolvedValue(true);

        const response = await request(app)
            .delete('/api/usuarios/1')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(200);
        expect(response.body.mensagem).toBe('Usuário excluído com sucesso.');
    });

    test('DELETE /api/usuarios/:id deve retornar 404', async () => {
        repository.excluir.mockResolvedValue(false);

        const response = await request(app)
            .delete('/api/usuarios/999')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(404);
    });

    test('GET /api/usuarios sem token deve retornar 401', async () => {
        const response = await request(app)
            .get('/api/usuarios');

        expect(response.status).toBe(401);
        expect(response.body.erro).toBe(
            'Token de autenticação não informado.'
        );
    });

    test('GET /api/usuarios com token inválido deve retornar 401', async () => {
        const response = await request(app)
            .get('/api/usuarios')
            .set('Authorization', 'Bearer token-invalido');

        expect(response.status).toBe(401);
    });

    test('CLIENTE não pode listar usuários', async () => {
        const response = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${tokenCliente}`);

        expect(response.status).toBe(403);
    });

    test('CLIENTE não pode criar usuários', async () => {
        const response = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${tokenCliente}`)
            .send({
                nome: 'Usuario Indevido',
                email: 'indevido@helpflow.com',
                senha: 'Teste@123456',
                perfil: 'ADMIN'
            });

        expect(response.status).toBe(403);
        expect(repository.criar).not.toHaveBeenCalled();
    });

    test('CLIENTE pode consultar os próprios dados', async () => {
        const response = await request(app)
            .get(`/api/usuarios/${cliente.id}`)
            .set('Authorization', `Bearer ${tokenCliente}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(cliente.id);
    });

    test('CLIENTE não pode consultar outro usuário', async () => {
        const response = await request(app)
            .get(`/api/usuarios/${administrador.id}`)
            .set('Authorization', `Bearer ${tokenCliente}`);

        expect(response.status).toBe(403);
    });

    test('CLIENTE não pode atualizar usuários', async () => {
        const response = await request(app)
            .put(`/api/usuarios/${cliente.id}`)
            .set('Authorization', `Bearer ${tokenCliente}`)
            .send({ perfil: 'ADMIN' });

        expect(response.status).toBe(403);
        expect(repository.atualizar).not.toHaveBeenCalled();
    });

    test('CLIENTE não pode excluir usuários', async () => {
        const response = await request(app)
            .delete(`/api/usuarios/${administrador.id}`)
            .set('Authorization', `Bearer ${tokenCliente}`);

        expect(response.status).toBe(403);
        expect(repository.excluir).not.toHaveBeenCalled();
    });

    test('Usuário desativado deve receber 401', async () => {
        repository.buscarPorId.mockResolvedValue({
            ...administrador,
            ativo: false
        });

        const response = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(401);
    });

    test('Usuário excluído deve receber 401', async () => {
        repository.buscarPorId.mockResolvedValue(null);

        const response = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(401);
    });
});