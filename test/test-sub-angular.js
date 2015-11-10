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

// describe('angular-vr-base:app', function () {
//   before(function (done) {
//     helpers.run(path.join(__dirname, '../generators/app'))
//       .withOptions({ skipInstall: true })
//       .withPrompts({ someOption: true })
//       .on('end', done);
//   });

//   it('creates files', function () {
//     assert.file([
//       // 'bower.json',
//       // 'package.json',
//       // '.editorconfig',
//       // '.jshintrc'
//       'app/scripts/services/main.js'
//     ]);
//   });
// });



// this will be the end to end test
describe('angular-vr-base:app end to end', function () {

//   var vrBaseSubAngularGenerator;
//   // we want to create a real 'vr-base:sub-angular' so we can
//   // unit test methods in there.
//   // We also need to create a 
//   // mock 'angular-service' since 'vr-base:sub-angular' calls
//   // on it to create services and such.
   beforeEach(function (done) {
    
//     // create a mock angular generator
    var angularServiceDummy = generators.Base.extend({
      
      initializing: function () {
        //console.log('now in initializing');
        // write a line to simulate ending of an angular service
        var fn = 'app/scripts/services/' + this.args + '.js';
        //console.log('dummy: fn=' + fn);
        this.fs.write(fn, '//dummy-line\n  });\n');
      },
    });

    var angularControllerDummy = generators.Base.extend({
      
      initializing: function () {
        //console.log('now in initializing');
        // write a line to simulate ending of an angular controller
        var fn = 'app/scripts/controllers/' + this.args + '.js';
        console.log('dummy: fn=' + fn);
        this.fs.write(fn, '//dummy-line\n  });\n');
      },
    });
     
//     // create a real 'angular-vr-base:app' generator, so we can test individual
       // methods (hooked off the run context) in our 'it' tests
    var artifacts = {};
    artifacts.services = {};

    // currently we are unable to override the default names
    // artifacts.services.main = 'main';
    // artifacts.services.base = 'base';
    //this.subAngularGenerator.fs.write('app/scripts/controllers/main.js', '//dummy-line\n  });\n');
    this.angVrBaseAppRunContext = helpers.run(path.join(__dirname, '../generators/app'))
      .withOptions({ skipInstall: true,
                     name: 'def',
//                     artifacts: artifacts,
                   })
      .withArguments(['defg' ])
      .withGenerators([
        [angularServiceDummy, 'angular:service'],
        [angularControllerDummy, 'angular:controller']
      ])
      .on('ready', function (gen) {
        //gen.fs.writeJSON(gen.destinationPath('package.json'), this.pkg);
        gen.fs.write('app/scripts/controllers/main.js', '//dummy-line\n  });\n');
        common_ut.writeDummyIndexHtml(gen);
        gen.fs.write('app/views/main.html', '//dummy-line\n  });\n');
      }.bind(this))     
      .on('end', done);

     

  });

  it('creates service files', function () {
    //console.log('do_something= ' + this.vrBaseDependentSubAngularRunContext.do_something());
    //console.log('this.vrBaseSubAngularRunContext.cwd=', this.vrBaseSubAngularRunContext.options.env.cwd);
    //console.log('do_something= ' + this.vrBaseDependentSubAngularGenerator.do_something());
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
    console.log('ut: now in updates main.html');
    assert.file([
      'app/views/main.html',
    ]);

    //console.log('ut: this.angVrBaseAppRunContext=', this.angVrBaseAppRunContext);

    var gen = this.angVrBaseAppRunContext.generator;
    
    var filePath = gen.destinationPath('app/views/main.html');
    
    var fileContents = gen.fs.read(filePath);

    console.log('view/main.html: fileContents=' + fileContents);
    var regex = /<canvas id=\"viewer\"/m;

    assert(regex.test(fileContents));
    
  });
});

