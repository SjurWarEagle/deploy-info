module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(.*(\\.|/)(test|spec))\\.tsx?$',
  verbose: false,
  reporters: ['default'],
};

// set some environment variables for the test, so that it is using the correct settings for the database.
// this is done here, so that it doesn't need to be set in each test
process.env.stage = 'unit';
