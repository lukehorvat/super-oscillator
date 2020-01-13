module.exports = {
  presets: [
    ["@babel/preset-env", { useBuiltIns: "usage", corejs: { version: 3 } }]
  ],
  plugins: [
    "@babel/plugin-proposal-function-bind",
    "transform-inline-environment-variables"
  ]
};
