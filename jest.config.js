/** @type {import('ts-jest').JestConfigWithTsJest} */
require('dotenv').config({ path: './.env.local' });

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/src/tests/**/*.test.ts',
    '**/src/tests/**/*.test.tsx',
    '**/*.test.tsx'
  ],
  transform: {
    '^.+\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss)$': '<rootDir>/src/tests/__mocks__/styleMock.js',
  }
};