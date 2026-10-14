const path = require('node:path');
const { register } = require('tsconfig-paths');

process.env.TSX_TSCONFIG_PATH = path.join(__dirname, 'tsconfig.json');

register({
  baseUrl: __dirname,
  paths: {
    '@library/*': ['library/*'],
    '@support/*': ['features/support/*'],
  },
});

module.exports = {
  default: {
    paths: ['healthhub/features/**/*.feature'],
    requireModule: ['tsx/cjs'],
    require: [
      'healthhub/features/support/**/*.ts',
      'healthhub/features/step-definitions/**/*.ts',
    ],
    format: ['progress'],
    publishQuiet: true,
    parallel: 1,
  },
};