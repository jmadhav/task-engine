var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'google-ads'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/google-ads-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'google-ads'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/google-ads-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'google-ads'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/google-ads-production'
  }
};

module.exports = config[env];
