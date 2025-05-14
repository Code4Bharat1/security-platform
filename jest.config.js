const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters:['lcov' , 'text']
});

