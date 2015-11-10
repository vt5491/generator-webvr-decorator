// 
// vr-decorator:sub-angular generator
//  created 2015-11-02
//

//TODO: service name not being inserted in controller/main.js
'use strict';

var _ = require('lodash');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var helpers = require('yeoman-generator').test;
//var vrBaseGenerator = require('generator-vr-base');
//var env = require('yeoman-environment').createEnv();
//var env = require('yeoman-generator').createEnv();
var env = require('yeoman-generator')();
var vtTest = require('../../lib/vttest.js');
//require('../../lib/vttest.js');
//var common = require('../../lib/common.js');
//var env = require('yeoman-generator')();
var path = require('path');
var async = require('async');

// helper methods go here
var AngVrBase = yeoman.generators.Base.extend({


});

// mixin common class
_.extend(AngVrBase.prototype, require('../../lib/common.js'));

//module.exports = yeoman.generators.Base.extend({
module.exports = AngVrBase.extend({
  _initGlobals: function (cb) {
    this.defaultArtifactNames = {};
    
    // services
    //this.defaultArtifactNames.mainService = 'mainService';
    this.defaultArtifactNames.mainService = 'main';
    this.defaultArtifactNames.baseService = 'base';
    this.defaultArtifactNames.utilsService = 'utils';
    
    // controllers
    // note: main controller is gen'd by the angular generator, so we need to be
    // careful to not re-generate it again.  We need it in this list, however, because
    // we will modify it.
    // we should be able to get rid of main controllers once vrAppController is worked out.
    this.defaultArtifactNames.mainController = 'main'; 
    //this.defaultArtifactNames.vrAppController = this.options.appName || 'vrapp';
    //console.log('sub-angular._initGlobals: options=', this.options);
    if (typeof this.options !== 'undefined' && typeof this.options.appName !== 'undefined'){
    //  console.log('value=' + this.options.appname);
      this.defaultArtifactNames.vrAppController = this.options.appName;
    }
    else {
      this.defaultArtifactNames.vrAppController = 'vrapp';
    }

    this.defaultArtifactNames.custController = 'cust';

    // directives
    this.defaultArtifactNames.canvasKeysDirective = 'canvas-keys';
    
    this.artifacts = {};
    this.artifacts.services = {};
    this.artifacts.controllers = {};
    this.artifacts.directives = {};
    
    // initialize service names
    //this.artifacts.services.mainService = this.defaultArtifactNames.mainService;
    this.artifacts.services.main = this.defaultArtifactNames.mainService;

    //this.log('_initGlobals: this.artifacts.services.mainService=' + this.artifacts.services.mainService);
    this.artifacts.services.base = this.defaultArtifactNames.baseService;
    this.artifacts.services.utils = this.defaultArtifactNames.utilsService;

    // initialize controller names
    this.artifacts.controllers.main = this.defaultArtifactNames.mainController;
    this.artifacts.controllers.vrapp = this.defaultArtifactNames.vrAppController;
    this.artifacts.controllers.cust = this.defaultArtifactNames.custController;
    
    // initialize directive names
    this.artifacts.directives.canvasKeys = this.defaultArtifactNames.canvasKeysDirective;

    //TODO: make this customizable e.g via options
    this.skipInstall = true;

    //this.fileUpdatedTag = '//file last updated on: ';
  },

  // we need to create a partial file that is the same name as the appName.  We
  // have to dynamically create this at runtime, since we don't know the app name
  // until the user supplies it via prompts.
  // _createVrAppPartial: function () {

  // };

  // parse the angular dependency line and inject new dependencies
  // example line:
  //'.controller('MainCtrl', function ($scope) {'
  // to:
  //'.controller('MainCtrl', function ($scope, service1, service2) {'
  //
  // note angArtifactType is one of the following: 'controller', 'service' etc
  _injectDependencies: function (filePath, angArtifactType, dependencies ) {
    var fileContents = this.fs.read(filePath);

    // loop over each line looking for our insert point
    var lines = _.map(fileContents.split('\n'));

    console.log('lines=', lines);
    var matchedLine;

    var matchedLineNum = 0;
    
    var findDependencyLine = function(line) {
      //var regex = new RegExp('\.' + angArtifactType + '\(.*function\s*\(');
      var regex = new RegExp('\\.' + angArtifactType + '\\(.*function\\s*\\(');
      //var regex = /\.controller\(.*function\s*\(/;
      //console.log('line=' + line);

      //console.log('regex.test(line)=' + regex.test(line));
      
      if (regex.test(line)){
        matchedLine = line;
        return false;
      }
      else {
        matchedLineNum ++;
        
        return true;
      }
    };

    lines.every(findDependencyLine);

    this.log('_injectDependencies: matchedLine=' + matchedLine);
    
    if (typeof matchedLine !== 'undefined') {
      // line has been found, now lets inject our stuff
      //var regex = new RegExp('\.' + angArtifactType + '\(.*function\s*\(');
      var regex = /function\s*\((.*)\)/;
      var match = regex.exec(matchedLine);
      //alert(match[1]);  // abc
      

      var dependenciesStr = '';
      
      if (match !== null) {
        console.log('_injectDependencies: match=' + match[1]);

        dependenciesStr = match[1];
        
        for(var i =0; i < dependencies.length; i++) {
          dependenciesStr += (', ' + dependencies[i]) ;
        };

        // remove leading comma if any

        dependenciesStr = dependenciesStr.replace(/^\s*,/, '');

        console.log('dependenciesStr=' + dependenciesStr);
      }

      // now insert it back into the lines array
      console.log('matchedLine b=' + matchedLine);
      var newLine = matchedLine.replace(/(function\s*)\((.*)\)/,
            "$1(" + dependenciesStr + ")");
      //console.log('$1=' + "$1");
      console.log('final matched line=' + newLine);

      lines[matchedLineNum] = newLine;

      var newFileContents = '';
      
      var linesAccumulate = function(str) {
        newFileContents += (str + '\n');
      };

      _.map(lines, linesAccumulate);

      // and write it back
      this.fs.write(filePath, newFileContents);
      
    };
  },
  
  initializing: function () {
    console.log('now in angular-vr-base initializing');
    // console.log('intitializing.this=', this);
    // console.log('->this.config.name=',this.config.name);
    //console.log('subangular.initialzing: this.options=', this.options);

    // get a vr-base generator object, so we can call call utility methods on it
//     this.vrBaseGen = helpers.createGenerator('vr-base:app', [      
// //      path.join(__dirname, '../generators/app')
//       ],
//       null,
//      {}
//     );
    //this.vrBaseGen = yeoman.
    //this.vrBaseGen = yeoman.create(vrBaseGenerator);

    // var tmpVrBaseGen;

    // var result = env.lookup();
    // console.log('result=', result);
    
    // env.lookup(function() {
    //   //this.vrBaseGen = env.create('generator-vr-base');
    //   tmpVrBaseGen = env.create('vr-base:app');
    //   //vrBaseGen = yeoman.create('vr-base:app');
    // });

    // this.vrBaseGen = tmpVrBaseGen;

    // console.log('this.vrBaseGen=', this.vrBaseGen);
    //console.log('vrBaseGen.abc()=', this.vrBaseGen.abc());
    //var my
    //var xyz = new vtTest();
    //console.log('vtTest.abc=' + vtTest.abc());
    //console.log('vtTest.def=' + vtTest.def());
    
    this._initGlobals();

    //common.doIt(this,'');
    //common.copyUserLibModules('file.txt', this);
    //console.log('subangular.initialzing: artifacts.controllers.vrapp', this.artifacts.controllers.vrapp);
    // we need to create a partial file that is the same name as the appName.  We
    // have to dynamically create this at runtime, since we don't know the app name
    // until the user supplies it via prompts.
    var mainFilePath = path.join(__dirname, 'partials/controllers/main.js');
    var vrAppFilePath = path.join(__dirname, 'partials/controllers/' + this.artifacts.controllers.vrapp + '.js');

    console.log('initializing: vrAppFilePath=' + vrAppFilePath);

    this.fs.copy(mainFilePath, vrAppFilePath);

    // mixin the common module
    //_.extend(Base.prototype, require('./actions/actions'));
    //_.extend(AngVrBase.prototype, require('../../lib/common.js'));

    
    // console.log('this.doIt2=' + this.doIt2());
    // console.log('this.getFileListSync=', this.getFileListSync('.'));
    // console.log('common.globals.fileUpdatedTag=' + this.globals.fileUpdatedTag);
    //this.log('initializing: this.options=', this.options);
    //debugger;
    //this.log('initliazing: artifacts in options:' + ('artifacts' in this.options));
    //this.log('initializing: this.options.artifacts=', this.options.artifacts);
    // allow the user to override artifacts (useful for unit testing)
    // if ( 'artifacts' in this.options) {
    //   this.artifacts = this.options.artifacts;
    //   this.log('initializing: this.artifacts=',this.artifacts);
    // }
  },
  
  prompting: function () {
    var done = this.async();

    // // Have Yeoman greet the user.
    // this.log(yosay(
    //   'Welcome to the super ' + chalk.red('AngularVrBase') + ' generator!'
    // ));

    var prompts = [{
      type: 'confirm',
      name: 'someOption',
      message: 'sub-angular: Would you like to enable this option?',
      default: true
    }];

    this.prompt(prompts, function (props) {
      this.props = props;
      // To access props later use this.props.someOption;

      done();
    }.bind(this));

//    if (!this.angularAppFound) {
//      var done = this.async();

//    };
  },

  createAngularServices: function () {
    // console.log('subgeneratorServices: entered');
    // console.log('subgeneratorServices: this.args=' + this.args);
    // console.log('subgeneratorServices:  services.main= ' + this.artifacts.services.main);
    Object.keys(this.artifacts.services).forEach( function (key, index, array) {
      //console.log('subgeneratorServices:  key= ' + key);
      this.composeWith('angular:service',  {
        args: [ this.artifacts.services[key] ],

      } );
      
    }.bind(this));    
  },

  createAngularControllers: function () {
    // console.log('subgeneratorServices: entered');
    // console.log('subgeneratorServices: this.args=' + this.args);
    // console.log('subgeneratorServices:  services.main= ' + this.artifacts.services.main);
    //controllerLoop:
    Object.keys(this.artifacts.controllers).forEach( function (key, index, array) {
      console.log('subgeneratorControllers:  key= ' + key);
      // the 'main' controller is already pre-defined in a standard angular app.  Thus
      // we want to skip creating this controller anew.
      if( key === 'main') {
        //continue controllerLoop;
        return;
      };
      
      this.composeWith('angular:controller',  {args: [ this.artifacts.controllers[key] ]} );
      
    }.bind(this));    
  },
  
  // helper method
  _markupFile: function (filePath) {
 // _injectTemplate: function (filePath) {
    var fileContents = this.fs.read(filePath);

    //console.log('_markupFile: fileContents=' + fileContents);
    this.conflicter.force = true;

    // if this is the 'main' controller and we've already updated it, don't
    // add a '<%= partial %>' tag, as this will just create repeats
    if (/controllers\/main.js/.test(filePath))
    {
      // the updated at tag indicates if we've touched this controller before
      //var fileContents = this.fs.read(filePath);

      var tagRegex = new RegExp('^\/\/' + '\\s*' + this.globals.fileUpdatedTag, 'm');

      if (tagRegex.test(fileContents)) {
        // found tag, return without doing anything
        return;
      };
    };
    
    // loop over each line looking for our insert point
    var lines = _.map(fileContents.split('\n'));

    var accumulateLines = function(str) {
      var result = '';

      // look for closing bracket, and insert our tag before this
      if (/^\s\s\}\);/.test(str)) {
        result +=  '<%= partial %>' + '\n';   
      }
      result += str + '\n';

      return result;
      
    };

    // convert file string into an array of lines (including tagged line)
    var taggedLines = _.map(lines, accumulateLines);

    // convert the array back into a string so we can rewrite to the file
    //fileContents = null;
    fileContents = '';

    var strAccumulate = function(str) {
      //fileContents += (str + '\n');
      fileContents += str;
    };

    _.map(taggedLines, strAccumulate);

    // and write it back
    this.fs.write(filePath, fileContents);
  },
  
  // insert tags into the base angular artifacts, so we can later inject our custom code
  markupArtifacts: function () {
    // services
    Object.keys(this.artifacts.services).forEach( function (key, index, array) {
      var filePath = this.destinationPath('app/scripts/services/' + [ this.artifacts.services[key] ] + '.js');
      console.log('markupArtifacts: filePath=' + filePath);
      this._markupFile(filePath);
    }.bind(this));
    
    // controllers
    Object.keys(this.artifacts.controllers).forEach( function (key, index, array) {
      var filePath = this.destinationPath('app/scripts/controllers/' + [ this.artifacts.controllers[key] ] + '.js');
      this._markupFile(filePath);
    }.bind(this));

    // // directives
    // Object.keys(this.artifacts.directives).forEach( function (key, index, array) {
    //   var filePath = this.destinationPath('app/scripts/directives/' + [ this.artifacts.directives[key] ] + '.js');
    //   this._markupFile(filePath);
    // }.bind(this));
    // inject mainService into vrAppController dependencies
    var controllerPath = this.destinationPath('app/scripts/controllers/' + [ this.artifacts.controllers['main'] ] + '.js');
    console.log('markupArtifacts: controllerPath=' + controllerPath);
    
    this._injectDependencies(controllerPath, 'controller', [this.artifacts.services.main]);

    var servicePath = this.destinationPath('app/scripts/services/' + [ this.artifacts.services['main'] ] + '.js');
    console.log('markupArtifacts: servicePath=' + servicePath);
    
    this._injectDependencies(servicePath, 'service', ['$window', this.artifacts.services.base]);
  },                                                 
    
