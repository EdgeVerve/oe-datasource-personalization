/**
 *
 * �2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */

// Author : Atul

// This file contains wrapper functions - This functions usually override behavior of existing functions.
// 1. addSettingsToDataSourceDefinition() - This will add/merge settings to DataSourceDefinition model
// 2. setDataSourceDefinitionAutoscope() - This function can be used to configure autoscope fields on DataSourceDefinition Model
// 3. callSetDataSourceN - this function is called before all DAO method (like create/upsert/find etc). This function calls .setDataSource() method on model
// N in callSetDataSourceN method depict how many parameters function expects.
// If setDataSource() is not available on Model, it doesn't do anthing. setDataSource() is made available on Model from mixin.

const loopback = require('loopback');
const DataSource = loopback.DataSource;
const DataAccessObject = DataSource.DataAccessObject;
const oecloudutil = require('oe-cloud/lib/common/util');

var newProperties = {
  properties: {
    modelName: {
      type: 'string'
    },
    enableDbCreation: {
      type: 'boolean'
    },
    autoscope: {
      type: [
        'string'
      ]
    }
  },
  autoscope: [],
  mixins: {
    MultiTenancyMixin: true
  },
  upward: true,
  depth: '*'
};


module.exports = function (app) {
  app.addSettingsToDataSourceDefinition = function (s) {
    var basemodel = require('oe-cloud/common/models/data-source-definition.json');
    oecloudutil.mergeObjects(basemodel, s);
  };

  app.addSettingsToDataSourceDefinition(newProperties);
  app.setDataSourceDefinitionAutoscope = function (autoscopeFields) {
    var obj = {
      autoscope: autoscopeFields
    };
    app.addSettingsToDataSourceDefinition(obj);
  };
};

function callSetDataSource4(args) {
  if (!this.setDataSource) {
    return;
  }
  if (args.length < 4) {
    throw new Error('options must be passed');
  }
  this.setDataSource(args[2]);
}

function callSetDataSource3(args) {
  if (!this.setDataSource) {
    return;
  }
  if (args.length < 2) {
    throw new Error('options must be passed');
  }
  if (args.length === 2) {
    this.setDataSource(args[0]);
  } else {
    this.setDataSource(args[1]);
  }
}
const _find = DataAccessObject.find;
DataAccessObject.find = function (query, options, cb) {
  callSetDataSource3.call(this, [].slice.call(arguments));
  return _find.apply(this, [].slice.call(arguments));
};

const _create = DataAccessObject.create;
DataAccessObject.create = function (data, options, cb) {
  callSetDataSource3.call(this, [].slice.call(arguments));
  return _create.apply(this, [].slice.call(arguments));
};

const _upsert = DataAccessObject.upsert;
DataAccessObject.updateOrCreate =
  DataAccessObject.patchOrCreate =
  DataAccessObject.upsert = function (data, options, cb) {
    callSetDataSource3.call(this, [].slice.call(arguments));
    return _upsert.apply(this, [].slice.call(arguments));
  };

const _replaceById = DataAccessObject.replaceById;
DataAccessObject.replaceById = function (id, data, options, cb) {
  callSetDataSource4.call(this, [].slice.call(arguments));
  return _replaceById.apply(this, [].slice.call(arguments));
};


const _destroyAll = DataAccessObject.destroyAll;
DataAccessObject.remove =
  DataAccessObject.deleteAll =
  DataAccessObject.destroyAll = function (where, options, cb) {
    callSetDataSource3.call(this, [].slice.call(arguments));
    return _destroyAll.apply(this, [].slice.call(arguments));
  };

const _updateAttributes = DataAccessObject.prototype.updateAttributes;
DataAccessObject.prototype.updateAttributes =
DataAccessObject.prototype.patchAttributes = function (data, options, cb) {
  callSetDataSource3.call(this.constructor, [].slice.call(arguments));
  return _updateAttributes.apply(this, [].slice.call(arguments));
};

const _upsertWithWhere = DataAccessObject.upsertWithWhere;
DataAccessObject.patchOrCreateWithWhere =
  DataAccessObject.upsertWithWhere = function (where, data, options, cb) {
    callSetDataSource4.call(this, [].slice.call(arguments));
    return _upsertWithWhere.apply(this, [].slice.call(arguments));
  };

const _findOrCreate = DataAccessObject.findOrCreate;
DataAccessObject.findOrCreate = function (query, data, options, cb) {
  callSetDataSource4.call(this, [].slice.call(arguments));
  return _findOrCreate.apply(this, [].slice.call(arguments));
};

const _exists = DataAccessObject.exists;
DataAccessObject.exists = function exists(id, options, cb) {
  callSetDataSource3.call(this, [].slice.call(arguments));
  return _exists.apply(this, [].slice.call(arguments));
};

const _deleteById = DataAccessObject.removeById;
DataAccessObject.removeById =
  DataAccessObject.destroyById =
  DataAccessObject.deleteById = function deleteById(id, options, cb) {
    callSetDataSource3.call(this, [].slice.call(arguments));
    return _deleteById.apply(this, [].slice.call(arguments));
  };

