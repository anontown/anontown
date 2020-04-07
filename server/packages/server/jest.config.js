module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["**/src/**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "\\.d\\.ts$"],
  coverageReporters: ["html", "json"],
  testEnvironment: "node",
  verbose: true,
  setupFilesAfterEnv: ["./jest.setup.js"],
};
