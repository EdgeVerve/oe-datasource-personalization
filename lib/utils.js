/**
 *
 * �2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */

// Author : Atul

// This file contains utility functions - These functions can be used by this module as well as external module.
// 1. addDataSourceToCache() - This wil add created data source to Cache. It will maintain context information in memory
// 2. getFromDataSourceCache() - This function retrieve data source for the given context from memory
// 3. getAutoscopeOfDataSourceDefinition() - This function gives list of autosope fields configured for DataSourceDefinition Model

const utils = require('oe-multi-tenancy/lib/utils.js');
const loopback = require('loopback');

var dataSourceCache = {};
var dataSourceModelMap = {};

function findMatching(baseModel, autoscope, context) {
  var contextScope = context[autoscope];
  var currentModel = baseModel;
  if (!contextScope) {
    contextScope = '/default';
  }

  var temp = contextScope.split('/');
  var len = temp.length;

  for (var j = 0; j < len - 1; ++j) {
    var scope = temp.join('/');
    if (currentModel[autoscope + ':' + scope]) {
      return currentModel[autoscope + ':' + scope];
    }
    temp.pop();
  }
  return null;
}


function _getFromCache(autoscopeFields, key, options, cache) {
  var context;
  if (!options) {
    context = utils.getDefaultContext(autoscopeFields);
  } else {
    context = options.ctx || options;
  }
  if (!context.modelName) {
    context.modelName = '/default';
  }
  var currentModel = cache[key];
  if (!currentModel) {
    return null;
  }
  for (var i = autoscopeFields.length - 1; i >= 0; --i) {
    var currentScope = autoscopeFields[i];
    // var contextScope = context[currentScope];
    var matchedDataSource = findMatching(currentModel, currentScope, context);
    if (matchedDataSource) {
      currentModel = matchedDataSource;
    } else {
      return null;
    }
  }
  return currentModel.dataSource ? currentModel.dataSource : null;
}


function _getFromDataSourceCache(autoscopeFields, modelName, options) {
  var ds = _getFromCache(autoscopeFields, modelName, options, dataSourceModelMap);
  var ds2 = _getFromCache(autoscopeFields, ds.name, options, dataSourceCache);
  if (!ds2) {
    return ds;
  }
  return ds2;
}

function _addToCache(autoscopeFields, key, options, dataSource, cache) {
  var context;
  if (!options) {
    context = utils.getDefaultContext(autoscopeFields);
  } else {
    context = options.ctx || options;
  }
  var baseModel = cache[key];
  if (!baseModel) {
    cache[key] = { dataSource };
    baseModel = cache[key];
  }
  var currentModel = baseModel;
  if (!context) {
    context = utils.getDefaultContext(autoscopeFields);
  }
  if (!context.modelName) {
    context.modelName = '/default';
  }
  for (var i = autoscopeFields.length - 1; i >= 0; --i) {
    var currentScope = autoscopeFields[i];
    var contextScope = context[currentScope];
    if (!currentModel[currentScope + ':' + contextScope]) {
      currentModel[currentScope + ':' + contextScope] = {};
    }
    currentModel = currentModel[currentScope + ':' + contextScope];
  }
  currentModel.dataSource = dataSource;
  return currentModel;
}


function _addToDataSourceModelMap(autoscopeFields, key, options, dataSource) {
  return _addToCache(autoscopeFields, key, options, dataSource, dataSourceModelMap);
}

function _addDataSourceToCache(autoscopeFields, key, options, dataSource) {
  return _addToCache(autoscopeFields, key, options, dataSource, dataSourceCache);
}

function _getAutoscopeOfDataSourceDefinition() {
  var dataSourceDefinition;
  dataSourceDefinition = loopback.getModel('DataSourceDefinition');
  var autoscope = dataSourceDefinition.definition.settings.autoscope || dataSourceDefinition.definition.settings.autoScope;
  return ['modelName'].concat(autoscope);
}

module.exports.addDataSourceToCache = _addDataSourceToCache;
module.exports.addToDataSourceModelMap = _addToDataSourceModelMap;
module.exports.getFromDataSourceCache = _getFromDataSourceCache;
module.exports.getAutoscopeOfDataSourceDefinition = _getAutoscopeOfDataSourceDefinition;
