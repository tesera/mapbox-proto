'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  THUNDERFOREST_API_KEY: '"ff492c0022d148baae1166b91cc9cded"',
  API_URL: '"http://localhost:3000"'
})
