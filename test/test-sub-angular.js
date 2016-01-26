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
//vt add
var _ = require('lodash');
var should = require('should');
var expect = require('chai').expect;
const fs = require('fs');
//vt end

var common_ut = require('./test-lib-common.js');


// this will be the end to end test
describe('angular-vr-base:app end to end', function () {

  
   beforeEach(function (done) {
    var artifacts = {};
    artifacts.services = {};

     //vt add
    var artifacts = {};
      
    artifacts.services = {};
    //vtartifacts.controllers = {};
    artifacts.ctrls = {};
    artifacts.directives = {};
    
    artifacts.services.main = 'main';
    artifacts.services.base = 'base';

    //artifacts.controllers.main = 'main';
    artifacts.ctrls.main = 'main';
      
    //vt add
    var userNames = {};
    userNames.services = {};
    
    userNames.services.main = 'main'; 
    userNames.services.base = 'base'; 
    userNames.services.utils = 'utils'; 
    
    userNames.ctrls = {};
    userNames.ctrls.main = 'main'; 
     //vt end
     // //vt add
     // var options = {};
     // options.userNames = {};
     // options.userNames.ctrls = {};
     // options.userNames.ctrls.main = 'main';
     // //vt end

    // create a mock angular generator
    var angularServiceDummy = generators.Base.extend({
      
      initializing: function () {        
        // write a line to simulate ending of an angular service
        var fn = 'app/scripts/services/' + this.args + '.js';        
        this.fs.write(fn, '//dummy-line\n  });\n');
      },
    });

    var angularControllerDummy = generators.Base.extend({
      //vt add
      //options: {userNames: {ctrls: 'abc'}},
      //vt end
      
      initializing: function () {        
        // write a line to simulate ending of an angular controller
        var fn = 'app/scripts/controllers/' + this.args + '.js';
        
        this.fs.write(fn, '//dummy-line\n  });\n');
      }
    });
     //vt add
     //angularControllerDummy.args = { options: {userNames: {ctrls: {main: 'main'}}}};
     //vt end

    var angularDirectiveDummy = generators.Base.extend({
      
      initializing: function () {        
        // write a line to simulate ending of an angular directive
        var fn = 'app/scripts/directives/' + this.args + '.js';        
        this.fs.write(fn, '//dummy-line\n  });\n');
      }
    });
     
     
    this.angVrBaseAppRunContext = helpers.run(path.join(__dirname, '../generators/app'))
      .withOptions({ skipInstall: true,
                     name: 'def',
                     //vt add
                     //userNames: {ctrls: ''},
                     'artifacts': artifacts,  userNames: userNames,
                    //vt end
                   })
      .withArguments(['defg' ])
      .withGenerators([
        [angularServiceDummy, 'angular:service'],
        [angularControllerDummy, 'angular:controller'],
        [angularDirectiveDummy, 'angular:directive'],
      ])
      .withPrompts({'continue': 'y', 'artifactsToRename': []})
      .on('ready', function (gen) {        
        gen.fs.write('app/scripts/controllers/main.js', '//dummy-line\n  });\n');
        // we need to mock a dummy bower.json
        gen.fs.write('bower.json', '{"dependencies": {}}');
        common_ut.writeDummyIndexHtml('', gen);
        gen.fs.write('app/views/main.html', '//dummy-line\n  });\n');
        gen.fs.write('app/scripts/directives/canvaskeys.js', '//dummy-line\n  });\n');
        //vt add
        gen.fs.write(gen.destinationPath('app/scripts/app.js'), '      .otherwise({\n  });\n');
        //vt end
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
      //'app/scripts/controllers/cust.js',
      'app/scripts/controllers/main.js',
    ]);

  });

  //vt add
  // it('creates directive files', function () {
  //   assert.file([
  //     'app/scripts/directives/canvaskeys.js',
  //   ]);
  // });

  //vt end
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
  //vt add
  it('adds a stanza to the route', function () {
    var fileContents;
    
    var gen = this.angVrBaseAppRunContext.generator;

    fileContents = gen.fs.read('app/scripts/app.js');
    
    var regex = /MainCtrl/m;

    // there should not be a MainCtrl because we are using defaults
    assert(!regex.test(fileContents));    
  });
  //vt end
});

