/**
 *
 * �2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */

// Author : Atul
var oecloud = require('oe-cloud');
var loopback = require('loopback');


// This is test case for Data Source Personalization Module.
// 1. Test case first creates DataSource by creating record in Data Source
// 2. Create mapping between DataSource and Model for tenant ICICI
// 3. Demonstrate that when record of Model is being created using ICICI tenant, it uses different Data Source
// 4. While Model record being created using tenant other than ICICI, it uses regular 'db' data source.
oecloud.observe('loaded', function (ctx, next) {
  // oecloud.attachMixinsToBaseEntity("DataSourcePersonalizationMixin");
  oecloud.setDataSourceDefinitionAutoscope(['tenantId']);
  return next();
});
oecloud.addContextField('tenantId', {
  type: 'string'
});

var Customer;
var DataSourceDefinition;
oecloud.boot(__dirname, function (err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  var accessToken = loopback.findModel('AccessToken');
  accessToken.observe('before save', function (ctx, next) {
    var userModel = loopback.findModel('User');
    var instance = ctx.instance;
    userModel.find({ where: { id: instance.userId } }, {}, function (err, result) {
      var ctx = {};
      if (err) {
        return next(err);
      }
      if (result.length != 1) {
        return next(new Error('No User Found'));
      }
      var user = result[0];
      if (user.username === 'admin') {
        ctx.tenantId = '/default';
      } else if (user.username === 'iciciuser') {
        ctx.tenantId = '/default/icici';
      } else if (user.username === 'citiuser') {
        ctx.tenantId = '/default/citi';
      }
      instance.ctx = ctx;
      return next(err);
    });
  });
  oecloud.start();
  oecloud.emit('test-start');
});


var chalk = require('chalk');
var chai = require('chai');
var async = require('async');
chai.use(require('chai-things'));

var expect = chai.expect;

var app = oecloud;
var defaults = require('superagent-defaults');
var supertest = require('supertest');
var api = defaults(supertest(app));
var basePath = app.get('restApiRoot');

function deleteAllUsers(done) {
  var userModel = loopback.findModel('User');
  userModel.destroyAll({}, {}, function (err) {
    return done(err);
  });
}


var globalCtx = {
  ignoreAutoScope: true,
  ctx: { tenantId: '/default' }
};

var iciciCtx = {
  ctx: { tenantId: '/default/icici' }
};

var citiCtx = {
  ctx: { tenantId: '/default/citi' }
};

var defaultContext = {
  ctx: { tenantId: '/default' }
};


