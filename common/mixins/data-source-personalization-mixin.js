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

function getDataSource(model, options) {
  var autoscopeFields = util.getAutoscopeOfDataSourceDefinition();
  var ds = util.getFromDataSourceCache(autoscopeFields, model.modelName, options);
  return ds;
}

module.exports = (Model) => {
  if (Model.definition.settings.mixins.DataSourcePersonalizationMixin) {
    Model.firstDataSource = Model.getDataSource();
    var autoscopeFields = util.getAutoscopeOfDataSourceDefinition();
    util.addDataSourceToCache(autoscopeFields, Model.modelName, null, Model.firstDataSource);

    Model.setDataSource = function (options) {
      var self = this;
      console.log(self.modelName);
      if (self.definition.settings.overridingMixins && !self.definition.settings.overridingMixins.DataSourcePersonalizationMixin) {
        return self.firstDataSource.attach(self);
      }
      var opts = {};
      opts.ctx = Object.assign({}, options.ctx);
      if (!opts.ctx.modelName) {
        opts.ctx.modelName = '/default/' + self.modelName;
      }
      var ds = getDataSource(self, opts);
      return ds.attach(self);
    };
  }
};
