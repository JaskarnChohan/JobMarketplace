module.exports = {
    transform: {
      '^.+\\.[t|j]sx?$': 'babel-jest',
    },
    moduleNameMapper: {
      '^axios$': '<rootDir>/__mocks__/axios.js'
    },
  };