//  },                                                 

  
  // inject partials into the template code
  partialsInjection: function () {

    Object.keys(this.artifacts.services).forEach( function (key, index, array) {
      var templatePath = this.destinationPath('app/scripts/services/' + [ this.artifacts.services[key] ] + '.js');
      var partialsPath = this.templatePath('../partials/services/' + [ this.artifacts.services[key] ] + '.js');

      //console.log('partialsInjection: tempaltePath=' + templatePath);
      //console.log('partialsInjection: partialsPath=' + partialsPath);
      //debugger;
      var partialContents = this.fs.read(partialsPath);

      var ts = new Date().toLocaleString();
      //partialContents += '// file generated: ';
      partialContents += '//' + this.globals.fileUpdatedTag;
      partialContents += ts;

      //console.log('hello from the ut');
      //partialContents += '//File generated: ' + new Date().toISOString().toLocaleString().replace(/T/, ' ').replace(/\..+/, '') + '\n';
      this.fs.copyTpl(
        templatePath,
        templatePath,
        { partial: partialContents}
      );
      
    }.bind(this));

    Object.keys(this.artifacts.controllers).forEach( function (key, index, array) {
      var templatePath = this.destinationPath('app/scripts/controllers/' + [ this.artifacts.controllers[key] ] + '.js');
      var partialsPath = this.templatePath('../partials/controllers/' + [ this.artifacts.controllers[key] ] + '.js');

      //console.log('partialsInjection: tempaltePath=' + templatePath);
      //console.log('partialsInjection: partialsPath=' + partialsPath);
      //debugger;
      var partialContents = this.fs.read(partialsPath);

      //partialContents += new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + '\n';
      //partialContents += '// file generated: ';
      partialContents += '//' + this.globals.fileUpdatedTag;
      partialContents += new Date().toLocaleString();

      this.fs.copyTpl(
        templatePath,
        templatePath,
        { partial: partialContents}
      );
      
    }.bind(this));    

  },

  markupHtml: function () {
    var libDir;
    this.log('now in markupHtml');
    
    libDir = this.templatePath('../../common/lib/');
    
    async.waterfall([
      function getList(callback) {
        this.getLibList(libDir, function (err, libArray) {
          callback(err, libArray);
        });
      }.bind(this),
      function updateHtml(libArray, callback) {
        console.log('b: libArray=', libArray);
        var htmlPath = this.destinationPath('app/index.html');
        this.registerLibsHtml(htmlPath, libArray);
        callback(null, 'hello');
      }.bind(this)      
    ],
    function (err, result) {
      if (err) throw err;
      console.log(result);
    }
    );
    //   this.getLibList(dir, function (err, dirList) {
    //   //console.log('ut.dirList=', dirList);

    //   // assert.equal(typeof dirList, 'object' );
    //   // // console.log('dirList.length=' + dirList.length) ;
    //   // // console.log('dirList[0]=' + dirList[0]) ;
    //   // assert.equal(dirList[0], 'lib/VRControls.js');
    //   // assert.equal(dirList[1], 'lib/VREffect.js');
    //   // done();
    // });
  },
  
  //  Now we need to replace any tags in the partial.  Since
  // the files are already in place, we only need to do an in place
  // copy.  We'll achive this as part of the standard 'writing' step.
  writing: function () {
    console.log('sub-angular: now in writing, this.options.appName=', this.options.appName);
    Object.keys(this.artifacts.services).forEach( function (key, index, array) {
      var templatePath = this.destinationPath('app/scripts/services/' +
                                              [ this.artifacts.services[key] ] + '.js');

      this.fs.copyTpl(
        templatePath,
        templatePath, {
          name: key,
          appName: this.options.appName
        }
      );
    }.bind(this));

    Object.keys(this.artifacts.controllers).forEach( function (key, index, array) {
      var templatePath = this.destinationPath('app/scripts/controllers/' +
                                              [ this.artifacts.controllers[key] ] + '.js');

      console.log('this.artifacts.services.main=' + this.artifacts.services.main);
      this.fs.copyTpl(
        templatePath,
        templatePath, {
          name: key,
          appName: this.options.appName,
          'main-service': this.artifacts.services.main,
          mainService: this.artifacts.services.main,
        }
      );
    }.bind(this));

    // copy user libs here
    // this.log('now calling copyUserLibModules');
    // common.copyUserLibModules('file.txt', this);
    //var srcDir = this.sourceRoot('generators/common/lib/');
    var srcDir = this.templatePath('../../common/lib/');
    var destDir = this.destinationPath('app/lib/');

    //common.copyUserLibDir(srcDir, destDir, this);
    this.copyUserLibDir(srcDir, destDir, this);

    // copy standard files
    //app: function () {
      this.fs.copy(
        this.templatePath('main.html'),
        this.destinationPath('app/views/main.html')
      );
      // this.fs.copy(
      //   this.templatePath('_bower.json'),
      //   this.destinationPath('bower.json')
      // );
    //};
    
  },
  
  // install: function () {
  //   this.installDependencies();
  // }

  install: function () {
    //this.installDependencies();
    //this.bowerInstall(packages[this.format], ['--save-dev']);
    // we need to surgically install our dependencies as we do not supply
    // our own bower.json.  We rely on the bower.json from the angular install.
    // If we were to call 'installDependencies' here, it would install all angualar
    // depencies again.  If we wanted to do a 'big bang' dependency install, then we
    // would have to manually insert lines into bower.json, and then rely on the
    // parent installDependencies() to install.  But there's a lot of use cases between
    // people who are installing over a previous angular, and those installing angual and
    // the vr-decoorator in swoop, and it's easist to just surgically add them here.
    if(!this.skipInstall) {
      this.log('sub-angular.install: now installing three.js');
      //this.bowerInstall('three.js', ['--save-dev']);
      this.bowerInstall(['three.js'], { 'save': true });
    };
  }
  
  // TODO: you need a way to make sure bower.json and package.json
  // (as supplied by the base angular install) are *not* overlaid by this installer.
  // we have no additional install dependencies beyond what angular requires (?)
  // so skip this.  Actually, as currently implemented this screws up the
  // angular app
  // install: function () {
  //   this.log('base.install: skipInstall=' + this.skipInstall);
  //   if( !this.skipInstall) {
  //     this.log('base.install: now calling installDependencies');
  //     this.installDependencies();      
  //   };
  // }
  
});

