module.exports = {
  apps: [{
    name: 'snapcal-api',
    script: 'dist/index.js',
    env_production: {
      NODE_ENV: 'production'
    },
    instances: 'max',
    exec_mode: 'cluster'
  }]
};