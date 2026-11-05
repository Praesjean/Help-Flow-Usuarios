const sql = require('mssql');

let pool = null;

const config = {
	server: process.env.AZURE_SQL_SERVER,
	database: process.env.AZURE_SQL_DATABASE,
	user: process.env.AZURE_SQL_USER,
	password: process.env.AZURE_SQL_PASSWORD,
	port: Number(process.env.AZURE_SQL_PORT || 1433),

	options: {
		encrypt: true,
		trustServerCertificate: false,
		connectTimeout: 30000
	},

	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000
	},

	connectionTimeout: 30000,
	requestTimeout: 30000
};

async function conectarAzureSql() {
	try {
		if (pool && pool.connected) {
			return pool;
		}

		pool = await new sql.ConnectionPool(config).connect();

		console.log('Azure SQL conectado com sucesso!');

		return pool;
	} catch (error) {
		pool = null;

		console.error('Erro ao conectar ao Azure SQL:', error.message);

		throw error;
  	}
}

function obterConexao() {
	if (!pool || !pool.connected) {
		throw new Error('Azure SQL não está conectado.');
	}

	return pool;
}

async function fecharConexao() {
	if (pool) {
		await pool.close();
		pool = null;
	}
}

module.exports = {
	sql,
	conectarAzureSql,
	obterConexao,
	fecharConexao
};