// this will test individual methods, or sub-workflows.
describe('angular-vr-base:individual methods', function () {
  var subAngularGenerator;
  var APP_NAME = 'testapp';
  
  beforeEach(function (done) {
    // helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
    //   if (err) {
    //     return done(err);
    //   };

    var artifacts = {};
      
    artifacts.services = {};
    artifacts.controllers = {};
    
    artifacts.services.main = 'main';
    artifacts.services.base = 'base';

    artifacts.controllers.main = 'main';
      
    // subAngularGenerator = helpers.createGenerator('angular-vr-base:app', [
    //  // '../../generators/app',
    //   path.join(__dirname, '../generators/app')
    //   ],
    //   null,
    //  {'artifacts': artifacts}
    // );
    subAngularGenerator = helpers.createGenerator('vr-decorator:sub-angular', [
     // '../../generators/app',
      path.join(__dirname, '../generators/sub-angular')
      ],
      null,
     {'artifacts': artifacts, appName: APP_NAME
     }
//     { appName: APP_NAME}
    );

    
    // we need to do this to properly feed in options and args
    subAngularGenerator.initializing();

    // override the artifacts hash
    subAngularGenerator.artifacts = artifacts;

    // subAngularGenerator.sourceRoot(path.join(process.cwd(), 'test/temp') );
    // subAngularGenerator.options.env.cwd = path.join(process.cwd(), 'test/temp');

    //TODO: generalize the file names here.  The user may use something other than the defaults
    //actually ok, since this is a test and we are controlling this
    subAngularGenerator.fs.write('file.txt', '//dummy-line\n  });\n');

    subAngularGenerator.fs.write('app/scripts/services/main.js', '//dummy-line\n  });\n');
    subAngularGenerator.fs.write('app/scripts/services/base.js', '//dummy-line\n  });\n');
    // we use dummy controller to test parsing
    subAngularGenerator.fs.write('app/scripts/controllers/dummy.js',
        "angular.module('vrsketchApp')\n.controller('MainCtrl', function ($scope) {\n");
    subAngularGenerator.fs.write('app/scripts/controllers/main.js', '//dummy-line\n  });\n')
;

    // mock up partials
    //subAngularGenerator.fs.write('generators/sub-angular/partials/services/main.js', '<%= name %>\n');
    subAngularGenerator.fs.write(subAngularGenerator.templatePath('../partials/services/main.js'), '<%= name %>\n');
    //subAngularGenerator.fs.write('generators/sub-angular/partials/services/base.js', '<%= name %>\n');
    subAngularGenerator.fs.write(subAngularGenerator.templatePath('../partials/services/base.js'), '<%= name %>\n');
    
      
    //console.log('describe:before: subAngularGenerator=', subAngularGenerator);
//     subAngularGenerator = helpers.createGenerator(
//       '../../generators/app',
// //      'vr-base:sub-angular',
//       [
//         path.join(__dirname, '../generators/sub-angular')
//         //'../generators/sub-angular'
//       ],null, {abc: 7, def: 8, artifacts: artifacts})
//       //.inTmpDir()
//       ;

    done();
//   }.bind(this));
  }//.on('end', done)
  );

  it('_initGlobals works', function(){
    //console.log('subAngularGenerator=', subAngularGenerator);
    var result = subAngularGenerator._initGlobals();

    //console.log('result =' + result);
    //console.log('this.angularVrBase.artifacts.services.mainService' + this.angularVrBase.artifacts.services.mainService);
    //assert.equal(this.angularVrBase.artifacts.services.mainService, this.angularVrBase.defaultArtifactNames.mainService + '.js');
    //assert.equal(subAngularGenerator.artifacts.services.mainService, subAngularGenerator.defaultArtifactNames.mainService);
    assert.equal(subAngularGenerator.artifacts.services.main, subAngularGenerator.defaultArtifactNames.mainService);
  });

  //TODO rename subAngularGenerator
  it('vr-base generator is an instance variable', function () {
    // console.log('unit-test: vr-base generator');
    // var result = subAngularGenerator.initializing();

    // console.log('subAngularGenerator.vtTest=', subAngularGenerator.vtTest);
  });

  it('initliazing creates an <appName> partial', function () {
   // var fp = path.join(__dirname, '../generators/sub-angular/partials/controllers/testapp.js');
    var mainFilePath = path.join(__dirname, '../generators/sub-angular/partials/controllers/main.js');
    var vrAppFilePath = path.join(__dirname, '../generators/sub-angular/partials/controllers/' + APP_NAME + '.js');
    //console.log('fp=' + fp);

    // verify it doesn't exist before
    //assert(!subAngularGenerator.fs.exists(fp));
    // var fileContents =
    // subAngularGenerator.initializing();

    // verify it now exists
    //assert(subAngularGenerator.fs.exists(fp));

    // next: verify the contents

    var mainFileContents = subAngularGenerator.fs.read(mainFilePath);
    var vrAppFileContents = subAngularGenerator.fs.read(vrAppFilePath);

    //console.log('fileContents=' + fileContents);
    assert.equal(mainFileContents, vrAppFileContents );
  });

  it('_injectDependencies properly works', function () {
    var fp = 'app/scripts/controllers/dummy.js';
    subAngularGenerator._injectDependencies(fp, 'controller', ['service1', 'service2']);

    var fileContents = subAngularGenerator.fs.read(fp);

    console.log('ut._injectDependencies: new file contents=' + fileContents);

    //('MainCtrl', function ($scope, service1, service2)
    //var regex = /\('MainCtrl', function \($scope, service1, service2\)/m;
    var regex = /\('MainCtrl', function \(\$scope, service1, service2\)/m;

    console.log('regex.test=' + regex.test(fileContents));
    
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
    //console.log('result after partialsInjection=' + result);
    var regex = /\<\%\= name \%\>/;
    
    assert(regex.test(result));

    // template Interpolation
    subAngularGenerator.writing();

    result = subAngularGenerator.fs.read('app/scripts/services/base.js');
    console.log('result after writing=' + result);
    //var regex = /base\.js base/m;
    var regex = /base/m;
    
    assert(regex.test(result));

    result = subAngularGenerator.fs.read('app/scripts/controllers/main.js');
    console.log('main controller result after writing=' + result);
    console.log('subAngularGenerator.defaultArtifactNames.mainService=' + subAngularGenerator.defaultArtifactNames.mainService);

    // is the call to the main service now in the controller file?
    regex = new RegExp(subAngularGenerator.defaultArtifactNames.mainService + '.init');
    console.log('regex=', regex);

    assert(regex.test(result));

    // verify the updated tag is there
    console.log('fileUpdatedTag=' + common.globals.fileUpdatedTag);
    var tagRegex = new RegExp('^\/\/' + '\\s*' + common.globals.fileUpdatedTag, 'm');
    console.log('tagRegex=' + tagRegex);

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
    console.log('ut: previously touched: fileContents=' + fileContents);
    //assert(/been here already/m.test(fileContents));
    assert(!/\<\%\= partial \%\>/m.test(fileContents));
    
  });

});




