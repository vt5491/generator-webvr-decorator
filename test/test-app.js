'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');
//vt add
var _ = require('lodash');
//var vtApp = require('../generators/app/index.js');
var generators = require('yeoman-generator').generators;
//var RunContext = require('yeoman-generator').runContext;
var RunContext = require('../node_modules/yeoman-generator/lib/test/run-context');
//vt end

//console.log('vtApp=', vtApp);
console.log('RunContext=', RunContext);
describe('angular-vr-base:app end to end', function () {
  
});

describe('webvr-decorator:app', function () {
  // before(function (done) {
  //   helpers.run(path.join(__dirname, '../generators/app'))
  //     .withOptions({ skipInstall: true })
  //     .withPrompts({ someOption: true })
  //     .on('end', done);
  // });
  var appGenerator;
  var appGenerator2; 
  //beforeEach(function (done) {
  /*
  before(function (done) {
    //appGenerator = helpers.run(path.join( __dirname, '../generators/app'));
    //helpers.run(path.join( __dirname, '../generators/app')).;
  
    appGenerator = helpers.createGenerator('webvr-decorator:app', [
      path.join(__dirname, '../generators/app')
    ],
      null,
      // {'artifacts': artifacts, appName: APP_NAME, userNames: userNames,
      // }
      {}
    );

    console.log('appGenerator.prompting.initialPrompt.prompt=', appGenerator.prompting.initialPrompt.prompt);
    console.log('appGenerator.prompt=', appGenerator.prompt);
    //appGenerator2 = new vtApp();
    //console.log('*****>appGenerator2=',appGenerator2);
    //console.log('vtApp.initializing=', vtApp.initializing);
    // mixin common class
    //_.extend(appGenerator.prototype, require('../lib/common.js'));

    //appGenerator.
    // we need to do this to properly feed in options and args
    //appGenerator.initializing();
   
    done();
  });

  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .withOptions({babel: true})
      //.create('webvr-decorator:app')
      .on('ready', function (generator) {
        // generator.fs.write(
        //   generator.destinationPath('package.json'),
        //   '{"name": "my-lib"}'
        // );
        generator.initializing();
        generator.prompting.async = function() {
          return function() {};
        };
        generator.prompting.globals = {};
        generator.prompting.globals.MAIN_CTRL = 'main';
        generator.prompting.prompt = appGenerator.prompt;
        //generator.constructor();
        generator.prompting.initialPrompt();
      })
      .on('end', done);
  });
 */ 
  var subAngularDummy;

  /*
  var globalGenerator;
  before (function (done) {
    subAngularDummy = generators.Base.extend({
      initializing: function () {        
        // write a line to simulate ending of an angular service
        //var fn = 'app/scripts/services/' + this.args + '.js';        
        //this.fs.write(fn, '//dummy-line\n  });\n');
      },
    });

  helpers.run(path.join( __dirname, '../generators/app'))
    .inTmpDir(function (dir) {
      // `dir` is the path to the new temporary directory
      //fs.copySync(path.join(__dirname, '../templates/common'), dir)
    })
      .withOptions({skipInstall: true, unitTestRun: true})
      .withPrompts({ artifactsToRename: {'mainCtrl': 'main'},
                     mainCtrl: 'main',
                     m: 'abc',
                   })
      .withGenerators([
        [subAngularDummy, 'vr-base:sub-angular'],
      ])
      .on('ready', function (gen) { globalGenerator = gen})
      .on('end', function () {console.log('in end handler')});
    // .on('end', function (generator) {
    //   // assert something
    //   console.log('hi');
    //   console.log('generator.props=',generator.props);
    // });

    done();
  });
   */ 
  // it ('on ond', function () {
  //     console.log('hi2');
  //     console.log('2globalGenerator.props=',globalGenerator.props);
  //   globalGenerator.prompting.globals = {};
  //   globalGenerator.prompting.globals.MAIN_CTRL = 'main';
  //   console.log('globalGenerator.prompting=', globalGenerator.prompting.initialPrompt());
  // });
  var app; 
  before(function (done) {

    
    appGenerator = helpers.createGenerator('webvr-decorator:app', [
      path.join(__dirname, '../generators/app')
    ],
                                           null,
                                           // {'artifacts': artifacts, appName: APP_NAME, userNames: userNames,
                                           // }
                                           {}
                                          //).bind(app);
                                          );

    //console.log('typeof appGenerator=', typeof appGenerator);
    app = new RunContext(appGenerator);
    app.withPrompts({'continue': true, 'artifactsToRename': {'mainCtrl' : 'main'}});
    app.on('end', function () {
      // assert something
      console.log('in on end handler for app');
    });
    app.on('ready', function () {
      // assert something
      console.log('in on-ready handler for app');
    });
    
    // the following is not allowed
    //appGenerator.withPrompts({'continue': true, 'artifactsToRename': {'mainCtrl' : 'main'}});
    //appGenerator.bind(app);
//    console.log('===>appGenerator=', appGenerator);
//    console.log('===>appGenerator.prompting=', appGenerator.prompting);
    
    //var app = new RunContext('../generators/app');
    //var app = new RunContext(path.join(__dirname, '../generators/app'));

    // console.log('===>app=', app);
    // add the following thre from appGenerator to app worked
    app.prompt = appGenerator.prompt;
    app._globalConfig = appGenerator._globalConfig;
    app.env = appGenerator.env;
    // console.log('===>app.prompt=', app.prompt);
    // console.log('===>app._globalConfig=', app._globalConfig);
    // console.log('===>app.Generator.prompting=', app.Generator.prompting);
    // console.log('===>appGenerator.prompt=', appGenerator.prompt);
    // console.log('===>appGenerator._globalConfig=', appGenerator._globalConfig);
    
    app.globals = {};
    app.globals.MAIN_CTRL = 'main';
    // console.log('now calling initialPrompt1');
    // appGenerator.prompting.initiGalPrompt.call(app);

    //method 2..copy async from app to appGenerator
    // console.log('===>app.async=', app.async);
    // console.log('===>appGenerator.async=', appGenerator.async);
    // app.withGenerators([
    //   //'../generators/app',
    //   path.join(__dirname, '../generators/app')
    // ]);
    // app.on('end', function () {
    //   // assert something
    //   console.log('now in app end event handler');
    // });
    done();
  });
  
  it('creates files', function () {
    assert(true);
  });
  
  it('initializing sets values appropriately', function () {
    appGenerator.initializing();
    console.log('appGenerator.props=', appGenerator.props);
    assert.equal(appGenerator.props.userNames.directives.canvasKeys, 'canvasKeys');
  });
  
  it('prompting works', function () {
    //var result = appGenerator.prompting.initialPrompt();
    // var context = helpers.run(path.join( __dirname, '../generators/app'))
    //       .withGenerators([])
    // ;
    // //console.log('appGenerator.prompting=', appGenerator.prompting);
    // //console.log('result.prompting.initialPrompt=', result.prompting.initialPrompt);
    // console.log('result.async=', result.async);
    // console.log('result.generator=', result.generator);
    //helpers.run(path.join( __dirname, '../generators/app')).prompting.initialPrompt();
    /*
    var  g =helpers.run(path.join( __dirname, '../generators/app')).withGenerators([[appGenerator, 'webvr-decorator:app']]);
    console.log('g=',g);
    console.log('g.dependencies=', g.dependencies);
    var f = g.dependencies[0][0];
    _.extend(f.prototype, require('../lib/common.js'));
    // console.log('g.dependencies[0][0].prompting.initialPrompt()=', g.dependencies[0][0].prompting.initialPrompt());
    // console.log('g.Generator.prompting=', g.Generator.prompting);
    console.log('----->f=',f);
    f.prompting.globals = f.globals;
    console.log('f.prompting=', f.prompting);
    //f.prompting.prompt = appGenerator.prompt;
    f.prompting.prompt = function () {}; 
    f.prompting.store = f.options.env.store;
    //f.prompting.Base =
    f.prompting.initialPrompt();
     */
    console.log('now calling appGenerator.initialPrompt');
    //app.Generator.prompting.initialPrompt();
    appGenerator.prompting.initialPrompt.call(app);
    
    //console.log('====> app=', app);
    console.log('now calling app.initialPrompt');
    app.Generator.prompting.initialPrompt.call(app);

//    console.log('===>app=', app);
//    console.log('===>appGenerator=', appGenerator);
    console.log('===>app.vtAbc=', app.vtAbc);
    console.log('---->appGenerator.props2=', appGenerator.props);
  });
  });
