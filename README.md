# oe-datasource-personalization

- [Introduction](#introduction)
- [Getting Started](#getting-started)
  * [Testing and Code coverage](#testing-and-code-coverage)
  * [Installation](#installation)
  * [Dependency](#dependency)
- [Using Data Source Personalization](#using-data-source-personalization)
  * [How to Load module](#how-to-load-module)
  * [Enabling Data Source Personalization](#enabling-data-source-personalization)
- [Design](#design)
  * [DataSourceDefinition Model](#datasourcedefinition-model)
  * [Changes done in DataSourceDefinition](#changes-done-in-datasourcedefinition)
  * [DataSourcePersonalizationMixin](#datasourcepersonalizationmixin)
  * [setDataSource(options)](#setdatasource-options-)
  * [wrapper.js](#wrapperjs)
- [API Documentation](#api-documentation)
  * [addSettingsToDataSourceDefinition(s)](#addsettingstodatasourcedefinition-s-)
  * [setDataSourceDefinitionAutoscope(autoscopeFields)](#setdatasourcedefinitionautoscope-autoscopefields-)


# Introduction

oeCloud extends personalization framework where user / developer can personalize the database. In some business scenarios, you want to store some models in different database(or data source). Also, it might be requirement where one tenant wants to store tenant's data in separate database. These requirements can be achieved using oe datasource personalization module.

In short, this module should achieve following possible requirements
* Seperate database (aka datasource) for specific model or models
* Seperate database for tenant - if tenant wants to store information in different database


# Getting Started

In this section, we will see how we can use install this module in our project. To use features of datasource personalization module in your project, you must install this module.

## Testing and Code coverage

```sh
$ git clone http://evgit/oec-next/oe-datasource-personalization.git
$ cd oe-datasource-personalization
$ npm install --no-optional
$ npm run grunt-cover
```

you should see coverage report in coverage folder.

## Installation

To use oe-datasource-personalization in your project, you must include this package into your package.json as shown below. So when you do **npm install** this package will be made available. Please ensure the source of this package is right and updated. For now we will be using **evgit** as source. Also, please note that, to use this module, you project must be **oeCloud** based project.


```javascript
"oe-datasource-personalization": "git+http://evgit/oec-next/oe-datasource-personalization.git#master"
```

You can also install this mixin on command line using npm install. 


```sh
$ npm install <git path oe-datasource-personalization> --no-optional
```


## Dependency

* oe-cloud
* oe-multi-tenancy
* oe-logger

# Using Data Source Personalization

## How to Load module

When you include oe-datasource-personalization module in your project, you will have to add it into app-list.json. This way it will load the module in application.

```javascript
[
...
  {
	"path" : "oe-datasource-personalization",
	"DataSourcePersonalizationMixin" : false,
	"enable" :true
  }
...
]
```

By putting entry as shown above, this module is loaded into application. 

## Enabling Data Source Personalization

When you load mixin as shown above, **DataSourcePersonalizationMixin** is made disabled by default in BaseEntity. This is important as you don't want this functionality enabled for all the models. You as a developer should enable this functionality only for those models for which you want to allow to store data based on context(eg tenant).

If you want to enable this functionality on model, you need to specify and enable the mixin in Model's JSON file as shown below

```javascript
{
...
"mixins" : {
  "DataSourcePersonalizationMixin" : true
}
...
}
```

You also need to ensure that DataSourceDefinition model is has got multi-tenancy enabled. If you just put **oe-multi-tenancy** as part of **appl-list.json**, you are done. However, you also need to add your **autoscope** fields. You can selectively add autoscope fields for **only DataSourceDefinition model** and that way multi-tenancy will work only on **DataSourceDefinition** model. This is what exactly done in test cases of this module.

You need to call following function to set autoscope.

```javascript
const oecloud = require('oe-cloud');
oecloud.observe('loaded', function (ctx, next) {
  oecloud.setDataSourceDefinitionAutoscope(["tenantId"]);
  return next();
})
```

Above code will enable Data Source personalization enabled for all those models for which this Mixin is enabled. 

**Note** - DataSource Personalization uses MultiTenancyMixin only for DataSourceDefinition model. Therefore, you don't have to enable Multi tenancy for the Model. If you look at test case, you will see that Customer Model doesn't have multi tenancy enabled. Only DataSourceDefinition model has multi-tenancy mixin enabled.


# Design

Following are areas in oeCloud which are changed/added in this module.

## DataSourceDefinition Model

This is framework model - this model is defined in oe-cloud project. This model, as name suggests, stores all the data source definitions/settings as metadata. This gives programmer ability to create Data Source run time by POSTing into this Model.

## Changes done in DataSourceDefinition

* This module adds **ModelName** property to this Model. Therefore, user can configure to store that model's data to specific Data Source
* This module ensures that **MultiTenancyMixin** is applied to this model.
* This module gives API to set autoscope fields

## DataSourcePersonalizationMixin

This mixin should be applied for the model for which you want to enable Data Source personalization. This also sometime called DataSourceSwitching. This mixin adds a new method to Model called **setDataSource()**.

## setDataSource(options)

This new method gets added to all models for which **DataSourcePersonalizationMixin** is enabled. This function is called just before DAO's (DataAccessObject) model methods are called. For example, before model.find() is called, this module calls model.setDataSource() function allowing to change the data source of model.

## wrapper.js

This file override all DAO methods and call setDataSource() before control is passed to actual method.


# API Documentation

## addSettingsToDataSourceDefinition(s)

This function is created on oecloud application object and can be used to change the settings of DataSourceDefinition model. This is typically used to set options or some other parameters like properties. 

Below example will show how to add new column to this model

const oecloud = require("oe-cloud")
```javascript
var newProperties = {
  properties: {
   myNewProperty : {
     type : "string"
   }
  }
};
oecloud.addSettingsToDataSourceDefinition(newProperties);

```


## setDataSourceDefinitionAutoscope(autoscopeFields)

This function is also created on oecloud object. This function can be used to set autoscope property of the Model. If autoscope property is set at BaseEntity level, then it can be used. Or else, programmer has choice to set autoscope property separately. 

```javaScript
const oecloud = require('oe-cloud');
oecloud.setDataSourceDefinitionAutoscope(["tenantId"]);
```


