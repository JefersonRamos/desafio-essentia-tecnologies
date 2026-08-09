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
  },
} as const;
