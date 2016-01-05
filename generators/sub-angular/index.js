// 
// webvr-decorator:sub-angular generator
//  created 2015-11-02
//

'use strict';

var _ = require('lodash');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var helpers = require('yeoman-generator').test;
var env = require('yeoman-generator')();
var path = require('path');
var async = require('async');

// helper methods go here
var AngVrBase = yeoman.generators.Base.extend({

});

// mixin common class
_.extend(AngVrBase.prototype, require('../../lib/common.js'));

module.exports = AngVrBase.extend({
  _initGlobals: function (cb) {
    this.defaultArtifactNames = {};
    
    // services    
    this.defaultArtifactNames.mainService = 'main';
    this.defaultArtifactNames.baseService = 'base';
    this.defaultArtifactNames.utilsService = 'utils';
    
    // controllers
    // note: main controller is gen'd by the angular generator, so we need to be
    // careful to not re-generate it again.  We need it in this list, however, because
    // we will modify it.
    // we should be able to get rid of main controllers once vrAppController is worked out.
    this.defaultArtifactNames.mainController = 'main'; 
    
    if (typeof this.options !== 'undefined' && typeof this.options.appName !== 'undefined'){
      this.defaultArtifactNames.vrAppController = this.options.appName;
    }
    else {
      this.defaultArtifactNames.vrAppController = 'vrapp';
    }

    this.defaultArtifactNames.custController = 'cust';

    // directives
    this.defaultArtifactNames.canvasKeysDirective = 'canvasKeys';
    
    this.artifacts = {};
    this.artifacts.services = {};
    this.artifacts.controllers = {};
    this.artifacts.directives = {};
    
    // initialize service names
    this.artifacts.services.main = this.defaultArtifactNames.mainService;

    this.artifacts.services.base = this.defaultArtifactNames.baseService;
    this.artifacts.services.utils = this.defaultArtifactNames.utilsService;

    // initialize controller names
    this.artifacts.controllers.main = this.defaultArtifactNames.mainController;
    this.artifacts.controllers.vrapp = this.defaultArtifactNames.vrAppController;
    this.artifacts.controllers.cust = this.defaultArtifactNames.custController;
    
    // initialize directive names
    this.artifacts.directives.canvasKeys = this.defaultArtifactNames.canvasKeysDirective;
    
    //this.skipInstall = true;
    this.skipInstall = this.options.skipInstall;
    //this.skipInstall = false;    
  },

  initializing: function () {    
    this._initGlobals();

    console.log('subAngular.initializing: this.props=', this.props);
    console.log('subAngular.initializing: this.options=', this.options);
    console.log('subAngular.initializing: this.options.userNames.services.main=', this.options.userNames.services.main);
    return;
    // we need to create a partial file that is the same name as the appName.  We
    // have to dynamically create this at runtime, since we don't know the app name
    // until the user supplies it via prompts.
//vt    var mainFilePath = path.join(__dirname, 'partials/controllers/main.js');
//vt    var vrAppFilePath = path.join(__dirname, 'partials/controllers/' + this.artifacts.controllers.vrapp + '.js');    
//vt
//vt    this.fs.copy(mainFilePath, vrAppFilePath);

  },

  
  // prompting: function () {
  //   var done = this.async();

  //   var prompts = [{
  //     type: 'confirm',
  //     name: 'someOption',
  //     message: 'sub-angular: Would you like to enable this option?',
  //     default: true
  //   }];

  //   this.prompt(prompts, function (props) {
  //     this.props = props;
  //     // To access props later use this.props.someOption;

  //     done();
  //   }.bind(this));

  // },

  createAngularServices: function () {
    Object.keys(this.artifacts.services).forEach( function (key, index, array) {
      this.composeWith('angular:service',  {
        //vtargs: [ this.artifacts.services[key] ],
        args: [ this.options.userNames.services[ this.artifacts.services[key] ]],

      } );
      
    }.bind(this));    
  },

  createAngularControllers: function () {
    Object.keys(this.artifacts.controllers).forEach( function (key, index, array) {      
      // the 'main' controller is already pre-defined in a standard angular app.  Thus
      // we want to skip creating this controller anew.
      if( key === 'main') {
        return;
      };
      
      this.composeWith('angular:controller',  {args: [ this.artifacts.controllers[key] ]} );
      
    }.bind(this));    
  },

  createAngularDirectives: function () {
    //directiveLoop:
    Object.keys(this.artifacts.directives).forEach( function (key, index, array) {      
      this.composeWith('angular:directive',  {args: [ this.artifacts.directives[key] ]} ); 
    }.bind(this));    
  },
  
  // helper method
  _markupFile: function (filePath) { 
    var fileContents = this.fs.read(filePath);

    // if this is the 'main' controller and we've already updated it, don't
    // add a '<%= partial %>' tag, as this will just create repeats
    if (/controllers\/main.js/.test(filePath))
    {
      // the updated at tag indicates if we've touched this controller before      

      var tagRegex = new RegExp('^\/\/' + '\\s*' + this.globals.fileupdatedtag, 'm');

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
    fileContents = '';

    var strAccumulate = function(str) {      
      fileContents += str;
    };

    _.map(taggedLines, strAccumulate);

    // and write it back
    this.fs.write(filePath, fileContents);
  },

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
    
    var matchedLine;

    var matchedLineNum = 0;
    
    var findDependencyLine = function(line) {
      var regex = new RegExp('\\.' + angArtifactType + '\\(.*function\\s*\\(');
      
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
    
    if (typeof matchedLine !== 'undefined') {
      var regex = /function\s*\((.*)\)/;
      var match = regex.exec(matchedLine);

      var dependenciesStr = '';
      
      if (match !== null) {        
        dependenciesStr = match[1];
        
        for(var i =0; i < dependencies.length; i++) {
          // only add the dependcy if it's not already in there.  This should give
          // us idempotency, and and enable the generator to be run multiple times without
          // inserting the dependcy multiple times
          var regex = new RegExp('function\\s*\\(.*,\\s*' + dependencies[i] + '.*\\)');

          if(!regex.test(matchedLine)) {
            dependenciesStr += (', ' + dependencies[i]) ;
          }
          else {
            console.log('Will not inject dependency ' + dependencies[i] + ' because its already present');
          }
          
        };

        // remove leading comma if any

        dependenciesStr = dependenciesStr.replace(/^\s*,/, '');        
      }

      // now insert it back into the lines array      
      var newLine = matchedLine.replace(/(function\s*)\((.*)\)/,
            "$1(" + dependenciesStr + ")");            

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
  
  // insert tags into the base angular artifacts, so we can later inject our custom code
  markupArtifacts: function () {
    // services
    Object.keys(this.artifacts.services).forEach( function (key, index, array) {
      //vtvar filePath = this.destinationPath('app/scripts/services/' + [ this.artifacts.services[key] ] + '.js');
      var filePath = this.destinationPath('app/scripts/services/' + this.options.userNames.services[ this.artifacts.services[key] ] + '.js'); 

      this._markupFile(filePath);
    }.bind(this));
    
    // controllers
    Object.keys(this.artifacts.controllers).forEach( function (key, index, array) {
      var filePath = this.destinationPath('app/scripts/controllers/' + [ this.artifacts.controllers[key] ] + '.js');
      this._markupFile(filePath);
    }.bind(this));

    // directives
    Object.keys(this.artifacts.directives).forEach( function (key, index, array) {
      var filePath = this.destinationPath('app/scripts/directives/' + [ this.artifacts.directives[key].toLowerCase() ] + '.js');
      
      this._markupFile(filePath);
    }.bind(this));
    
    // inject mainService into vrAppController dependencies
    var controllerPath = this.destinationPath('app/scripts/controllers/' + [ this.artifacts.controllers['main'] ] + '.js');
        
    this._injectDependencies(controllerPath, 'controller', [this.artifacts.services.main]);

    // services
    //vtvar servicePath = this.destinationPath('app/scripts/services/' + [ this.artifacts.services['main'] ] + '.js');    
    var servicePath = this.destinationPath('app/scripts/services/' +  this.options.userNames.services['main']+ '.js');    
    
    this._injectDependencies(servicePath, 'service', ['$window', this.artifacts.services.base]);

    // directives
    var directivePath = this.destinationPath('app/scripts/directives/' + [ this.artifacts.directives['canvasKeys'].toLowerCase() ] + '.js');
    
    this._injectDependencies(directivePath, 'directive', ['$document', '$rootScope', this.artifacts.services.main, this.artifacts.services.base]);

    // comment out the prior angular stub code    
    var regex = /(^\s*return\s*\{[^\}]*\}.*\n^.*\};)/m; 
    
    this.commentOutCode(directivePath, regex);
  },                                                 
      
  // inject partials into the template code
  partialsInjection: function () {

    Object.keys(this.artifacts.services).forEach( function (key, index, array) {
      //vtvar templatePath = this.destinationPath('app/scripts/services/' + [ this.artifacts.services[key] ] + '.js');
      var templatePath = this.destinationPath('app/scripts/services/' + this.options.userNames.services[ this.artifacts.services[key] ]  + '.js');
      var partialsPath = this.templatePath('../partials/services/' + [ this.artifacts.services[key] ] + '.js');

      var partialContents = this.fs.read(partialsPath);

      var ts = new Date().toLocaleString();
      //partialContents += '// file generated: ';
      partialContents += '//' + this.globals.fileUpdatedTag;
      partialContents += ts;

      this.fs.copyTpl(
        templatePath,
        templatePath,
        { partial: partialContents}
      );
      
    }.bind(this));

    Object.keys(this.artifacts.controllers).forEach( function (key, index, array) {
      var templatePath = this.destinationPath('app/scripts/controllers/' + [ this.artifacts.controllers[key] ] + '.js');
      var partialsPath = this.templatePath('../partials/controllers/' + [ this.artifacts.controllers[key] ] + '.js');

      var partialContents = this.fs.read(partialsPath);

      partialContents += '//' + this.globals.fileUpdatedTag;
      partialContents += new Date().toLocaleString();

      this.fs.copyTpl(
        templatePath,
        templatePath,
        { partial: partialContents}
      );
      
    }.bind(this));    

    Object.keys(this.artifacts.directives).forEach( function (key, index, array) {
      var templatePath = this.destinationPath('app/scripts/directives/' + [ this.artifacts.directives[key].toLowerCase() ] + '.js');
      var partialsPath = this.templatePath('../partials/directives/' + [ this.artifacts.directives[key].toLowerCase() ] + '.js');

      var partialContents = this.fs.read(partialsPath);

      var ts = new Date().toLocaleString();
      
      partialContents += '//' + this.globals.fileUpdatedTag;
      partialContents += ts;

      this.fs.copyTpl(
        templatePath,
        templatePath,
        { partial: partialContents}
      );
      
    }.bind(this));    
  },

  markupHtml: function () {
    var libDir;    
    
    libDir = this.templatePath('../../common/lib/');
    
    async.waterfall([
      function getList(callback) {
        this.getLibList(libDir, function (err, libArray) {
          callback(err, libArray);
        });
      }.bind(this),
      function updateHtml(libArray, callback) {
        // add in some static libs that are defined elsewhere
        
        // I guess I need to add these manually
        libArray[libArray.length] = 'bower_components/threejs/build/three.min.js';
        libArray[libArray.length] = 'bower_components/webvr-polyfill/build/webvr-polyfill.js';        
        
        libArray[libArray.length] = 'bower_components/threejs/examples/js/controls/VRControls.js';
        libArray[libArray.length] = 'bower_components/threejs/examples/js/effects/VREffect.js';
        
        libArray[libArray.length] = 'bower_components/webvr-boilerplate/build/webvr-manager.js';
                        
        var htmlPath = this.destinationPath('app/index.html');
        this.registerLibsHtml(htmlPath, libArray);
        
        callback(null);
      }.bind(this)      
    ],
    function (err, result) {
      if (err) throw err;
      console.log(result);
    }
    );
  },
  
  //  Now we need to replace any tags in the partial.  Since
  // the files are already in place, we only need to do an in place
  // copy.  We'll achive this as part of the standard 'writing' step.
  writing: function () {    
    Object.keys(this.artifacts.services).forEach( function (key, index, array) {
      var templatePath = this.destinationPath('app/scripts/services/' +
                                              //vt[ this.artifacts.services[key] ] + '.js');
            this.options.userNames.services[ this.artifacts.services[key] ] + '.js' );

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

    Object.keys(this.artifacts.directives).forEach( function (key, index, array) {
      var templatePath = this.destinationPath('app/scripts/directives/' +
                                              [ this.artifacts.directives[key].toLowerCase() ] + '.js');
      
      this.fs.copyTpl(
        templatePath,
        templatePath, {
          name: key,
          appName: this.options.appName,
          //'main-service': this.artifacts.services.main,
          mainService: this.artifacts.services.main,
          baseService: this.artifacts.services.base,
        }
      );
    }.bind(this));
    
    // copy user libs here    
    var srcDir = this.templatePath('../../common/lib/');
    var destDir = this.destinationPath('app/lib/');

    //common.copyUserLibDir(srcDir, destDir, this);
    this.copyUserLibDir(srcDir, destDir, this);

    // copy standard files    
    this.fs.copy(
      this.templatePath('main.html'),
      this.destinationPath('app/views/main.html')
    );
  },
  
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
    // if(!this.skipInstall) {
    //   this.log('sub-angular.install: now installing three.js');
    //   //this.bowerInstall('three.js', ['--save-dev']);
    //   this.bowerInstall(['three.js'], { 'save': true });
    // };
  }
    
});

