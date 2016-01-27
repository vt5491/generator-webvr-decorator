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
    
    // ctrls
    // note: main ctrl is gen'd by the angular generator, so we need to be
    // careful to not re-generate it again.  We need it in this list, however, because
    // we will modify it.
    // we should be able to get rid of main ctrls once vrAppCtrl is worked out.
    this.defaultArtifactNames.mainCtrl = 'main'; 
    
    this.defaultArtifactNames.custCtrl = 'cust';

    // directives
    this.defaultArtifactNames.canvasKeysDirective = 'canvasKeys';
    
    this.artifacts = {};
    this.artifacts.services = {};
    this.artifacts.ctrls = {};
    this.artifacts.directives = {};
    
    // initialize service names
    this.artifacts.services.main = this.defaultArtifactNames.mainService;

    this.artifacts.services.base = this.defaultArtifactNames.baseService;
    this.artifacts.services.utils = this.defaultArtifactNames.utilsService;

    // initialize ctrl names
    this.artifacts.ctrls.main = this.defaultArtifactNames.mainCtrl;
    
    // initialize directive names
    this.artifacts.directives.canvasKeys = this.defaultArtifactNames.canvasKeysDirective;

    this.mainCtrl = this.options.userNames.ctrls.main + 'Ctrl';
    
    // angular controller class names are strange.  The first char only in intialized
    // and the rest is lower case.  Then you add a 'Ctrl' to then end.  Thus if your
    // controller name is 'myAbcDefApp', the class name would be 'MyabcdefappCtrl'.
    this.mainCtrlClass = this.options.userNames.ctrls.main.charAt(0).toUpperCase() + this.options.userNames.ctrls.main.slice(1).toLowerCase() + 'Ctrl';
  },

  initializing: function () {    
    this._initGlobals();

    return;
  },

  createAngularServices: function () {
    Object.keys(this.artifacts.services).forEach( function (key, index, array) {
      this.composeWith('angular:service',  {
        args: [ this.options.userNames.services[ this.artifacts.services[key] ]],
      } );
    }.bind(this));    
  },

  createAngularCtrls: function () {
    Object.keys(this.artifacts.ctrls).forEach( function (key, index, array) {      
      try {
        this.composeWith('angular:controller',  {args: [ this.options.userNames.ctrls[ key]]});
      }
      catch (e) {
        this.log('caught error ' + e + 'when calling composeWith-angular:controller');
      }
    }.bind(this));    
  },

  createAngularDirectives: function () {
    //directiveLoop:
    Object.keys(this.artifacts.directives).forEach( function (key, index, array) {      
      this.composeWith('angular:directive',  {args: [ this.options.userNames.directives[key] ]} ); 
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
            this.log('Will not inject dependency ' + dependencies[i] + ' because its already present');
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
      var filePath = this.destinationPath('app/scripts/services/' + this.options.userNames.services[ this.artifacts.services[key] ].toLowerCase() + '.js'); 

      this._markupFile(filePath);
    }.bind(this));
    
    // ctrls
    Object.keys(this.artifacts.ctrls).forEach( function (key, index, array) {
      var filePath = this.destinationPath('app/scripts/controllers/' + this.options.userNames.ctrls[this.artifacts.ctrls[key]].toLowerCase()  + '.js');
      this._markupFile(filePath);
    }.bind(this));

    // directives
    Object.keys(this.artifacts.directives).forEach( function (key, index, array) {
      var filePath = this.destinationPath('app/scripts/directives/' +  this.options.userNames.directives[this.artifacts.directives[key]].toLowerCase()  + '.js');
      
      this._markupFile(filePath);
    }.bind(this));
    
    // inject mainService into mainCtrl dependencies
    var controllerPath = this.destinationPath('app/scripts/controllers/' +  this.options.userNames.ctrls['main'].toLowerCase() + '.js');    
    
    this._injectDependencies(controllerPath, 'controller', [
      this.options.userNames.services['main'],
    ]);

    // services
    var servicePath = this.destinationPath('app/scripts/services/' +  this.options.userNames.services['main'].toLowerCase() + '.js');    
    
    this._injectDependencies(servicePath, 'service', [
      '$window',
      this.options.userNames.services['base'],
      this.options.userNames.services['utils'],]);
    
    // directives
    var directivePath = this.destinationPath('app/scripts/directives/' +
                                             this.options.userNames.directives['canvasKeys'].toLowerCase()  + '.js');
    
    this._injectDependencies(directivePath, 'directive', [
      '$document',
      '$rootScope',
      this.options.userNames.services.main,
      this.options.userNames.services.base]);

    // comment out the prior angular stub code    
    var regex = /(^\s*return\s*\{[^\}]*\}.*\n^.*\};)/m; 
    
    this.commentOutCode(directivePath, regex);
  },                                                 
  
  // inject partials into the template code
  partialsInjection: function () {

    Object.keys(this.artifacts.services).forEach( function (key, index, array) {
      var templatePath = this.destinationPath('app/scripts/services/' + this.options.userNames.services[ this.artifacts.services[key] ].toLowerCase()  + '.js');
      
      var partialsPath = this.templatePath('../partials/services/' +  this.artifacts.services[key] + '.js');

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

    Object.keys(this.artifacts.ctrls).forEach( function (key, index, array) {
      var templatePath = this.destinationPath('app/scripts/controllers/' + [ this.options.userNames.ctrls[ this.artifacts.ctrls[key]].toLowerCase() ] + '.js');
      var partialsPath = this.templatePath('../partials/controllers/' + [ this.artifacts.ctrls[key] ] + '.js');

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
      var templatePath = this.destinationPath('app/scripts/directives/' + [ this.options.userNames.directives[this.artifacts.directives[key]].toLowerCase() ] + '.js');
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
        // note: the three.min.js, webvr-polyfill.js, and webvr-manager.js were
        // originally commented out in the first release version.  I seem to have to
        // restore them now
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
                                              this.options.userNames.services[ this.artifacts.services[key] ].toLowerCase() + '.js' );

      var result = this.fs.read(templatePath);

      this.fs.copyTpl(
        templatePath,
        templatePath,
        {
          name: key,
          appName: this.options.appName,
          baseService: this.options.userNames.services.base
        }
      );
    }.bind(this));

    Object.keys(this.artifacts.ctrls).forEach( function (key, index, array) {
      var templatePath = this.destinationPath('app/scripts/controllers/' +
                                              //[ this.artifacts.ctrls[key] ] + '.js');
                                              [ this.options.userNames.ctrls[this.artifacts.ctrls[key]].toLowerCase() ] + '.js');
      
      this.fs.copyTpl(
        templatePath,
        templatePath, {
          name: key,
          appName: this.options.appName,
          mainService: this.options.userNames.services['main'],
        }
      );
    }.bind(this));

    Object.keys(this.artifacts.directives).forEach( function (key, index, array) {
      var templatePath = this.destinationPath('app/scripts/directives/' +
                                              [ this.options.userNames.directives[this.artifacts.directives[key]].toLowerCase() ] + '.js');
      
      this.fs.copyTpl(
        templatePath,
        templatePath, {
          name: key,
          appName: this.options.appName,
          mainService: this.options.userNames.services['main'],
          baseService: this.options.userNames.services['base']
        }
      );
    }.bind(this));
    
    // copy user libs here    
    var srcDir = this.templatePath('../../common/lib/');
    var destDir = this.destinationPath('app/lib/');

    //common.copyUserLibDir(srcDir, destDir, this);
    this.copyUserLibDir(srcDir, destDir, this);

    this.fs.copyTpl(
      this.templatePath('main.html'),
      this.destinationPath('app/views/' + this.options.userNames.ctrls.main.toLowerCase() + '.html'), {mainCtrlClass: this.mainCtrlClass}
    );
  },

  // If the user has specified a non-default controller name (e.g. 'main')
  // then update the route to have the new controller.
  //TODO: this is very similar to '_markupFile'. Consider generailizing and combining
  // TODO: this is the generalized version.  Rename and have _markupFile call this.
  //updateRoute: function (filePath, insertPointRegex, insertStanza) {
  _insertIntoFile: function (filePath, insertPointRegex, insertStanza) {
    
    var fileContents = this.fs.read(filePath);
    // loop over each line looking for our insert point
    var lines = _.map(fileContents.split('\n'));

    var accumulateLines = function(str) {
      var result = '';

      // look for closing bracket, and insert our tag before this
      if (insertPointRegex.test(str)) {
        result +=  insertStanza;   
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
  
  updateRoute: function ()  {
    // we only need to add a route if it's the controller is not the default 'main' (becuase
    // the vainilla angular app will already have a 'main' route)
    if (this.options.userNames.ctrls.main !== this.defaultArtifactNames.mainCtrl) {
      var result, fp, regex;
      
      fp = this.destinationPath('app/scripts/app.js');

      var routeStanza = [
        ".when('/" + this.options.userNames.ctrls.main + "', {",
        "templateUrl: 'views/" + this.options.userNames.ctrls.main.toLowerCase() + ".html'" + ',',
        "controller: '" + this.mainCtrlClass  + "',",
        "controllerAs: '" + this.options.userNames.ctrls.main + "'",
        "})",
      ].join('\n');

      var insertPointRegex = new RegExp("\.otherwise");

      this._insertIntoFile(fp, insertPointRegex, routeStanza);
    };
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
  },
  
  end: function () {
    this.log('sub-angular: all done');
  }
});

