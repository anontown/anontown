module.exports = {
  env: {
    browser: true,
  },
  extends: ["plugin:react/recommended", "prettier/react"],
  rules: {
    "@typescript-eslint/no-floating-promises": "warn", // そのうちエラーにしたい(Reactのコールバック的に今は無理)
    "react/jsx-boolean-value": ["error", "always"],
    "react/display-name": "warn",
  },
  settings: {
    react: {
      createClass: "createReactClass",
      pragma: "React",
      version: "16.8",
    },
  },
};
