class UpdateUsuarioUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async executar(id, dados) {
        if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
            throw new Error('ID do usuário inválido.');
        }

        if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
            throw new Error('Dados inválidos.');
        }

        const camposPermitidos = ['nome', 'email', 'perfil', 'ativo'];

        if (Object.keys(dados).length === 0) {
            throw new Error('Informe pelo menos um campo.');
        }

        for (const campo of Object.keys(dados)) {
            if (!camposPermitidos.includes(campo)) {
                throw new Error(`Campo não permitido: ${campo}`);
            }
        }

        const usuarioAtual = await this.repository.buscarPorId(Number(id));

        if (!usuarioAtual) {
            return null;
        }

        const usuario = { ...usuarioAtual, ...dados };

        if (typeof usuario.nome !== 'string' || !usuario.nome.trim()) {
            throw new Error('Nome inválido.');
        }

        if (typeof usuario.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email)) {
            throw new Error('E-mail inválido.');
        }

        if (!['ADMIN', 'ATENDENTE', 'CLIENTE'].includes(usuario.perfil)) {
            throw new Error('Perfil inválido.');
        }

        if (typeof usuario.ativo !== 'boolean' && usuario.ativo !== 0 && usuario.ativo !== 1) {
            throw new Error('Status inválido.');
        }

        return this.repository.atualizar(Number(id), {
            nome: usuario.nome.trim(),
            email: usuario.email.trim().toLowerCase(),
            perfil: usuario.perfil,
            ativo: usuario.ativo
        });
    }
}

module.exports = UpdateUsuarioUseCase;