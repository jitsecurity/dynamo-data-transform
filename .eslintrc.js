module.exports = {
  extends: [
    'eslint:recommended',
    'eslint-config-airbnb-base',
  ],

  env: {
    jest: true,
    node: true,
  },

  globals: {},

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  rules: {
    'no-await-in-loop': 'off',
    'lines-between-class-members': 'off',
    'no-console': 'off',
    'consistent-return': 'off',
    'arrow-body-style': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'no-restricted-syntax': 'off',
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
  },
  overrides: [
    {
      files: ['*template-file.js'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'import/no-unresolved': 'off',
      },
    },
    {
      files: ['*.js'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'import/no-unresolved': 'off',
      },
    },
  ],

};
