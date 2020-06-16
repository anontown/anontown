module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended",
    "prettier",
    "prettier/@typescript-eslint",
    "prettier/react",
  ],
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/array-type": [
      "error",
      {
        default: "generic",
      },
    ],
    "@typescript-eslint/await-thenable": "error",
    // "@typescript-eslint/return-await": ["error", "always"], // なんかasync関数じゃないのにfixしたらawaitつけてくる…
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-floating-promises": "warn", // そのうちエラーにしたい(Reactのコールバック的に今は無理)
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-function-type": "error",
    complexity: "warn", // 便利そう
    eqeqeq: ["error"],
    "guard-for-in": "error",
    "new-parens": "error",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-console": "warn", // そのうち
    "no-fallthrough": "error",
    "no-new-wrappers": "error",
    "no-shadow": [
      "error",
      {
        builtinGlobals: false, // そのうち
        hoist: "all",
      },
    ],
    "no-constant-condition": [
      "error",
      {
        checkLoops: false,
      },
    ],
    "no-unsafe-finally": "error",
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": "error",
    "no-var": "error",
    "prefer-const": "error",
    // strict-type-predicates入れたい: https://github.com/typescript-eslint/typescript-eslint/pull/738
    "react/jsx-boolean-value": ["error", "always"],
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    // unused-importがほしい: https://github.com/typescript-eslint/typescript-eslint/issues/371
    "react/display-name": "warn",
    "@typescript-eslint/no-use-before-define": [
      "warn",
      {
        functions: false,
      },
    ],
    "@typescript-eslint/require-await": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": [
      "warn", // そのうちerrorに
      {
        allowHigherOrderFunctions: true,
      },
    ],
  },
  settings: {
    react: {
      createClass: "createReactClass",
      pragma: "React",
      version: "detect",
    },
  },
};
