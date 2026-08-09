export const ptBR = {
  auth: {
    credentialsRequired: 'E-mail e senha são obrigatórios',
    invalidCredentials: 'Credenciais inválidas',
    tokenMissing: 'Token ausente',
    tokenInvalid: 'Token inválido',
    tokenRevoked: 'Token revogado',
  },
  users: {
    emailTaken: 'E-mail já cadastrado',
    notFound: 'Usuário não encontrado',
    forbidden: 'Você só pode acessar a própria conta',
    currentPasswordInvalid: 'Senha atual inválida',
  },
  tasks: {
    notFound: 'Tarefa não encontrada',
  },
  common: {
    notFound: 'Rota não encontrada',
    internalError: 'Erro interno',
    validationError: 'Dados inválidos',
  },
} as const;

export type Messages = {
  [Group in keyof typeof ptBR]: Record<keyof (typeof ptBR)[Group], string>;
};
