/**
 * Jest configuration for React + TypeScript
 * Using .cjs extension because package.json has "type": "module"
 */

module.exports = {
  // Use ts-jest preset
  preset: 'ts-jest/presets/default-esm',
  
  // Test environment
  testEnvironment: 'jsdom',

  // Root directory
  roots: ['<rootDir>/src'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],

  // Module paths
  modulePaths: ['<rootDir>/src'],

  // Transform files with ts-jest
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          module: 'ESNext',
          moduleResolution: 'node',
        },
      },
    ],
  },

  // Module name mapper for imports
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/test/__mocks__/fileMock.cjs',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx)',
    '**/?(*.)+(spec|test).+(ts|tsx)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],

  // Coverage thresholds (70%)
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Extensions to treat as ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Verbose output
  verbose: true,
};
