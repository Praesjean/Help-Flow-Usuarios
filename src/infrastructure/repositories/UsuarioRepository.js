const {
    sql,
    obterConexao
} = require('../database/azureSql');

class UsuarioRepository {
    async criar(dados) {
        const pool = obterConexao();

        const resultado = await pool.request()
            .input('nome', sql.NVarChar(150), dados.nome)
            .input('email', sql.NVarChar(255), dados.email)
            .input('senhaHash', sql.NVarChar(255), dados.senhaHash)
            .input('perfil', sql.NVarChar(30), dados.perfil || 'CLIENTE')
            .query(`
                INSERT INTO Usuarios (nome, email, senhaHash, perfil)
                OUTPUT
                INSERTED.id,
                INSERTED.nome,
                INSERTED.email,
                INSERTED.perfil,
                INSERTED.ativo,
                INSERTED.criadoEm,
                INSERTED.atualizadoEm
                VALUES (@nome, @email, @senhaHash, @perfil)
            `);

        return resultado.recordset[0];
    }

    async listar() {
        const pool = obterConexao();

        const resultado = await pool.request().query(`
            SELECT
                id,
                nome,
                email,
                perfil,
                ativo,
                criadoEm,
                atualizadoEm
            FROM Usuarios
            ORDER BY criadoEm DESC, id DESC
        `);

        return resultado.recordset;
    }

    async buscarPorId(id) {
        const pool = obterConexao();

        const resultado = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT
                id,
                nome,
                email,
                perfil,
                ativo,
                criadoEm,
                atualizadoEm
                FROM Usuarios
                WHERE id = @id
            `);

        return resultado.recordset[0] || null;
    }
    
    async buscarPorEmail(email) {
        const pool = obterConexao();

        const resultado = await pool.request()
            .input('email', sql.NVarChar(255), email)
            .query(`
                SELECT
                    id,
                    nome,
                    email,
                    senhaHash,
                    perfil,
                    ativo,
                    criadoEm,
                    atualizadoEm
                FROM Usuarios
                WHERE email = @email
            `);

        return resultado.recordset[0] || null;
    }

    async atualizar(id, dados) {
        const pool = obterConexao();

        const resultado = await pool.request()
            .input('id', sql.Int, id)
            .input('nome', sql.NVarChar(150), dados.nome)
            .input('email', sql.NVarChar(255), dados.email)
            .input('perfil', sql.NVarChar(30), dados.perfil)
            .input('ativo', sql.Bit, dados.ativo)
            .query(`
                UPDATE Usuarios
                SET
                    nome = @nome,
                    email = @email,
                    perfil = @perfil,
                    ativo = @ativo,
                    atualizadoEm = SYSUTCDATETIME()
                OUTPUT
                    INSERTED.id,
                    INSERTED.nome,
                    INSERTED.email,
                    INSERTED.perfil,
                    INSERTED.ativo,
                    INSERTED.criadoEm,
                    INSERTED.atualizadoEm
                WHERE id = @id
            `);

        return resultado.recordset[0] || null;
    }

    async excluir(id) {
        const pool = obterConexao();

        const resultado = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                DELETE FROM Usuarios
                OUTPUT DELETED.id
                WHERE id = @id
        `);

        return resultado.recordset.length > 0;
    }
}

module.exports = new UsuarioRepository();