class CreateUsuarioUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async executar(dados) {
        if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
            throw new Error('Dados do usuário inválidos.');
        }

        const {
            nome,
            email,
            senhaHash,
            perfil = 'CLIENTE'
        } = dados;

        if (typeof nome !== 'string' || !nome.trim()) {
            throw new Error('Nome é obrigatório.');
        }

        if (typeof email !== 'string') {
            throw new Error('E-mail inválido.');
        }

        const emailNormalizado = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
            throw new Error('E-mail inválido.');
        }

        if (typeof senhaHash !== 'string' || !senhaHash.trim()) {
            throw new Error('Hash da senha é obrigatório.');
        }

        const perfisPermitidos = ['ADMIN', 'ATENDENTE', 'CLIENTE'];

        if (!perfisPermitidos.includes(perfil)) {
            throw new Error('Perfil inválido.');
        }

        return this.repository.criar({
            nome: nome.trim(),
            email: emailNormalizado,
            senhaHash,
            perfil
        });
    }
}

module.exports = CreateUsuarioUseCase;