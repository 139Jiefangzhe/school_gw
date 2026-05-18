const { loadEnv } = require("@medusajs/framework/utils");
loadEnv(process.env.NODE_ENV || "test", process.cwd());

module.exports = {
  transform: {
    "^.+\\.[jt]s$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            decorators: true,
          },
          baseUrl: ".",
          paths: {
            "src/*": ["./src/*"],
          },
        },
        module: {
          type: "es6",
        },
      },
    ],
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json"],
  modulePathIgnorePatterns: ["dist/", ".medusa/", "node_modules/"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setup-tests.ts"],
  testTimeout: 60000,
};
