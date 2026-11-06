const Usuario = require('../../src/domain/entities/Usuario');

describe('Domain - Entidade Usuario', () => {
    const dadosValidos = {
        nome: 'João Silva',
        email: 'joao@helpflow.com',
        senhaHash: 'hash-seguro'
    };

    describe('Criação de usuário', () => {
        test('deve criar usuário com perfil CLIENTE por padrão', () => {
            const usuario = Usuario.criar(dadosValidos);

            expect(usuario).toEqual({
                nome: 'João Silva',
                email: 'joao@helpflow.com',
                senhaHash: 'hash-seguro',
                perfil: 'CLIENTE'
            });
        });

        test('deve aceitar perfil ADMIN', () => {
            const usuario = Usuario.criar({
                ...dadosValidos,
                perfil: 'ADMIN'
            });

            expect(usuario.perfil).toBe('ADMIN');
        });

        test('deve normalizar nome e e-mail', () => {
            const usuario = Usuario.criar({
                ...dadosValidos,
                nome: '  João Silva  ',
                email: '  JOAO@HELPFLOW.COM  '
            });

            expect(usuario.nome).toBe('João Silva');
            expect(usuario.email).toBe('joao@helpflow.com');
        });

        test('deve rejeitar nome vazio', () => {
            expect(() => Usuario.criar({
                ...dadosValidos,
                nome: ''
            })).toThrow('Nome é obrigatório.');
        });

        test('deve rejeitar e-mail inválido', () => {
            expect(() => Usuario.criar({
                ...dadosValidos,
                email: 'email-invalido'
            })).toThrow('E-mail inválido.');
        });

        test('deve rejeitar hash de senha vazio', () => {
            expect(() => Usuario.criar({
                ...dadosValidos,
                senhaHash: ''
            })).toThrow('Hash da senha é obrigatório.');
        });

        test('deve rejeitar perfil inválido', () => {
            expect(() => Usuario.criar({
                ...dadosValidos,
                perfil: 'SUPERUSER'
            })).toThrow('Perfil inválido.');
        });

        test('deve rejeitar dados nulos', () => {
            expect(() => Usuario.criar(null))
                .toThrow('Dados do usuário inválidos.');
        });
    });

    describe('Atualização de usuário', () => {
        const usuarioAtual = {
            id: 1,
            nome: 'João Silva',
            email: 'joao@helpflow.com',
            perfil: 'CLIENTE',
            ativo: true
        };

        test('deve atualizar o nome', () => {
            const resultado = Usuario.prepararAtualizacao(
                usuarioAtual,
                { nome: 'Maria Silva' }
            );

            expect(resultado.nome).toBe('Maria Silva');
        });

        test('deve normalizar o e-mail atualizado', () => {
            const resultado = Usuario.prepararAtualizacao(
                usuarioAtual,
                { email: '  MARIA@HELPFLOW.COM  ' }
            );

            expect(resultado.email).toBe('maria@helpflow.com');
        });

        test('deve aceitar perfil ATENDENTE', () => {
            const resultado = Usuario.prepararAtualizacao(
                usuarioAtual,
                { perfil: 'ATENDENTE' }
            );

            expect(resultado.perfil).toBe('ATENDENTE');
        });

        test('deve aceitar desativação do usuário', () => {
            const resultado = Usuario.prepararAtualizacao(
                usuarioAtual,
                { ativo: false }
            );

            expect(resultado.ativo).toBe(false);
        });

        test('deve rejeitar status inválido', () => {
            expect(() => Usuario.prepararAtualizacao(
                usuarioAtual,
                { ativo: 'INATIVO' }
            )).toThrow('Status inválido.');
        });

        test('deve impedir alteração de senhaHash', () => {
            expect(() => Usuario.prepararAtualizacao(
                usuarioAtual,
                { senhaHash: 'outro-hash' }
            )).toThrow('Campo não permitido: senhaHash');
        });

        test('deve rejeitar atualização vazia', () => {
            expect(() => Usuario.prepararAtualizacao(
                usuarioAtual,
                {}
            )).toThrow('Informe pelo menos um campo.');
        });

        test('deve rejeitar perfil inválido', () => {
            expect(() => Usuario.prepararAtualizacao(
                usuarioAtual,
                { perfil: 'GERENTE' }
            )).toThrow('Perfil inválido.');
        });

        test('deve aceitar atualização de múltiplos campos', () => {
            const resultado = Usuario.prepararAtualizacao(
                usuarioAtual,
                {
                    nome: 'Maria Silva',
                    perfil: 'ADMIN',
                    ativo: true
                }
            );

            expect(resultado).toEqual({
                nome: 'Maria Silva',
                email: 'joao@helpflow.com',
                perfil: 'ADMIN',
                ativo: true
            });
        });
    });
});