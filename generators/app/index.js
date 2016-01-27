// 
// generator-webvr-decorator
//  created 2015-11-03
//
// Add VR capability to a variety of base apps, for example 'angular' and 'webapp'
//

'use strict';

var _ = require('lodash');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var jsonfile = require('jsonfile');
var util = require('util');
var merge = require('merge'), original, cloned;
var inquirer = require('inquirer');
var events = require('events');
var eventEmitter = new events.EventEmitter();

// helper methods go here
var AppBase = yeoman.generators.Base.extend({

});

// mixin common class
_.extend(AppBase.prototype, require('../../lib/common.js'));

module.exports = AppBase.extend({

  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.option('skipinstall');
  },
  
  initializing: function() {
    this.props = {};
    this.props = this.options;
    
    this.props.skipinstall = (this.options.skipinstall ? true : false);    

    this.props.userNames = {};
    // ctrls
    this.props.userNames.ctrls = {};
    this.props.userNames.ctrls.main = 'main';
    //services
    this.props.userNames.services = {};
    this.props.userNames.services.main = 'main';
    this.props.userNames.services.base = 'base';
    this.props.userNames.services.utils = 'utils';
    // directives
    this.props.userNames.directives = {};
    this.props.userNames.directives.canvasKeys = 'canvasKeys';
  },
  
  prompting:  {
    initialPrompt: function () {
      // Have Yeoman greet the user.
      this.log(yosay(
        'Welcome to the ' + chalk.red('webvr-decorator') + ' generator!'
      ));

      this.log(chalk.magenta('This generator will add WebVR capability to a previously installed angular app.\n\n'));
      this.log(chalk.magenta('We will add several artifacts in the form of an MVC resource: one controller, three services, and one directive.'));
      this.log(chalk.magenta('Please specify artifact names in ' + chalk.white('camelCase.') + '\n'));
      var prompts = [];
      var done = this.async();
      
      prompts.push( {
        type: 'checkbox',
        name: 'artifactsToRename',
        message: 'please specify any artifact name you wish to override, or just press ENTER to accept the defaults:',
        choices: [
          {
            value: new inquirer.Separator("--- controllers ---")
          },
          {
            value: 'mainCtrl',
            name: this.globals.MAIN_CTRL,
            checked: false
          },
          {
            value: new inquirer.Separator("--- services ---")
          },
          {
            value: 'mainService',
            name: this.globals.MAIN_SERVICE,
            checked: false
          },
          {
            value: 'baseService',
            name: this.globals.BASE_SERVICE,
            checked: false
          },
          {
            value: 'utilsService',
            name: this.globals.UTILS_SERVICE,
            checked: false
          },
          {
            value: new inquirer.Separator("--- directives ---")
          },
          {
            value: 'canvasKeysDirective',
            name: this.globals.CANVAS_KEYS_DIRECTIVE,
            checked: false
          },
        ]
      });

      this.prompt(prompts, function (answers) {
        this.artifactsToRename = answers.artifactsToRename;
        
        done();
      }.bind(this));
    },           
    
    renameArtifactsPrompt: function() {
      var done = this.async();
      
      var prompts = [];
      
      for (var i =0; i < this.artifactsToRename.length; i++) {
        var val = this.artifactsToRename[i];

        if (typeof(val) !== 'string') {
          // skip the separator lines if they are selected
          continue;
        }; 

        var type;

        if (/ctrl$/i.exec(val)){
          type = 'ctrl';
        }
        else if (/service$/i.exec(val)){
          type = 'service';
        }
        else if (/directive$/i.exec(val)){
          type = 'directive';
        }

        prompts.push( {
          type: 'input',
          name: val,
          message: 'new name for ' + this.globals.artifactNameLookup[val] + ' ' + type + ':',
        });

      };

      prompts.push( {
        type: 'confirm',      
        name: 'continue',
        default: 'true',
        message: 'We will now add webVR capability to this application. Do you wish to continue?'
      });

      this.prompt(prompts, function(answers) {
        this.userNames = {};
        this.userNames.services = {};
        this.userNames.ctrls = {};
        
        Object.keys(answers).forEach(function (key, index, array){
          switch(key) {
          case 'mainCtrl':
            //this.userNames.controllers.mainController = answers.mainController;
            this.props.userNames.ctrls.main = answers.mainCtrl;
            break;
          case 'mainService':
            //this.userNames.services.mainService = answers.mainService;
            this.props.userNames.services.main = answers.mainService;
            break;
          case 'baseService':
            //this.artifacts.services.base = props.baseService;
            this.props.userNames.services.base = answers.baseService;
            break;
          case 'utilsService':
            //this.artifacts.services.utils = props.utilsService;
            this.props.userNames.services.utils = answers.utilsService;
            break;
          case 'custCtrl':
            //this.artifacts.controllers.cust = props.custController;
            this.props.userNames.services.cust = answers.custService;
            break;
          case 'canvasKeysDirective':
            //this.artifacts.directives.canvasKeys = props.canvasKeysDirective;
            this.props.userNames.directives.canvasKeys = answers.canvasKeysDirective;
            break;
          default:
            this.log('switch: found unknown key:' + key);
          }

        }.bind(this));
        
        if(!answers.continue) {
          this.log('\nNow terminating installation due to user request');
          process.exit();
        };
        done();
      }.bind(this));
    },
  },
  
  
  default: function () {    
    if (!this.options.unitTestRun) {

      this.composeWith('webvr:sub-angular',{
        options: this.props,
      },
                       {
                         local: require.resolve('../sub-angular')
                       });
    }    
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
    // the vr-decoorator in one fell swoop, and it's easist to just surgically add them here.
    // Note: the official three.js bower lib is 'threejs' (no period).  There *is*
    // a 'three.js' bower, but it's not the official and does not include other
    // artifacts like examples.  Thus we want 'threejs' and not 'three.js'.  Even if
    // they have 'three.js', we need the full 'threejs' install.
    
    if(!this.options.skipInstall) {
      // first read the existing bower.json and see what's already installed
      var tgtJson = jsonfile.readFileSync(this.destinationPath('bower.json'));
      
      // threejs needs to go first since a lot of other modules are dependent on it.
      this.log('app.install: now installing threejs');
      if(!tgtJson.dependencies['threejs']) {
        this.log('app.install: now installing threejs');
        
        this.bowerInstall(['threejs'], { 'save': true });        
      };      

      this.log('app.install: now installing webvr-boilerplate');
      if(!tgtJson.dependencies['webvr-boilerplate']) {
        this.log('app.install: now installing webvr-boilerplate');
        
        this.bowerInstall(['webvr-boilerplate'], { 'save': true });        
      };

    };
    eventEmitter.emit('end');
  },
  
  end: function () {
    this.log('webvr-decorator: all done');
  }
});
