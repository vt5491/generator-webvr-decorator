//
// test-sub-angular
//
// unit test for the sub-generator 'sub-angular'
//
// created 2015-10-30
//

'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var generators = require('yeoman-generator').generators;
var os = require('os');
var common = require('../lib/common.js');

var common_ut = require('./test-lib-common.js');


// this will be the end to end test
describe('angular-vr-base:app end to end', function () {

   beforeEach(function (done) {
    
    // create a mock angular generator
    var angularServiceDummy = generators.Base.extend({
      
      initializing: function () {        
        // write a line to simulate ending of an angular service
        var fn = 'app/scripts/services/' + this.args + '.js';        
        this.fs.write(fn, '//dummy-line\n  });\n');
      },
    });

    var angularControllerDummy = generators.Base.extend({
      
      initializing: function () {        
        // write a line to simulate ending of an angular controller
        var fn = 'app/scripts/controllers/' + this.args + '.js';
        
        this.fs.write(fn, '//dummy-line\n  });\n');
      }
    });

    var angularDirectiveDummy = generators.Base.extend({
      
      initializing: function () {        
        // write a line to simulate ending of an angular directive
        var fn = 'app/scripts/directives/' + this.args + '.js';        
        this.fs.write(fn, '//dummy-line\n  });\n');
      }
    });
     
     
    var artifacts = {};
    artifacts.services = {};

    this.angVrBaseAppRunContext = helpers.run(path.join(__dirname, '../generators/app'))
      .withOptions({ skipInstall: true,
                     name: 'def',
                   })
      .withArguments(['defg' ])
      .withGenerators([
        [angularServiceDummy, 'angular:service'],
        [angularControllerDummy, 'angular:controller'],
        [angularDirectiveDummy, 'angular:directive']
      ])
      .on('ready', function (gen) {        
        gen.fs.write('app/scripts/controllers/main.js', '//dummy-line\n  });\n');
        // we need to mock a dummy bower.json
        gen.fs.write('bower.json', '{"dependencies": {}}');
        common_ut.writeDummyIndexHtml('', gen);
        gen.fs.write('app/views/main.html', '//dummy-line\n  });\n');
        gen.fs.write('app/scripts/directives/canvaskeys.js', '//dummy-line\n  });\n');
      }.bind(this))     
      .on('end', done);
  });

  it('creates service files', function () {
    assert.file([
      'app/scripts/services/main.js',
      'app/scripts/services/base.js',
    ]);

  });

  it('creates controller files', function () {
    assert.file([
      'app/scripts/controllers/cust.js',
    ]);

  });

  it('updates main.html in views', function () {    
    assert.file([
      'app/views/main.html',
    ]);
    
    var gen = this.angVrBaseAppRunContext.generator;
    
    var filePath = gen.destinationPath('app/views/main.html');
    
    var fileContents = gen.fs.read(filePath);
    
    var regex = /<canvas id=\"viewer\"/m;

    assert(regex.test(fileContents));    
  });
});

