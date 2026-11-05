const respostaErro = (descricao) => ({
    description: descricao,
    content: {
        'application/json': {
            schema: { $ref: '#/components/schemas/Erro' }
        }
    }
});

const respostasSeguranca = {
    401: respostaErro('Token ausente, inválido, expirado ou usuário inativo'),
    403: respostaErro('Usuário sem permissão para esta operação')
};

const swaggerDocument = {
    openapi: '3.0.3',

    info: {
        title: 'Help Flow - API de Usuários',
        version: '1.1.0',
        description:
            'API REST do microserviço de Usuários do Help Flow. ' +
            'Utiliza Azure SQL, autenticação JWT Bearer e controle de acesso ' +
            'pelos perfis ADMIN, ATENDENTE e CLIENTE.'
    },

    servers: [
        {
            url: 'http://localhost:3002',
            description: 'Ambiente local'
        }
    ],

    tags: [
        {
            name: 'Autenticação',
            description: 'Login JWT e cadastro público de clientes'
        },
        {
            name: 'Usuários',
            description: 'Gerenciamento de usuários com controle de permissões'
        },
        {
            name: 'Health Check',
            description: 'Monitoramento do microserviço'
        }
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description:
                    'Informe o token JWT obtido em POST /api/auth/login.'
            }
        },

        schemas: {
            Usuario: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        example: 1
                    },
                    nome: {
                        type: 'string',
                        example: 'Usuario Teste'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'teste@helpflow.com'
                    },
                    perfil: {
                        type: 'string',
                        enum: ['ADMIN', 'ATENDENTE', 'CLIENTE'],
                        example: 'CLIENTE'
                    },
                    ativo: {
                        type: 'boolean',
                        example: true
                    },
                    criadoEm: {
                        type: 'string',
                        format: 'date-time'
                    },
                    atualizadoEm: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },

            CriarUsuario: {
                type: 'object',
                required: ['nome', 'email', 'senha'],
                properties: {
                    nome: {
                        type: 'string',
                        example: 'Novo Usuario'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'novo@helpflow.com'
                    },
                    senha: {
                        type: 'string',
                        format: 'password',
                        minLength: 8,
                        example: 'SenhaSegura123!'
                    },
                    perfil: {
                        type: 'string',
                        enum: ['ADMIN', 'ATENDENTE', 'CLIENTE'],
                        default: 'CLIENTE'
                    }
                }
            },

            RegistrarCliente: {
                type: 'object',
                required: ['nome', 'email', 'senha'],
                properties: {
                    nome: {
                        type: 'string',
                        example: 'Novo Cliente'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'cliente@helpflow.com'
                    },
                    senha: {
                        type: 'string',
                        format: 'password',
                        minLength: 8,
                        example: 'SenhaSegura123!'
                    }
                },
                description:
                    'O perfil é definido automaticamente como CLIENTE. ' +
                    'Não é possível escolher ADMIN ou ATENDENTE.'
            },

            Login: {
                type: 'object',
                required: ['email', 'senha'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'teste@helpflow.com'
                    },
                    senha: {
                        type: 'string',
                        format: 'password',
                        example: 'SenhaSegura123!'
                    }
                }
            },

            LoginResponse: {
                type: 'object',
                properties: {
                    mensagem: {
                        type: 'string',
                        example: 'Login realizado com sucesso.'
                    },
                    token: {
                        type: 'string',
                        description: 'Token JWT assinado'
                    },
                    tokenType: {
                        type: 'string',
                        example: 'Bearer'
                    },
                    usuario: {
                        $ref: '#/components/schemas/Usuario'
                    }
                }
            },

            UsuarioResponse: {
                type: 'object',
                properties: {
                    mensagem: {
                        type: 'string',
                        example: 'Usuário criado com sucesso.'
                    },
                    usuario: {
                        $ref: '#/components/schemas/Usuario'
                    }
                }
            },

            AtualizarUsuario: {
                type: 'object',
                properties: {
                    nome: {
                        type: 'string',
                        example: 'Usuario Atualizado'
                    },
                    email: {
                        type: 'string',
                        format: 'email'
                    },
                    perfil: {
                        type: 'string',
                        enum: ['ADMIN', 'ATENDENTE', 'CLIENTE']
                    },
                    ativo: {
                        type: 'boolean'
                    }
                }
            },

            Erro: {
                type: 'object',
                properties: {
                    erro: {
                        type: 'string',
                        example: 'Você não possui permissão para realizar esta operação.'
                    }
                }
            }
        }
    },

    paths: {
        '/health': {
            get: {
                tags: ['Health Check'],
                summary: 'Verificar funcionamento do microserviço',
                description: 'Endpoint público de monitoramento.',
                responses: {
                    200: {
                        description: 'Microserviço em execução'
                    }
                }
            }
        },

        '/api/auth/login': {
            post: {
                tags: ['Autenticação'],
                summary: 'Autenticar usuário e gerar JWT',
                description:
                    'Valida e-mail e senha e retorna um token JWT. ' +
                    'Usuários inexistentes, desativados ou com senha incorreta ' +
                    'não conseguem autenticar.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Login'
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login realizado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/LoginResponse'
                                }
                            }
                        }
                    },
                    400: respostaErro('E-mail e senha são obrigatórios'),
                    401: respostaErro('E-mail ou senha inválidos'),
                    500: respostaErro('Erro interno ao realizar login')
                }
            }
        },

        '/api/auth/register': {
            post: {
                tags: ['Autenticação'],
                summary: 'Cadastrar cliente publicamente',
                description:
                    'Endpoint público. Todos os usuários cadastrados recebem ' +
                    'obrigatoriamente o perfil CLIENTE, mesmo que outro perfil ' +
                    'seja enviado na requisição.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/RegistrarCliente'
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Cadastro realizado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/UsuarioResponse'
                                }
                            }
                        }
                    },
                    400: respostaErro('Dados inválidos'),
                    409: respostaErro('E-mail já cadastrado'),
                    500: respostaErro('Erro interno ao registrar usuário')
                }
            }
        },

        '/api/usuarios': {
            get: {
                tags: ['Usuários'],
                summary: 'Listar todos os usuários',
                description:
                    'Disponível apenas para ADMIN e ATENDENTE.',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista de usuários',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Usuario'
                                    }
                                }
                            }
                        }
                    },
                    ...respostasSeguranca,
                    500: respostaErro('Erro interno do servidor')
                }
            },

            post: {
                tags: ['Usuários'],
                summary: 'Cadastrar usuário administrativamente',
                description:
                    'Disponível apenas para ADMIN. Permite definir ' +
                    'os perfis ADMIN, ATENDENTE e CLIENTE.',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/CriarUsuario'
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Usuário criado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/UsuarioResponse'
                                }
                            }
                        }
                    },
                    400: respostaErro('Dados inválidos'),
                    ...respostasSeguranca,
                    409: respostaErro('E-mail já cadastrado'),
                    500: respostaErro('Erro interno do servidor')
                }
            }
        },

        '/api/usuarios/{id}': {
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Identificador do usuário',
                    schema: {
                        type: 'integer',
                        minimum: 1
                    }
                }
            ],

            get: {
                tags: ['Usuários'],
                summary: 'Consultar usuário pelo ID',
                description:
                    'ADMIN e ATENDENTE podem consultar qualquer usuário. ' +
                    'CLIENTE pode consultar somente os próprios dados.',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Usuário encontrado',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Usuario'
                                }
                            }
                        }
                    },
                    400: respostaErro('ID inválido'),
                    ...respostasSeguranca,
                    404: respostaErro('Usuário não encontrado'),
                    500: respostaErro('Erro interno do servidor')
                }
            },

            put: {
                tags: ['Usuários'],
                summary: 'Atualizar usuário',
                description:
                    'Disponível apenas para ADMIN. Permite atualizar ' +
                    'nome, e-mail, perfil e status.',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/AtualizarUsuario'
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Usuário atualizado',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/UsuarioResponse'
                                }
                            }
                        }
                    },
                    400: respostaErro('Dados inválidos'),
                    ...respostasSeguranca,
                    404: respostaErro('Usuário não encontrado'),
                    409: respostaErro('E-mail já cadastrado'),
                    500: respostaErro('Erro interno do servidor')
                }
            },

            delete: {
                tags: ['Usuários'],
                summary: 'Excluir usuário',
                description:
                    'Disponível apenas para ADMIN.',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Usuário excluído com sucesso'
                    },
                    400: respostaErro('ID inválido'),
                    ...respostasSeguranca,
                    404: respostaErro('Usuário não encontrado'),
                    500: respostaErro('Erro interno do servidor')
                }
            }
        }
    }
};

module.exports = swaggerDocument;