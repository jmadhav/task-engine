var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'task-engine'
    },
    port: process.env.PORT || 3000,
    host: 'localhost',
    db: 'mongodb://localhost/task-engine-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'task-engine'
    },
    port: process.env.PORT || 3000,
    host: 'localhost',
    db: 'mongodb://localhost/task-engine-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'task-engine'
    },
    port: process.env.PORT || 3000,
    host: 'localhost',
    db: 'mongodb://localhost/task-engine-production'
  }
};

module.exports = config[env];
