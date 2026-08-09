import parser from '@typescript-eslint/parser';

const REMOCAO_FISICA =
  'Use softDelete — remoção física quebra a auditoria, que aponta para a linha.';

function proibirDelete(modelo) {
  return ['delete', 'deleteMany'].map((metodo) => ({
    selector: `CallExpression[callee.property.name='${metodo}'][callee.object.property.name='${modelo}']`,
    message: REMOCAO_FISICA,
  }));
}

export default [
  { ignores: ['src/generated/**', 'dist/**', 'node_modules/**'] },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: { ecmaVersion: 2023, sourceType: 'module' },
    },
    rules: {
      'no-restricted-syntax': ['error', ...proibirDelete('task'), ...proibirDelete('user')],
    },
  },
];
