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
    { name: 'Autenticação', description: 'Cadastro, login e sessão' },
    { name: 'Usuários', description: 'Gestão da própria conta' },
    { name: 'Tarefas', description: 'To-do list do usuário autenticado' },
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
      SessionResponse: {
        type: 'object',
        required: ['token', 'user'],
        properties: {
          token: { type: 'string', description: 'JWT para o header Authorization' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      RegisterRequest: {
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
      Task: {
        type: 'object',
        required: ['id', 'title', 'description', 'done', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', format: 'uuid', example: 'b3f1c0de-9a2b-4d77-8f3e-1c6a5d0e2b41' },
          title: { type: 'string', example: 'Configurar projeto Angular' },
          description: {
            type: 'string',
            nullable: true,
            example: 'Subir a stack e validar o hot reload',
          },
          done: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateTaskRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255, example: 'Configurar projeto Angular' },
          description: {
            type: 'string',
            nullable: true,
            maxLength: 5000,
            example: 'Subir a stack e validar o hot reload',
          },
        },
      },
      UpdateTaskRequest: {
        type: 'object',
        description:
          'Ao menos um entre title, description e done. Marcar como concluída é done: true.',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255, example: 'Configurar projeto Angular' },
          description: { type: 'string', nullable: true, maxLength: 5000, example: null },
          done: { type: 'boolean', example: true },
        },
      },
      TaskResponse: {
        type: 'object',
        required: ['task'],
        properties: { task: { $ref: '#/components/schemas/Task' } },
      },
      TaskListResponse: {
        type: 'object',
        required: ['tasks', 'nextCursor'],
        properties: {
          tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
          nextCursor: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description:
              'Passe em cursor para pedir a página seguinte. null quando não há mais nada.',
            example: 'b3f1c0de-9a2b-4d77-8f3e-1c6a5d0e2b41',
          },
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
      TaskNotFound: {
        description: 'Tarefa inexistente, removida ou de outro usuário',
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
    '/auth/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastra e já devolve a sessão',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Usuário criado e autenticado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SessionResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: { $ref: '#/components/responses/EmailConflict' },
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
              'application/json': { schema: { $ref: '#/components/schemas/SessionResponse' } },
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
    '/auth/logout': {
      post: {
        tags: ['Autenticação'],
        summary: 'Revoga o token atual',
        description:
          'Grava o jti do token na denylist até o exp original. O token continua com assinatura válida, mas passa a ser recusado.',
        security: [{ bearerAuth: [] }],
        responses: {
          204: { description: 'Token revogado' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/tasks': {
      get: {
        tags: ['Tarefas'],
        summary: 'Lista as tarefas do usuário',
        description:
          'Pendentes primeiro, depois as mais recentes, com o id como desempate para a ordem ser total. Paginação por cursor: repita a chamada passando o nextCursor devolvido até ele vir null. Nunca inclui tarefas de outro usuário.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            description: 'Quantas tarefas trazer por página.',
          },
          {
            name: 'cursor',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'uuid' },
            description:
              'O nextCursor da página anterior. Trate como opaco: hoje é o id da última tarefa da página. Cursor de tarefa removida ou de outro usuário responde 400.',
          },
        ],
        responses: {
          200: {
            description: 'Tarefas do usuário autenticado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/TaskListResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Tarefas'],
        summary: 'Cria uma tarefa',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateTaskRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Tarefa criada',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/TaskResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/tasks/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description:
            'Tarefa do próprio usuário: a de outro responde 404, não 403. Fora do formato uuid, 400.',
        },
      ],
      get: {
        tags: ['Tarefas'],
        summary: 'Consulta uma tarefa',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Tarefa',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/TaskResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/TaskNotFound' },
        },
      },
      patch: {
        tags: ['Tarefas'],
        summary: 'Atualiza a tarefa ou marca como concluída',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateTaskRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Tarefa atualizada',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/TaskResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/TaskNotFound' },
        },
      },
      delete: {
        tags: ['Tarefas'],
        summary: 'Remove uma tarefa',
        description: 'Remoção lógica: a linha permanece com deleted_at e some das consultas.',
        security: [{ bearerAuth: [] }],
        responses: {
          204: { description: 'Removida' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/TaskNotFound' },
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
