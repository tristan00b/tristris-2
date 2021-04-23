import babel from '@babel/core'

process.env.BABEL_ENV = 'test'

export default function (wallaby) {

  return {
    files: [
      { pattern: 'app/scripts/**/*.js' },
      { pattern: 'test/mock/**/*.mock.js' }
    ],

    tests: [
      { pattern: 'test/**/*.spec.js' }
    ],

    env: {
      type: 'node',
      runner: 'node'
    },

    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },

    hints: {
      ignoreCoverage: /ignore coverage/
    },

    testFramework: 'jest',

    workers: { recycle: true }
  }
}
