/**
 *
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */
var postgresHost = process.env.POSTGRES_HOST || 'localhost';
var dbName = process.env.DB_NAME || 'oe-datasource-personalization-test';
var dbName2 = 'oe-datasource-appdb';
module.exports = 
{
  "memdb": {
    "name": "memdb",
    "connector": "memory"
  },
  "transient": {
    "name": "transient",
    "connector": "transient"
  },

  "db": {
    "host": postgresHost,
    "port": 5432,
    "url": "postgres://postgres:postgres@" + postgresHost + ":5432/" + dbName,
    "database": dbName,
    "password": "postgres",
    "enableDbCreation" : true,
    "name": "db",
    "connector": "oe-connector-postgresql",
    "user": "postgres",
    "connectionTimeout": 50000
  },

  "appdb": {
    "host": postgresHost,
    "port": 5432,
    "url": "postgres://postgres:postgres@" + postgresHost + ":5432/" + dbName2,
    "database": dbName2,
    "password": "postgres",
    "enableDbCreation": true,
    "name": "appdb",
    "connector": "oe-connector-postgresql",
    "user": "postgres",
    "connectionTimeout": 50000
  }
};