describe(chalk.blue('oe-datasource-personalization Started'), function (done) {
  this.timeout(10000);
  before('wait for boot scripts to complete', function (done) {
    app.on('test-start', function () {
      Customer = loopback.findModel('Customer');
      DataSourceDefinition = loopback.findModel('DataSourceDefinition');
      deleteAllUsers(function (err) {
        return done(err);
      });
    });
  });

  afterEach('destroy context', function (done) {
    done();
  });

  it('t1 create user admin/admin with /default tenant', function (done) {
    var url = basePath + '/users';
    api.set('Accept', 'application/json')
      .post(url)
      .send([{ username: 'admin', password: 'admin', email: 'admin@admin.com' },
        { username: 'iciciuser', password: 'iciciuser', email: 'iciciuser@iciciuser.com' },
        { username: 'citiuser', password: 'citiuser', email: 'citiuser@citiuser.com' }
      ])
      .end(function (err, response) {
        var result = response.body;
        expect(result[0].id).to.be.defined;
        expect(result[1].id).to.be.defined;
        expect(result[2].id).to.be.defined;
        done();
      });
  });

  var adminToken;
  it('t2 Login with admin credentials', function (done) {
    var url = basePath + '/users/login';
    api.set('Accept', 'application/json')
      .post(url)
      .send({ username: 'admin', password: 'admin' })
      .end(function (err, response) {
        var result = response.body;
        adminToken = result.id;
        expect(adminToken).to.be.defined;
        done();
      });
  });

  var icicitoken;
  it('t3 Login with bpo credentials', function (done) {
    var url = basePath + '/users/login';
    api.set('Accept', 'application/json')
      .post(url)
      .send({ username: 'iciciuser', password: 'iciciuser' })
      .end(function (err, response) {
        var result = response.body;
        icicitoken = result.id;
        expect(icicitoken).to.be.defined;
        done();
      });
  });


  var cititoken;
  it('t4 Login with bpo credentials', function (done) {
    var url = basePath + '/users/login';
    api.set('Accept', 'application/json')
      .post(url)
      .send({ username: 'citiuser', password: 'citiuser' })
      .end(function (err, response) {
        var result = response.body;
        cititoken = result.id;
        expect(cititoken).to.be.defined;
        done();
      });
  });


  it('t5 - creating default record in Customer model', function (done) {
    Customer.create({ name: 'A', age: 10 }, defaultContext, function (err, r) {
      return done(err);
    });
  });

  it('t6 - creating icici record in Customer model', function (done) {
    Customer.create({ name: 'Icici', age: 10 }, iciciCtx, function (err, r) {
      return done(err);
    });
  });

  it('t7 - creating citi record in Customer model', function (done) {
    Customer.create({ name: 'citi', age: 10 }, citiCtx, function (err, r) {
      return done(err);
    });
  });

  it('t8.1 - fetching records as default tenant', function (done) {
    api
      .set('Accept', 'application/json')
      .get(basePath + '/Customers?access_token=' + adminToken)
      .send()
      .expect(200).end(function (err, res) {
        // console.log('response body : ' + JSON.stringify(res.body, null, 4));
        if (err || res.body.error) {
          return done(err || (new Error(res.body.error)));
        }
        var results = res.body;
        expect(results.length).to.equal(1);
        expect(results[0].name).to.equal('A');
        done();
      });
  });
  it('t8.2 - fetching records as icici tenant', function (done) {
    api
      .set('Accept', 'application/json')
      .get(basePath + '/Customers?access_token=' + icicitoken)
      .send()
      .expect(200).end(function (err, res) {
        // console.log('response body : ' + JSON.stringify(res.body, null, 4));
        if (err || res.body.error) {
          return done(err || (new Error(res.body.error)));
        }
        var results = res.body;
        expect(results.length).to.equal(1);
        expect(results[0].name).to.equal('Icici');
        done();
      });
  });

  it('t8.3 - fetching records as citi tenant', function (done) {
    api
      .set('Accept', 'application/json')
      .get(basePath + '/Customers?access_token=' + cititoken)
      .send()
      .expect(200).end(function (err, res) {
        // console.log('response body : ' + JSON.stringify(res.body, null, 4));
        if (err || res.body.error) {
          return done(err || (new Error(res.body.error)));
        }
        var results = res.body;
        expect(results.length).to.equal(1);
        expect(results[0].name).to.equal('citi');
        done();
      });
  });

  function createNewDb(srcdb, newName, modelName) {
    var currentDB = process.env.NODE_ENV || '';
    var datasourceFile;

    if (!currentDB) {
      datasourceFile = './datasources.json';
    } else {
      datasourceFile = './datasources.' + currentDB + '.js';
    }
    var temp = require(datasourceFile);
    var icicidb = Object.assign({}, temp[srcdb]);

    icicidb.id = icicidb.name + '-' + newName;
    icicidb.name = icicidb.name + '-' + newName;

    if (modelName) {
      icicidb.modelName = modelName;
    }

    if (currentDB && (currentDB.toLowerCase().indexOf('mongo') >= 0 || currentDB.toLowerCase().indexOf('postgre') >= 0)) {
      var dbname = temp[srcdb].database;
      icicidb.database = dbname + '-' + newName;
      if (temp[srcdb].url) {
        var y = temp[srcdb].url.split('/');
        var len = y.length;
        var last = y[len - 1];
        // last = last + '-' + newName;
        y[len - 1] = icicidb.database;
        icicidb.url = y.join('/');
        // newds.url = db2.db.url.replace('oe-cloud-test', 'oe-cloud-test-newdb');
      }
    } else if (currentDB && currentDB.toLowerCase().indexOf('oracle') >= 0) {
      icicidb.user = icicidb.user + '-' + newName;
    } else {
      icicidb.url = temp[srcdb].url.replace(temp[srcdb].database, temp[srcdb].database + '-' + newName);
      icicidb.database = temp[srcdb].database + '-' + newName;
    }
    console.log(JSON.stringify(icicidb));
    return icicidb;
  }

  it('t9.1 - Create new DataSource for icici tenant', function (done) {
    var icicidb = createNewDb('db', 'icici', 'Customer');
    DataSourceDefinition.create(icicidb, iciciCtx, function (err, r) {
      return done(err);
    });
  });

  it('t9.2 Create record in Customer with icici tenant and it should go in new database for icici', function (done) {
    Customer.create({ name: 'IciciA', age: 10 }, iciciCtx, function (err, r) {
      return done(err);
    });
  });

  it('t9.3 Create record in Customer with citi tenant and it should go to default database', function (done) {
    Customer.create({ name: 'CitiA', age: 10 }, citiCtx, function (err, r) {
      return done(err);
    });
  });

  it('t9.4 Create new DataSource for citi tenant', function (done) {
    if (process.env.NODE_ENV !== 'oracle') {
      var citidb = createNewDb('db', 'citidb', 'Customer');
      DataSourceDefinition.create(citidb, citiCtx, function (err, r) {
        return done(err);
      });
    } else {
      return done();
    }
  });

  it('t9.5 Create record in Customer with citi tenant and it should go to citi specific database', function (done) {
    if (process.env.NODE_ENV !== 'oracle') {
      Customer.create({ name: 'CitiA', age: 10 }, citiCtx, function (err, r) {
        return done(err);
      });
    } else {
      return done();
    }
  });


  it('t9.6 fetching records as citi tenant (HTTP) - only record which went to personalized database should be retrieved', function (done) {
    if (process.env.NODE_ENV !== 'oracle') {
      api
        .set('Accept', 'application/json')
        .get(basePath + '/Customers?access_token=' + cititoken)
        .send()
        .expect(200).end(function (err, res) {
          // console.log('response body : ' + JSON.stringify(res.body, null, 4));
          if (err || res.body.error) {
            return done(err || (new Error(res.body.error)));
          }
          var results = res.body;
          expect(results.length).to.equal(1);
          expect(results[0].name).to.equal('CitiA');
          done();
        });
    } else {
      return done();
    }
  });


  it('t9.7 - fetching records as icici tenant(HTTP) - only record which went to personalized database should be retrieved', function (done) {
    if (process.env.NODE_ENV === 'oracle') {
      return done();
    }

    api
      .set('Accept', 'application/json')
      .get(basePath + '/Customers?access_token=' + icicitoken)
      .send()
      .expect(200).end(function (err, res) {
        // console.log('response body : ' + JSON.stringify(res.body, null, 4));
        if (err || res.body.error) {
          return done(err || (new Error(res.body.error)));
        }
        var results = res.body;
        expect(results.length).to.equal(1);
        expect(results[0].name).to.equal('IciciA');
        done();
      });
  });

  it("t10.1 - Create employee record 'appdb' datasource by posting into Employee model as icici user", function (done) {
    if (process.env.NODE_ENV === 'oracle') {
      return done();
    }

    var data = {
      name: 'IciciEmployee',
      age: 10
    };
    api
      .set('Accept', 'application/json')
      .post(basePath + '/Employees' + '?access_token=' + icicitoken)
      .send(data)
      .expect(200).end(function (err, res) {
        if (err || res.body.error) {
          return done(err || (new Error(res.body.error)));
        }
        done();
      });
  });

  it("t10.2 - Create employee record 'appdb' datasource by posting into Employee model as citi user", function (done) {
    if (process.env.NODE_ENV === 'oracle') {
      return done();
    }

    var data = {
      name: 'CitiEmployee',
      age: 10
    };
    api
      .set('Accept', 'application/json')
      .post(basePath + '/Employees' + '?access_token=' + cititoken)
      .send(data)
      .expect(200).end(function (err, res) {
        if (err || res.body.error) {
          return done(err || (new Error(res.body.error)));
        }
        done();
      });
  });

  it("t11.1 - Personalized 'appdb' for icici tenant", function (done) {
    if (process.env.NODE_ENV === 'oracle') {
      return done();
    }

    var icicidb = createNewDb('appdb', 'icicidb');
    icicidb.name = 'appdb';
    DataSourceDefinition.create(icicidb, iciciCtx, function (err, r) {
      return done(err);
    });
  });
  it("t11.2 - Create employee record 'appdb' datasource by posting into Employee model as icici user - should go into personalized appdb", function (done) {
    if (process.env.NODE_ENV === 'oracle') {
      return done();
    }


    var data = {
      name: 'IciciEmployee2',
      age: 10
    };
    api
      .set('Accept', 'application/json')
      .post(basePath + '/Employees' + '?access_token=' + icicitoken)
      .send(data)
      .expect(200).end(function (err, res) {
        if (err || res.body.error) {
          return done(err || (new Error(res.body.error)));
        }
        done();
      });
  });

  it('t11.2 - fetching Employee records as icici tenant - only record which went to personalized appdb database should be retrieved', function (done) {
    if (process.env.NODE_ENV === 'oracle') {
      return done();
    }

    var employeeModel = loopback.findModel('Employee');
    employeeModel.find({}, iciciCtx, function (err, results) {
      expect(results.length).to.equal(1);
      expect(results[0].name).to.equal('IciciEmployee2');
      done();
    });
  });


  it('t11.3 - fetching Employee records as icici tenant(HTTP) - only record which went to personalized appdb database should be retrieved', function (done) {
    if (process.env.NODE_ENV === 'oracle') {
      return done();
    }

    api
      .set('Accept', 'application/json')
      .get(basePath + '/Employees?access_token=' + icicitoken)
      .send()
      .expect(200).end(function (err, res) {
        // console.log('response body : ' + JSON.stringify(res.body, null, 4));
        if (err || res.body.error) {
          return done(err || (new Error(res.body.error)));
        }
        var results = res.body;
        console.log(results);
        expect(results.length).to.equal(1);
        expect(results[0].name).to.equal('IciciEmployee2');
        done();
      });
  });

  it('t12.1 - Test case to use all other methods', function (done) {
    if (process.env.NODE_ENV === 'oracle') {
      return done();
    }

    var employeeModel = loopback.findModel('Employee');
    employeeModel.find({}, iciciCtx, function (err, results) {
      expect(results.length).to.equal(1);
      expect(results[0].name).to.equal('IciciEmployee2');
      var inst = results[0];
      var data = { age: 103, id: inst.id};
      inst.updateAttributes(data, iciciCtx, function (err, r) {
        if (err) {
          return done(err);
        }
        employeeModel.upsert({ name: 'Chagnedname' + r.name, age: 555 }, iciciCtx, function (err2, r2) {
          return done(err2);
        });
      });
    });
  });

  it('t12.2 - Test case to use all other methods', function (done) {
    if (process.env.NODE_ENV === 'oracle') {
      return done();
    }

    var employeeModel = loopback.findModel('Employee');
    employeeModel.findOrCreate({
      where: { id: 'x' }
    }, { id: 'x', name: 'xname', age: 44 }, iciciCtx, function (err, results) {
      employeeModel.replaceById('x', { id: 'x', name: 'yname', age: 55 }, iciciCtx, function (e2, r2) {
        return done(e2);
      });
    });
  });
});


