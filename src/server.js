require('dotenv').config();

const app = require('./app');

const {
	conectarAzureSql,
	fecharConexao
} = require('./infrastructure/database/azureSql');

const PORT = process.env.PORT || 3002;

let server = null;

async function iniciarServidor() {
	try {
		await conectarAzureSql();

		server = app.listen(PORT, () => {
			console.log(`Microserviço de Usuários executando na porta ${PORT}`);
			console.log(`Health check: http://localhost:${PORT}/health`);
		});
	} catch (error) {
		console.error('Não foi possível iniciar o microserviço de Usuários.');
		process.exitCode = 1;
	}
}

async function encerrarServidor() {
	console.log('Encerrando microserviço de Usuários...');

	if (server) {
		await new Promise((resolve) => server.close(resolve));
	}

	await fecharConexao();

	process.exit(0);
}

process.on('SIGINT', encerrarServidor);
process.on('SIGTERM', encerrarServidor);

iniciarServidor();