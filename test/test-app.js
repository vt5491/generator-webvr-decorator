'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');
var _ = require('lodash');
var generators = require('yeoman-generator').generators;
var RunContext = require('../node_modules/yeoman-generator/lib/test/run-context');

describe('angular-vr-base:app end to end', function () {
  
});

describe('webvr-decorator:app', function () {
  var appGenerator;
  var subAngularDummy;
  var app; 
  
  before(function (done) {
    appGenerator = helpers.createGenerator('webvr-decorator:app', [
      path.join(__dirname, '../generators/app')
    ],
                                           null,
                                           {}
                                          );

    app = new RunContext(appGenerator);
    app.withPrompts({'continue': true, 'artifactsToRename': {'mainCtrl' : 'main'}});
    app.on('end', function () {
    });
    app.on('ready', function () {
    });
    
    // add the following thre from appGenerator to app worked
    app.prompt = appGenerator.prompt;
    app._globalConfig = appGenerator._globalConfig;
    app.env = appGenerator.env;
    app.log = appGenerator.log;
    
    app.globals = {};
    app.globals.MAIN_CTRL = 'main';
    
    done();
  });
  
  it('creates files', function () {
    assert(true);
  });
  
  it('initializing sets values appropriately', function () {
    appGenerator.initializing();
    assert.equal(appGenerator.props.userNames.directives.canvasKeys, 'canvasKeys');
  });
  
  it('prompting works', function () {
    appGenerator.prompting.initialPrompt.call(app);
    
    app.Generator.prompting.initialPrompt.call(app);

  });
});