// this will test individual methods, or sub-workflows.
describe('angular-vr-base:individual methods', function () {
  var subAngularGenerator;
  var APP_NAME = 'testapp';
  
  beforeEach(function (done) {

    var artifacts = {};
      
    artifacts.services = {};
    artifacts.controllers = {};
    artifacts.directives = {};
    
    artifacts.services.main = 'main';
    artifacts.services.base = 'base';

    artifacts.controllers.main = 'main';
      
    subAngularGenerator = helpers.createGenerator('webvr-decorator:sub-angular', [
      path.join(__dirname, '../generators/sub-angular')
      ],
      null,
     {'artifacts': artifacts, appName: APP_NAME
     }
    );

    artifacts.directives.canvasKeys = 'canvasKeys';
    
    // we need to do this to properly feed in options and args
    subAngularGenerator.initializing();

    // override the artifacts hash
    subAngularGenerator.artifacts = artifacts;

    subAngularGenerator.fs.write('file.txt', '//dummy-line\n  });\n');

    subAngularGenerator.fs.write('app/scripts/services/main.js', '//dummy-line\n  });\n');
    subAngularGenerator.fs.write('app/scripts/services/base.js', '//dummy-line\n  });\n');
    // we use dummy controller to test parsing
    subAngularGenerator.fs.write('app/scripts/controllers/dummy.js',
        "angular.module('vrsketchApp')\n.controller('MainCtrl', function ($scope) {\n");
    subAngularGenerator.fs.write('app/scripts/controllers/main.js', '//dummy-line\n  });\n')
;
    subAngularGenerator.fs.write('app/scripts/directives/canvaskeys.js', '//dummy-line\n  });\n');

    // mock up partials    
    subAngularGenerator.fs.write(subAngularGenerator.templatePath('../partials/services/main.js'), '<%= name %>\n');    
    subAngularGenerator.fs.write(subAngularGenerator.templatePath('../partials/services/base.js'), '<%= name %>\n');
    subAngularGenerator.fs.write(subAngularGenerator.templatePath('../partials/directives/canvaskeys.js'), '<%= name %>\n');
          
    done();
  }
  );

  it('_initGlobals works', function(){    
    var result = subAngularGenerator._initGlobals();

    assert.equal(subAngularGenerator.artifacts.services.main, subAngularGenerator.defaultArtifactNames.mainService);
  });
  
  it('vr-base generator is an instance variable', function () {
  });

  it('initliazing creates an <appName> partial', function () {
   
    var mainFilePath = path.join(__dirname, '../generators/sub-angular/partials/controllers/main.js');
    var vrAppFilePath = path.join(__dirname, '../generators/sub-angular/partials/controllers/' + APP_NAME + '.js');
    // next: verify the contents
    var mainFileContents = subAngularGenerator.fs.read(mainFilePath);
    var vrAppFileContents = subAngularGenerator.fs.read(vrAppFilePath);
    
    assert.equal(mainFileContents, vrAppFileContents );
  });

  it('_injectDependencies properly works', function () {
    var fp = 'app/scripts/controllers/dummy.js';
    subAngularGenerator._injectDependencies(fp, 'controller', ['service1', 'service2']);

    var fileContents = subAngularGenerator.fs.read(fp);

    var regex = /\('MainCtrl', function \(\$scope, service1, service2\)/m;
        
    assert(regex.test(fileContents));
  });

  it('_injectDependencies is idempotent', function () {
    var fp = 'app/scripts/controllers/dummy.js';
    
    // create a new dummy file that already has the 'main' service installed
    subAngularGenerator.fs.write(fp,
        "angular.module('vrsketchApp')\n.controller('MainCtrl', function ($scope, main) {\n"    );
    
    subAngularGenerator._injectDependencies(fp, 'controller', ['service1', 'main']);

    var fileContents = subAngularGenerator.fs.read(fp);    
    var regex = /\('MainCtrl', function \(\$scope, main, service1\)/m;    
    
    assert(regex.test(fileContents));
  });
  
  it('artifacts transformation pipeline', function () {
    var result;
    
    // markup artifacts
    subAngularGenerator.markupArtifacts();

    result = subAngularGenerator.fs.read('app/scripts/services/base.js');

    var regex = /\<\%\= partial \%\>/;
    
    assert(regex.test(result));

    // partials injection
    subAngularGenerator.partialsInjection();

    result = subAngularGenerator.fs.read('app/scripts/services/base.js');
    
    var regex = /\<\%\= name \%\>/;
    
    assert(regex.test(result));

    // template Interpolation
    subAngularGenerator.writing();

    result = subAngularGenerator.fs.read('app/scripts/services/base.js');
    var regex = /base/m;
    
    assert(regex.test(result));

    result = subAngularGenerator.fs.read('app/scripts/controllers/main.js');

    // is the call to the main service now in the controller file?
    regex = new RegExp(subAngularGenerator.defaultArtifactNames.mainService + '.init');    

    assert(regex.test(result));

    // verify the updated tag is there    
    var tagRegex = new RegExp('^\/\/' + '\\s*' + common.globals.fileUpdatedTag, 'm');    

    assert(tagRegex.test(result));
  });

  // Test the situation where the main.controller has been previously updated by us
  it('main controller previously touched',function () {
    // write an updated tag
    var fp = 'app/scripts/controllers/main.js';
    subAngularGenerator.fs.write(fp,
                                   '//dummy-line\n  });\n' +
                                   '//' + common.globals.fileUpdatedTag + 'been here already' );
    subAngularGenerator._markupFile(fp);

    // the file should note have a '<%= partial %'> tag
    // been updated.
    var fileContents = subAngularGenerator.fs.read(fp);
    
    assert(!/\<\%\= partial \%\>/m.test(fileContents));    
  });

});




