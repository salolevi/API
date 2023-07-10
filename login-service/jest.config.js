/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testEnvironmentOptions: {
    url: 'https://jestjs.io/',
    port: 3001
  },
  roots: ['./src']
};