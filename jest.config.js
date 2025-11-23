module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "services/**/*.js",
    "routes/**/*.js",
    "data/**/*.js",
    "server.js",
  ],
};
