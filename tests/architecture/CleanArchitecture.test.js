const fs = require('fs');
const path = require('path');

describe('Arquitetura - Clean Architecture', () => {
    const srcPath = path.resolve(__dirname, '../../src');

    const lerArquivosJavaScript = (diretorio) => {
        if (!fs.existsSync(diretorio)) {
            return [];
        }

        const arquivos = [];

        for (const item of fs.readdirSync(diretorio, {
            withFileTypes: true
        })) {
            const caminho = path.join(diretorio, item.name);

            if (item.isDirectory()) {
                arquivos.push(...lerArquivosJavaScript(caminho));
            } else if (item.name.endsWith('.js')) {
                arquivos.push(caminho);
            }
        }

        return arquivos;
    };

    const obterDependencias = (arquivo) => {
        const conteudo = fs.readFileSync(arquivo, 'utf8');

        const regex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

        return [...conteudo.matchAll(regex)].map(
            resultado => resultado[1]
        );
    };

    test('deve possuir as quatro camadas principais', () => {
        for (const camada of [
            'api',
            'application',
            'domain',
            'infrastructure'
        ]) {
            expect(
                fs.existsSync(path.join(srcPath, camada))
            ).toBe(true);
        }
    });

    test('deve possuir a entidade de domínio Usuario', () => {
        expect(
            fs.existsSync(
                path.join(srcPath, 'domain/entities/Usuario.js')
            )
        ).toBe(true);
    });

    test('deve organizar os casos de uso por funcionalidade', () => {
        const featuresPath = path.join(
            srcPath,
            'application/features'
        );

        const funcionalidades = [
            'createUsuario',
            'deleteUsuario',
            'getUsuario',
            'listUsuarios',
            'loginUsuario',
            'updateUsuario'
        ];

        for (const funcionalidade of funcionalidades) {
            expect(
                fs.existsSync(
                    path.join(featuresPath, funcionalidade)
                )
            ).toBe(true);
        }
    });

    test('a camada Domain não deve depender de outras camadas', () => {
        const arquivos = lerArquivosJavaScript(
            path.join(srcPath, 'domain')
        );

        expect(arquivos.length).toBeGreaterThan(0);

        for (const arquivo of arquivos) {
            const dependencias = obterDependencias(arquivo);

            for (const dependencia of dependencias) {
                expect(dependencia).not.toMatch(
                    /(?:^|\/)(api|application|infrastructure)(?:\/|$)/
                );
            }
        }
    });

    test('a camada Domain não deve depender de frameworks', () => {
        const arquivos = lerArquivosJavaScript(
            path.join(srcPath, 'domain')
        );

        const frameworksProibidos = [
            'express',
            'mssql',
            'mongoose',
            'bcryptjs',
            'jsonwebtoken'
        ];

        for (const arquivo of arquivos) {
            const dependencias = obterDependencias(arquivo);

            for (const dependencia of dependencias) {
                expect(frameworksProibidos).not.toContain(
                    dependencia
                );
            }
        }
    });

    test('a camada Application não deve importar API ou Infrastructure', () => {
        const arquivos = lerArquivosJavaScript(
            path.join(srcPath, 'application')
        );

        expect(arquivos.length).toBeGreaterThan(0);

        for (const arquivo of arquivos) {
            const dependencias = obterDependencias(arquivo);

            for (const dependencia of dependencias) {
                expect(dependencia).not.toMatch(
                    /(?:^|\/)(api|infrastructure)(?:\/|$)/
                );
            }
        }
    });

    test('a camada Application deve utilizar a entidade de domínio', () => {
        const criar = fs.readFileSync(
            path.join(
                srcPath,
                'application/features/createUsuario/CreateUsuarioUseCase.js'
            ),
            'utf8'
        );

        const atualizar = fs.readFileSync(
            path.join(
                srcPath,
                'application/features/updateUsuario/UpdateUsuarioUseCase.js'
            ),
            'utf8'
        );

        expect(criar).toContain('domain/entities/Usuario');
        expect(atualizar).toContain('domain/entities/Usuario');
    });
});