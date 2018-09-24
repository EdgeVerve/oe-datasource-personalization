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
  //oecloud.attachMixinsToBaseEntity("DataSourcePersonalizationMixin");
  oecloud.setDataSourceDefinitionAutoscope(["tenantId"]);
  return next();
})

var Customer;
var DataSourceDefinition;
oecloud.boot(__dirname, function (err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  var accessToken = loopback.findModel('AccessToken');
  accessToken.observe("before save", function (ctx, next) {
    var userModel = loopback.findModel("User");
    var instance = ctx.instance;
    userModel.find({ where: { id: instance.userId } }, {}, function (err, result) {
      if (err) {
        return next(err);
      }
      if (result.length != 1) {
        return next(new Error("No User Found"));
      }
      var user = result[0];
      if (user.username === "admin") {
        instance.tenantId = '/default';
      }
      else if (user.username === "evuser") {
        instance.tenantId = '/default/infosys/ev';
      }
      else if (user.username === "infyuser") {
        instance.tenantId = '/default/infosys';
      }
      else if (user.username === "bpouser") {
        instance.tenantId = '/default/infosys/bpo';
      }
      else if (user.username === "iciciuser") {
        instance.tenantId = '/default/icici';
      }
      else if (user.username === "citiuser") {
        instance.tenantId = '/default/citi';
      }
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
  var userModel = loopback.findModel("User");
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
      Customer = loopback.findModel("Customer");
      DataSourceDefinition = loopback.findModel("DataSourceDefinition");
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
      .send([{ username: "admin", password: "admin", email: "admin@admin.com" },
      { username: "evuser", password: "evuser", email: "evuser@evuser.com" },
      { username: "infyuser", password: "infyuser", email: "infyuser@infyuser.com" },
      { username: "bpouser", password: "bpouser", email: "bpouser@bpouser.com" },
      { username: "iciciuser", password: "iciciuser", email: "iciciuser@iciciuser.com" },
      { username: "citiuser", password: "citiuser", email: "citiuser@citiuser.com" }
      ])
      .end(function (err, response) {

        var result = response.body;
        expect(result[0].id).to.be.defined;
        expect(result[1].id).to.be.defined;
        expect(result[2].id).to.be.defined;
        expect(result[3].id).to.be.defined;
        expect(result[4].id).to.be.defined;
        expect(result[5].id).to.be.defined;
        done();
      });
  });

  var adminToken;
  it('t2 Login with admin credentials', function (done) {
    var url = basePath + '/users/login';
    api.set('Accept', 'application/json')
      .post(url)
      .send({ username: "admin", password: "admin" })
      .end(function (err, response) {
        var result = response.body;
        adminToken = result.id;
        expect(adminToken).to.be.defined;
        done();
      });
  });


  var infyToken;
  it('t3 Login with infy credentials', function (done) {
    var url = basePath + '/users/login';
    api.set('Accept', 'application/json')
      .post(url)
      .send({ username: "infyuser", password: "infyuser" })
      .end(function (err, response) {
        var result = response.body;
        infyToken = result.id;
        expect(infyToken).to.be.defined;
        done();
      });
  });

  var evToken;
  it('t4 Login with ev credentials', function (done) {
    var url = basePath + '/users/login';
    api.set('Accept', 'application/json')
      .post(url)
      .send({ username: "evuser", password: "evuser" })
      .end(function (err, response) {
        var result = response.body;
        evToken = result.id;
        expect(evToken).to.be.defined;
        done();
      });
  });


  var bpoToken;
  it('t5 Login with bpo credentials', function (done) {
    var url = basePath + '/users/login';
    api.set('Accept', 'application/json')
      .post(url)
      .send({ username: "bpouser", password: "bpouser" })
      .end(function (err, response) {
        var result = response.body;
        bpoToken = result.id;
        expect(bpoToken).to.be.defined;
        done();
      });
  });


  var icicitoken;
  it('t5 Login with bpo credentials', function (done) {
    var url = basePath + '/users/login';
    api.set('Accept', 'application/json')
      .post(url)
      .send({ username: "iciciuser", password: "iciciuser" })
      .end(function (err, response) {
        var result = response.body;
        icicitoken = result.id;
        expect(bpoToken).to.be.defined;
        done();
      });
  });


  var cititoken;
  it('t5 Login with bpo credentials', function (done) {
    var url = basePath + '/users/login';
    api.set('Accept', 'application/json')
      .post(url)
      .send({ username: "citiuser", password: "citiuser" })
      .end(function (err, response) {
        var result = response.body;
        cititoken = result.id;
        expect(bpoToken).to.be.defined;
        done();
      });
  });


  it("it - creating default record in Customer model", function (done) {
    Customer.create({ name: "A", age: 10 }, { ctx: {tenantId : '/default'}}, function (err, r) {
      return done(err);
    });
  });

  it("it - Create new DataSource for icici tenant", function (done) {
    var currentDB = process.env.NODE_ENV || '';
    var datasourceFile;

    if (!currentDB) {
      datasourceFile = './datasources.json';
    }
    else {
      datasourceFile = './datasources.' + currentDB + '.js';
    }
    var temp = require(datasourceFile);
    var icicidb= Object.assign({}, temp.db);

    icicidb.name = icicidb.name + '-icici';
    icicidb.id = icicidb.name + '-icici';
    icicidb.modelName = 'Customer';
    debugger;
    if (currentDB && (currentDB.toLowerCase().indexOf('mongo') >= 0 || currentDB.toLowerCase().indexOf('postgre') >= 0)) {
      var dbname = process.env.DB_NAME || temp.db.name;
      icicidb.database = dbname + '-icici';
      if (temp.db.url) {
        var y = temp.db.url.split('/');
        var len = y.length;
        var last = y[len - 1];
        last = last + '-icici';
        y[len - 1] = last;
        icicidb.url = y.join('/');
        //newds.url = db2.db.url.replace('oe-cloud-test', 'oe-cloud-test-newdb');
      }
    }
    else if (currentDB && currentDB.toLowerCase().indexOf('oracle') >= 0) {
      icicidb.user = icicidb.user + '-icici';
    }
    else {
      icicidb.url = temp.db.url.replace("oe-datasource-personalization-test", "oe-datasource-personalization-test" + '-icici');
      icicidb.database = "oe-datasource-personalization-test-icici";
    }
    console.log(JSON.stringify(icicidb));
    DataSourceDefinition.create(icicidb, { ctx: { tenantId: "/default/icici" } }, function (err, r) {
      return done(err);
    });
  });

    it("it - Create record in Customer with icici tenant and it should go in new database for icici", function (done) {
      Customer.create({ name: "A", age: 10 }, { ctx: { tenantId: '/default/icici' } }, function (err, r) {
        return done(err);
      });

  });



});

