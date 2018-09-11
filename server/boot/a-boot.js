/**
 *
 * �2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */


module.exports = function (app, cb) {
  console.log('Boot script called');
  process.nextTick(function () {
    return cb();
  });
};