// this will test individual methods, or sub-workflows.
describe('angular-vr-base:individual methods', function () {
  var subAngularGenerator;
  var APP_NAME = 'testapp';
  //vt add
    // var mainCtrl = 'userMain';
    // var mainCtrlClass = 'UserMainCtrl';
  //vt end
  //Note: there is at least one test ('artifacts transformation pipeline') that
  // alters values in subAngularGenerator, so this needs to be a 'beforeEach'.  The
  // other test could probably work off a before loop, so if you really wanted
  // you could segregate them.  However, these tests are fast enough, so no biggy
  // to leave as 'beforeEach' for all.

    //vt add
  var mainCtrl, mainCtrlClass, mainService, baseService;
  
  var setupUserOverrideEnvironment = function () {
    // this function sets up an environment mimicing the effects of a user specifying
    // non-default artifact names.  It really belongs in beforeEach, but since I came
    // up with this feature later in the implementation cycle, I wanted to add it
    // selectively so as to not break any prior tests that are assuming default values.
    // we set up some userName specific stuff here to temporarily override the
    // values setup in the beforeEach
    // override the name of the main controller for testing purposes
    mainCtrl = 'userMain';
    mainCtrlClass = 'UserMainCtrl';
    subAngularGenerator.options.userNames.ctrls.main = mainCtrl;
    subAngularGenerator.fs.write('app/scripts/controllers/' + mainCtrl.toLowerCase() + '.js', '//dummy-line\n  });\n');

    mainService = 'userMain';
    subAngularGenerator.options.userNames.services.main = mainService;
    subAngularGenerator.fs.write('app/scripts/services/' + mainService.toLowerCase() + '.js', '//dummy-line\n  });\n');

    baseService = 'userBase';
    subAngularGenerator.options.userNames.services.base = baseService;
    subAngularGenerator.fs.write('app/scripts/services/' + baseService.toLowerCase() + '.js', '//dummy-line\n  });\n');

    // re-init class variables
    //subAngularGenerator.initializing();
    subAngularGenerator.mainCtrl = subAngularGenerator.options.userNames.ctrls.main + 'Ctrl';
    subAngularGenerator.mainCtrlClass = subAngularGenerator.mainCtrl.charAt(0).toUpperCase() + subAngularGenerator.mainCtrl.slice(1);
  };
    //vt end
  
  beforeEach(function (done) {

    var artifacts = {};
      
    artifacts.services = {};
    //vtartifacts.controllers = {};
    artifacts.ctrls = {};
    artifacts.directives = {};
    
    artifacts.services.main = 'main';
    artifacts.services.base = 'base';

    //artifacts.controllers.main = 'main';
    artifacts.ctrls.main = 'main';
      
    //vt add
    var userNames = {};
    userNames.services = {};
    
    userNames.services.main = 'main'; 
    userNames.services.base = 'base'; 
    userNames.services.utils = 'utils'; 
    
    userNames.ctrls = {};
    userNames.ctrls.main = 'main'; 

    userNames.directives = {};
    userNames.directives.canvasKeys = 'canvasKeys'; 
    //vt end
    subAngularGenerator = helpers.createGenerator('webvr-decorator:sub-angular', [
      path.join(__dirname, '../generators/sub-angular')
      ],
      null,
     {'artifacts': artifacts, appName: APP_NAME, userNames: userNames,
     });

    //subAngularGenerator.globals.fileupdatedtag = 'webvr-decorator-> file updated on: ';
    subAngularGenerator.globals.fileupdatedtag = common.globals.fileUpdatedTag;

    //vt add
    // mixin common class
    _.extend(subAngularGenerator.prototype, require('../lib/common.js'));

    //vt end
    artifacts.directives.canvasKeys = 'canvasKeys';
    
    // we need to do this to properly feed in options and args
    subAngularGenerator.initializing();

    //vt add
    // initialize the options
    subAngularGenerator.options.userNames = {};
    // ctrls
    subAngularGenerator.options.userNames.ctrls = {};
    subAngularGenerator.options.userNames.ctrls.main = 'main';
    //services
    subAngularGenerator.options.userNames.services = {};
    subAngularGenerator.options.userNames.services.main = 'main';
    subAngularGenerator.options.userNames.services.base = 'base';
    subAngularGenerator.options.userNames.services.utils = 'utils';
    //vt-xsubAngularGenerator.options.userNames.ctrls = {};
    // directives
    subAngularGenerator.options.userNames.directives = {};
    subAngularGenerator.options.userNames.directives.canvasKeys = 'canvasKeys';
    // subAngularGenerator.options = {};
    // subAngularGenerator.options.userNames = {};
    // subAngularGenerator.options.userNames.ctrls = {};
    // subAngularGenerator.options.userNames.ctrls.main = 'userMain';
    //vt end

    // override the artifacts hash
    subAngularGenerator.artifacts = artifacts;

    subAngularGenerator.fs.write('file.txt', '//dummy-line\n  });\n');

    subAngularGenerator.fs.write('app/scripts/services/main.js', '//dummy-line\n  });\n');
    subAngularGenerator.fs.write('app/scripts/services/base.js', '//dummy-line\n  });\n');
    // we use dummy controller to test parsing
    subAngularGenerator.fs.write('app/scripts/controllers/dummy.js',
        "angular.module('vrsketchApp')\n.controller('MainCtrl', function ($scope) {\n");
    subAngularGenerator.fs.write('app/scripts/controllers/main.:3js', '//dummy-line\n  });\n')
;
    subAngularGenerator.fs.write('app/scripts/directives/canvaskeys.js', '//dummy-line\n  });\n');

    // mock up partials    
    //vtsubAngularGenerator.fs.write(subAngularGenerator.templatePath('../partials/services/main.js'), '<%= name %>\n');    
    subAngularGenerator.fs.write(subAngularGenerator.templatePath('../partials/services/main.js'), '<%= name %>\n <%= baseService %>.ONE_DEGREE');    
    subAngularGenerator.fs.write(subAngularGenerator.templatePath('../partials/services/base.js'), '<%= name %>\n');
    subAngularGenerator.fs.write(subAngularGenerator.templatePath('../partials/directives/canvaskeys.js'), '<%= name %>\n');

    //vt add
    console.log('beforeEach. app/script/app.js=', subAngularGenerator.destinationPath('app/scripts/app.js'));
    subAngularGenerator.fs.write(subAngularGenerator.destinationPath('app/scripts/app.js'), '      .otherwise({\n  });\n');
    var tmpResult = subAngularGenerator.fs.read(subAngularGenerator.destinationPath('app/scripts/app.js'));
    console.log('beforeEach. tmpResult=', tmpResult);
    //subAngularGenerator.fs.write('app/scripts/app.js', '      .otherwise({\n  });\n');
    // mock some user partials too
    // subAngularGenerator.fs.write(subAngularGenerator.templatePath('../partials/services/userMain.js'), '<%= baseService %>\n');    
    // subAngularGenerator.fs.write(subAngularGenerator.templatePath('../partials/services/userBase.js'), '<%= name %>\n');
      // .when('/about', {
      //   templateUrl: 'views/about.html',
      //   controller: 'AboutCtrl',
      //   controllerAs: 'about'
      // })
      // .when('/monad', {
      //   templateUrl: 'views/monad.html',
      //   controller: 'MonadCtrl',
      //   controllerAs: 'monad'
      // })
      // .otherwise({
      //   redirectTo: '/'
      // });

    // setup an app.js (for route processing)
    var appJsCode = [
      'angular',
      ".module ( 'thereminAngApp', [",
      'ngAnimate',
      ' ])',
      '.config(function ($routeProvider) {',
      '$routeProvider',
      ".when('/', {",
      "templateUrl: 'views/main.html',",
      "controller: 'MainCtrl',",
      "controllerAs: 'main'",
      "})",
      ".otherwise({",
      "redirectTo: '/'",
      "});",
      "});",
    ].join('\n');

    subAngularGenerator.fs.write('app/scripts/app.js', appJsCode);
    //vt end
    
    done();
  });
  //);'

  //vt add
  // in this ut, we don't actually call any methods in the generator, but rather
  // insure any artifacts needed for a sucessful run are in the proper condition
  it('pre-runtime environment is properly set', function(){    
    var result, srcPath, baseServiceRegex;
    
    //srcPath = subAngularGenerator.templatePath('../partials/services/main.js');
    srcPath = __dirname + '/../generators/sub-angular/partials/services/main.js';

    console.log('test-sub-angular.pre-runtime: srcPath=', srcPath);
    console.log('test-sub-angular.pre-runtime: __dirname=', __dirname);

    //result = subAngularGenerator.fs.read(srcPath);
    result = fs.readFileSync(srcPath, 'utf8');

    //console.log('result=', result);
    var baseServiceRegex = new RegExp('.*\<\%\= baseService \%\>', 'm');
    //baseServiceRegex.test(result).should.be.true;
    expect(baseServiceRegex.test(result)).to.be.true;
    //expect(7 === 8).to.be.true;
    // var result = subAngularGenerator._initGlobals();

    // assert.equal(subAngularGenerator.artifacts.services.main, subAngularGenerator.defaultArtifactNames.mainService);
  });
     //vt end
  
  it('_initGlobals works', function(){    
    var result = subAngularGenerator._initGlobals();

    assert.equal(subAngularGenerator.artifacts.services.main, subAngularGenerator.defaultArtifactNames.mainService);
    //console.log('vt:sub-angular: _initGlobal: subAngularGenerator._initGlobals=', subAngularGenerator._initGlobals);
  });
  
  it('vr-base generator is an instance variable', function () {
  });

  // dynamcially creating 'controller/vrapp.js' causes write errors at runtime
  // remove this test, until we need this functionality
  // it('initliazing creates an <appName> partial', function () {
   
  //   var mainFilePath = path.join(__dirname, '../generators/sub-angular/partials/controllers/main.js');
  //   var vrAppFilePath = path.join(__dirname, '../generators/sub-angular/partials/controllers/' + APP_NAME + '.js');
  //   // next: verify the contents
  //   var mainFileContents = subAngularGenerator.fs.read(mainFilePath);
  //   var vrAppFileContents = subAngularGenerator.fs.read(vrAppFilePath);
    
  //   assert.equal(mainFileContents, vrAppFileContents );
  // });

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
    // Note how we only read files via subAngularGenerator.fs.read, because the files
    // will not get phsically written in the test environment, because they're pointing
    // toward an app folder that does not exist in the generator's environment (this would 
    // not be true in an actual runtime environment), and thus we want to read the 'soft' internal
    // version.
    var result;

    //vt add
    setupUserOverrideEnvironment();
    //vt end
    // //vt add
    // // we set up some userName specific stuff here to temporarily override the
    // // values setup in the beforeEach
    // // override the name of the main controller for testing purposes
    // var mainCtrl = 'userMain';
    // var mainCtrlClass = 'UserMainCtrl';
    // subAngularGenerator.options.userNames.ctrls.main = mainCtrl;
    // subAngularGenerator.fs.write('app/scripts/controllers/' + mainCtrl.toLowerCase() + '.js', '//dummy-line\n  });\n');

    // var mainService = 'userMain';
    // subAngularGenerator.options.userNames.services.main = mainService;
    // subAngularGenerator.fs.write('app/scripts/services/' + mainService.toLowerCase() + '.js', '//dummy-line\n  });\n');

    // var baseService = 'userBase';
    // subAngularGenerator.options.userNames.services.base = baseService;
    // subAngularGenerator.fs.write('app/scripts/services/' + baseService.toLowerCase() + '.js', '//dummy-line\n  });\n');
    // //vt end
    // markup artifacts
    subAngularGenerator.markupArtifacts();

    //vtresult = subAngularGenerator.fs.read('app/scripts/services/base.js');
    result = subAngularGenerator.fs.read('app/scripts/services/' + baseService.toLowerCase() + '.js');

    var regex = /\<\%\= partial \%\>/;
    
    assert(regex.test(result));

    // partials injection
    subAngularGenerator.partialsInjection();

    //vtresult = subAngularGenerator.fs.read('app/scripts/services/base.js');
    result = subAngularGenerator.fs.read('app/scripts/services/' + baseService.toLowerCase() + '.js');
    
    var regex = /\<\%\= name \%\>/;
    
    assert(regex.test(result));

    //vt add
    result = subAngularGenerator.fs.read('app/scripts/services/' + mainService.toLowerCase() + '.js');
    
    var regex = /\<\%\= baseService \%\>/;
    console.log('pipeline.partialsInjection: result=', result);
    
    assert(regex.test(result));
    //vt end
    // template Interpolation
    subAngularGenerator.writing();

    //vtresult = subAngularGenerator.fs.read('app/scripts/services/base.js');
    result = subAngularGenerator.fs.read('app/scripts/services/' + baseService.toLowerCase() + '.js');
    var regex = /base/m;
    
    assert(regex.test(result));

    //vtresult = subAngularGenerator.fs.read('app/scripts/controllers/main.js');
    result = subAngularGenerator.fs.read('app/scripts/controllers/' + mainCtrl.toLowerCase() + '.js');

    // is the call to the main service now in the controller file?
    //regex = new RegExp(subAngularGenerator.defaultArtifactNames.mainService + '.init');    
    regex = new RegExp(subAngularGenerator.options.userNames.services.main + '.init');    

    assert(regex.test(result));

    // verify the updated tag is there    
    var tagRegex = new RegExp('^\/\/' + '\\s*' + common.globals.fileUpdatedTag, 'm');    

    assert(tagRegex.test(result));
    //vt add
    // test the main.html file
    //console.log('test-sub-angular: subAngularGenerator.options=', subAngularGenerator.options);
    result = subAngularGenerator.fs.read('app/views/' + subAngularGenerator.options.userNames.ctrls.main.toLowerCase() + '.html');
    console.log('===>test-sub-angular: view result=', result);

    //assert.exist(result);
    //ng-controller="MonadCtrl"
    result.should.exist;
    // assert.file([
    //   'app/views/main.html',
    // ]);
    var ctrlRegex = new RegExp('.*ng-controller="' + mainCtrlClass + '"', 'm');    

    assert(ctrlRegex.test(result));

    // test the main.js service
    //console.log('test-sub-angular: subAngularGenerator.options=', subAngularGenerator.options);
    result = subAngularGenerator.fs.read('app/views/' + subAngularGenerator.options.userNames.ctrls.main.toLowerCase() + '.html');
    //console.log('===>test-sub-angular: view result=', result);

    //assert.exist(result);
    //ng-controller="MonadCtrl"
    result.should.exist;
    // assert.file([
    //   'app/views/main.html',
    // ]);
    // make sure there's a 'userBase.ONE_DEGREE' in the file (instad of <%= baseService %>.ONE_DEGREE)
    result = subAngularGenerator.fs.read('app/scripts/services/' + subAngularGenerator.options.userNames.services.main.toLowerCase() + '.js');

    console.log('===>test-sub-angular: main service result=', result);
    var baseServiceRegex = new RegExp( '.*' + baseService + '.ONE_DEGREE', 'm');    
    expect(baseServiceRegex.test(result)).to.be.true;
    
    // and there are no templates
    var baseServiceRegex = new RegExp( '.*\<\%\= baseService \%\>' + '.ONE_DEGREE', 'm');    
    expect(baseServiceRegex.test(result)).to.be.false;

    //vt end
  });

  // Test the situation where the main.controller has been previously updated by us
  it('main controller previously touched',function () {
    // write an updated tag
    var fp = 'app/scripts/controllers/main.js';
    subAngularGenerator.fs.write(fp,
                                   '//dummy-line\n  });\n' +
                                   '//' + common.globals.fileUpdatedTag + 'been here already' );
    subAngularGenerator._markupFile(fp);

    // the file does not have a '<%= partial %'> tag
    // because its previously been 'updated'.
    var fileContents = subAngularGenerator.fs.read(fp);
    console.log('test-sub-angular: fileContents=', fileContents);
    
    assert(!/\<\%\= partial \%\>/m.test(fileContents));    
  });

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

  it('updateRoute works', function () {
    var result, fp, regex;
    //var userMainCtrl = 'userMain';
    //var userMainCtrl = 'MonadCtrl';
    
    fp = 'app/scripts/app.js';

    setupUserOverrideEnvironment();
    
    var ctrl = 'userMain';
    var ctrlClass = 'UserMainCtrl';

    var routeStanza = [
      ".when('/" + ctrlClass + "', {",
      "templateUrl: 'views/" + ctrl + ".html'",
      "controller: '" + ctrlClass + "',",
      "controllerAs: '" + ctrl + "'",
      "})",
    ].join('\n');

    var insertPointRegex = new RegExp("\.otherwise");

    //subAngularGenerator.updateRoute(fp, insertPointRegex, routeStanza);
    subAngularGenerator._insertIntoFile(fp, insertPointRegex, routeStanza);
    
    result = subAngularGenerator.fs.read(fp);

    console.log('test-sub-angular.updateRoute: result=', result);
    
    var tmp = escapeRegExp("})");
    //console.log('tmp=', tmp);
    //regex = new RegExp("\}\)\n" + ".*" + "\.otherwise\(\{\n", 'm');    
    //regex = new RegExp("\}\)\.otherwise\(\{", 'm');
    //regex = new RegExp("\.when\(\'\/" + userMainCtrl + "\'");
    // the following works in perl
    //regex = new RegExp("\.when\(\'\/" + userMainCtrl + "\'");
    // Have to go with a basic regex, as I simply cannot get any nuanced
    // versions to work. So just check to see if the user controller is in
    // there somewhere
    regex = new RegExp(mainCtrlClass, 'm');
    console.log('regex=', regex);
 //my $matches = ( $s =~ /\.when\(\'\/$ctrl\'/);
    //result.match(regex);
    //result.match(/\}\)\n.*\.otherwise\(\{/m);

    //console.log('$1=', RegExp.$1);
    assert(regex.test(result));

  });
});




