/**
 *
 * �2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */

// Author : Atul
const utils = require('oe-multi-tenancy/lib/utils.js');
const loopback = require('loopback');

var dataSourceCache = {};

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


function _getFromDataSourceCache(autoscopeFields, modelName, options) {
  var context;
  if (!options) {
    context = utils.getDefaultContext(autoscopeFields);
  } else {
    context = options.ctx || options;
  }
  if (!context.modelName) {
    context.modelName = '/default';
  }
  var currentModel = dataSourceCache[modelName];
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
      return dataSourceCache[modelName];
    }
  }
  return currentModel.dataSource ? currentModel.dataSource : null;
}


function _addDataSourceToCache(autoscopeFields, modelName, options, dataSource) {
  var context;
  if (!options) {
    context = utils.getDefaultContext(autoscopeFields);
  } else {
    context = options.ctx || options;
  }
  var baseModel = dataSourceCache[modelName];
  if (!baseModel) {
    dataSourceCache[modelName] = { dataSource };
    baseModel = dataSourceCache[modelName];
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

function _getAutoscopeOfDataSourceDefinition() {
  var dataSourceDefinition;
  dataSourceDefinition = loopback.getModel('DataSourceDefinition');
  var autoscope = dataSourceDefinition.definition.settings.autoscope || dataSourceDefinition.definition.settings.autoScope;
  return autoscope.concat(['modelName']);
}

module.exports.addDataSourceToCache = _addDataSourceToCache;
module.exports.getFromDataSourceCache = _getFromDataSourceCache;
module.exports.getAutoscopeOfDataSourceDefinition = _getAutoscopeOfDataSourceDefinition;
