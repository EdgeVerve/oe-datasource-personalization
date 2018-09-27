/**
 *
 * �2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */

// Author : Atul

// This file is mixin file and this mixin should be applied on all models which may require DataSource Personalization. You should not apply this mixin on Framework model
// This mixin should be applied only on Applicaton Data models.
// Entry Point : Mixin, when applied, creates additional method on Model - called setDataSource(). This metho sets the data source based on context.
// This way, in multi tenant environment, DataSource of is changed based on context (tenantId).

const util = require('../../lib/utils.js');
const log = require('oe-logger')('oe-datasource-personalization-mixin');
const _ = require('lodash');

function getDataSource(model, options) {
  var autoscopeFields = util.getAutoscopeOfDataSourceDefinition();
  var ds = util.getFromDataSourceCache(autoscopeFields, model.modelName, options);
  return ds;
}

module.exports = (Model) => {
  if (Model.definition.settings.mixins.DataSourcePersonalizationMixin) {
    Model.firstDataSource = Model.getDataSource();
    var autoscopeFields = util.getAutoscopeOfDataSourceDefinition();
    util.addToDataSourceModelMap(autoscopeFields, Model.modelName, null, Model.firstDataSource);
    log.debug(log.defaultContext(), 'DataSourcePersonalizatonMixin is being attached for ' + Model.modelName);
    Model.setDataSource = function (options) {
      var self = this;
      if (self.definition.settings.overridingMixins && !self.definition.settings.overridingMixins.DataSourcePersonalizationMixin) {
        return self.firstDataSource.attach(self);
      }
      var opts = {};
      opts.ctx = _.cloneDeep(options.ctx);
      if (!opts.ctx.modelName) {
        opts.ctx.modelName = '/default/' + self.modelName;
      }
      log.debug(log.defaultContext(), 'DataSource being fetched for model = %s with context %s', self.modelName, opts.ctx);
      var ds = getDataSource(self, opts);
      log.debug(log.defaultContext(), 'DataSource is being set for %s is %s', self.modelName, ds.name);
      return ds.attach(self);
    };
  }
};
