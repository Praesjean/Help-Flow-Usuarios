class Usuario {
    static PERFIS_VALIDOS = Object.freeze([
        'ADMIN',
        'ATENDENTE',
        'CLIENTE'
    ]);

    static CAMPOS_ATUALIZAVEIS = Object.freeze([
        'nome',
        'email',
        'perfil',
        'ativo'
    ]);

    static validarNome(nome, mensagem = 'Nome inválido.') {
        if (typeof nome !== 'string' || !nome.trim()) {
            throw new Error(mensagem);
        }

        return nome.trim();
    }

    static validarEmail(email) {
        if (typeof email !== 'string') {
            throw new Error('E-mail inválido.');
        }

        const emailNormalizado = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
            throw new Error('E-mail inválido.');
        }

        return emailNormalizado;
    }

    static validarPerfil(perfil) {
        if (!this.PERFIS_VALIDOS.includes(perfil)) {
            throw new Error('Perfil inválido.');
        }

        return perfil;
    }

    static validarStatus(ativo) {
        if (
            typeof ativo !== 'boolean' &&
            ativo !== 0 &&
            ativo !== 1
        ) {
            throw new Error('Status inválido.');
        }

        return ativo;
    }

    static criar(dados) {
        if (
            !dados ||
            typeof dados !== 'object' ||
            Array.isArray(dados)
        ) {
            throw new Error('Dados do usuário inválidos.');
        }

        const {
            nome,
            email,
            senhaHash,
            perfil = 'CLIENTE'
        } = dados;

        const nomeValidado = this.validarNome(
            nome,
            'Nome é obrigatório.'
        );

        const emailValidado = this.validarEmail(email);

        if (
            typeof senhaHash !== 'string' ||
            !senhaHash.trim()
        ) {
            throw new Error('Hash da senha é obrigatório.');
        }

        return {
            nome: nomeValidado,
            email: emailValidado,
            senhaHash,
            perfil: this.validarPerfil(perfil)
        };
    }

    static prepararAtualizacao(usuarioAtual, dados) {
        if (
            !dados ||
            typeof dados !== 'object' ||
            Array.isArray(dados)
        ) {
            throw new Error('Dados inválidos.');
        }

        const campos = Object.keys(dados);

        if (campos.length === 0) {
            throw new Error('Informe pelo menos um campo.');
        }

        for (const campo of campos) {
            if (!this.CAMPOS_ATUALIZAVEIS.includes(campo)) {
                throw new Error(`Campo não permitido: ${campo}`);
            }
        }

        const usuario = {
            ...usuarioAtual,
            ...dados
        };

        return {
            nome: this.validarNome(usuario.nome),
            email: this.validarEmail(usuario.email),
            perfil: this.validarPerfil(usuario.perfil),
            ativo: this.validarStatus(usuario.ativo)
        };
    }
}

module.exports = Usuario;