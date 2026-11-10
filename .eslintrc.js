module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['no-relative-import-paths'],
  rules: {
    // Enforce @/ alias — no ../../ relative paths inside src/
    'no-relative-import-paths/no-relative-import-paths': [
      'error',
      { allowSameFolder: true, rootDir: 'src', prefix: '@' },
    ],
    // Align with no-any from copilot-instructions
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
