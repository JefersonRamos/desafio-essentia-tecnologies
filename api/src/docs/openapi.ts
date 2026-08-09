export const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'TechX API',
    version: '0.1.0',
    description: 'API de gerenciamento de tarefas.',
  },
  servers: [{ url: '/api', description: 'Através do nginx' }],
  tags: [
    { name: 'Sistema', description: 'Estado do serviço' },
    { name: 'Autenticação', description: 'Login e sessão' },
    { name: 'Usuários', description: 'Cadastro e gestão da própria conta' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['id', 'name', 'email'],
        properties: {
          id: { type: 'string', format: 'uuid', example: '49936b27-e260-47aa-82e1-5a4dd85639f5' },
          name: { type: 'string', example: 'Candidato' },
          email: { type: 'string', format: 'email', example: 'dev@axyo.com.br' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'dev@axyo.com.br' },
          password: { type: 'string', format: 'password', example: 'senha123' },
        },
      },
      LoginResponse: {
        type: 'object',
        required: ['token', 'user'],
        properties: {
          token: { type: 'string', description: 'JWT para o header Authorization' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 255, example: 'Candidato' },
          email: { type: 'string', format: 'email', maxLength: 255, example: 'dev@axyo.com.br' },
          password: { type: 'string', format: 'password', minLength: 8, maxLength: 128, example: 'senha123' },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        description: 'Ao menos um entre name, email e password. Trocar a senha exige currentPassword.',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 255, example: 'Candidato Silva' },
          email: { type: 'string', format: 'email', maxLength: 255, example: 'novo@axyo.com.br' },
          password: { type: 'string', format: 'password', minLength: 8, maxLength: 128, example: 'novasenha123' },
          currentPassword: { type: 'string', format: 'password', example: 'senha123' },
        },
      },
      UserResponse: {
        type: 'object',
        required: ['user'],
        properties: { user: { $ref: '#/components/schemas/User' } },
      },
      Error: {
        type: 'object',
        required: ['code', 'error'],
        properties: {
          code: {
            type: 'string',
            description: 'Identificador estável da condição, independente do idioma.',
            example: 'auth.invalid_credentials',
          },
          error: {
            type: 'string',
            description: 'Mensagem traduzida conforme o idioma negociado.',
            example: 'Credenciais inválidas',
          },
          details: {
            type: 'array',
            description: 'Presente apenas quando a validação do corpo reprova campos.',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address' },
              },
            },
          },
        },
      },
      Health: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          uptime: { type: 'number', example: 143.27 },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Token ausente, expirado ou inválido',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      BadRequest: {
        description: 'Corpo da requisição inválido',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Forbidden: {
        description: 'Autenticado, mas a conta não é sua',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Usuário inexistente ou removido',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      EmailConflict: {
        description: 'E-mail já cadastrado',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Estado do serviço',
        responses: {
          200: {
            description: 'Serviço no ar',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Health' } } },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autentica e devolve um token',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Autenticado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: {
            description: 'Credenciais inválidas. A resposta é a mesma para e-mail inexistente e senha errada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Autenticação'],
        summary: 'Usuário do token atual',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Usuário autenticado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/users': {
      post: {
        tags: ['Usuários'],
        summary: 'Cadastra um usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateUserRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Usuário criado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: { $ref: '#/components/responses/EmailConflict' },
        },
      },
    },
    '/users/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Precisa ser o id do próprio token: não há papel de administrador.',
        },
      ],
      get: {
        tags: ['Usuários'],
        summary: 'Consulta a própria conta',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Usuário',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Usuários'],
        summary: 'Atualiza a própria conta',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Usuário atualizado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/EmailConflict' },
        },
      },
      delete: {
        tags: ['Usuários'],
        summary: 'Remove a própria conta',
        description: 'Remoção lógica: a linha permanece com deleted_at e o e-mail segue reservado.',
        security: [{ bearerAuth: [] }],
        responses: {
          204: { description: 'Removido' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
} as const;
