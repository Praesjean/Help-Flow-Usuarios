const request = require('supertest');
const app = require('../../src/app');

describe('Microserviço de Usuários - Health Check', () => {
    test('GET /health deve retornar status 200', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('UP');
        expect(response.body.service).toBe('help-flow-usuarios');
        expect(response.body).toHaveProperty('timestamp');
    });

    test('GET /rota-inexistente deve retornar 404', async () => {
        const response = await request(app).get('/rota-inexistente');

        expect(response.status).toBe(404);
        expect(response.body.erro).toBe('Rota não encontrada.');
    });
});