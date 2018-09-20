/**
 *
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */

// Author : Atul
const utils = require('../../lib/utils');
const loopback = require('loopback');
module.exports = function (app) {
  var Model = loopback.findModel('DataSourceDefinition');
  Model.observe('after save', (ctx, next) => {
    if (ctx.instance && ctx.instance.modelName) {
      var autoScopeFields = utils.getAutoscopeOfDataSourceDefinition();
      var ds = app.dataSources[ctx.instance.name];
      var temp = Object.assign({}, ctx.options);
      temp.ctx = temp.ctx || {};
      temp.ctx.modelName = ctx.instance.modelName;
      utils.addDataSourceToCache(autoScopeFields, ctx.instance.modelName, temp, ds);
    }
    return next();
  });
};

