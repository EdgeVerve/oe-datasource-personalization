/**
 *
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */

// Author : Atul
const utils = require('../../lib/utils');
const loopback = require('loopback');
const log = require('oe-logger')('oe-datasource-personalization-boot');
const _ = require('lodash');

module.exports = function (app) {
  var Model = loopback.findModel('DataSourceDefinition');
  Model.observe('after save', (ctx, next) => {
    if (ctx.instance) {
      var autoScopeFields = utils.getAutoscopeOfDataSourceDefinition();
      var ds = app.dataSources[ctx.instance.id];
      var temp = _.cloneDeep(ctx.options.ctx);
      if (ctx.instance.modelName) {
        temp.modelName = '/default/' + ctx.instance.modelName;
        utils.addToDataSourceModelMap(autoScopeFields, ctx.instance.modelName, { ctx: temp }, ds);
      } else {
        temp.modelName = '/default';
        utils.addDataSourceToCache(autoScopeFields, ds.name, { ctx: temp }, ds);
      }

      log.debug(log.defaultContext(), 'DataSource record being added for %s model with DataSourceName = %s', temp.modelName, ds.name);
    }
    return next();
  });
};

