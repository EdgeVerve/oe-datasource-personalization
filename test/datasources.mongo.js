/**
 *
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */
var mongoHost = process.env.MONGO_HOST || 'localhost';
var dbName = process.env.DB_NAME || 'oe-datasource-personalization-test';
if (process.env.DB_NAME) {
  dbName2 = process.env.DB_NAME + '-appdb';
}
else
  dbName2 = 'oe-datasource-appdb';

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
    "host": mongoHost,
    "port": 27017,
    "url": "mongodb://" + mongoHost + ":27017/" + dbName,
    "database": dbName,
    "password": "admin",
    "name": "db",
    "connector": "mongodb",
    "user": "admin",
    "connectionTimeout": 500000
  },
  "appdb": {
    "host": mongoHost,
    "port": 27017,
    "url": "mongodb://" + mongoHost + ":27017/" + dbName2,
    "database": dbName2,
    "password": "admin",
    "name": "appdb",
    "connector": "mongodb",
    "user": "admin",
    "connectionTimeout": 500000
  }
};

