const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const usuarioRoutes = require('./api/routes/UsuarioRoutes');
const authRoutes = require('./api/routes/AuthRoutes');
const swaggerDocument = require('./api/swagger/swagger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

app.get('/health', (req, res) => {
    return res.status(200).json({
        status: 'UP',
        service: 'help-flow-usuarios',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);

app.use('/api/usuarios', usuarioRoutes);

app.use((req, res) => {
    return res.status(404).json({
        erro: 'Rota não encontrada.'
    });
});

app.use((err, req, res, next) => {
    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        'body' in err
    ) {
        return res.status(400).json({
            erro: 'JSON inválido.'
        });
    }

    console.error('Erro não tratado:', err);

    return res.status(500).json({
        erro: 'Erro interno do servidor.'
    });
});

module.exports = app;