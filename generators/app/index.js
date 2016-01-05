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
//vt add
var inquirer = require('inquirer');
//vt end

// helper methods go here
var AppBase = yeoman.generators.Base.extend({

});
// mixin common class
_.extend(AppBase.prototype, require('../../lib/common.js'));

//vtmodule.exports = yeoman.generators.base.extend({
//module.exports = yeoman.generators.Base.extend({
module.exports = AppBase.extend({

  constructor: function () {
    //vtyeoman.generators.base.apply(this, arguments);
    yeoman.generators.Base.apply(this, arguments);

    this.option('skipinstall');
  },
  
  initializing: function() {
    this.props = {};
    this.props = this.options;
    
    this.props.skipinstall = (this.options.skipinstall ? true : false);    
  },
  
  prompting:  {

      //var done = this.async();
    // Have Yeoman greet the user.
//    this.log(yosay(
//      'Welcome to the sweet ' + chalk.red('webvr-decorator') + ' generator!'
//    ));
//
//      // have yeoman greet the user.
//      this.log(yosay(
//        'welcome to the sweet 2' + chalk.red('webvrdecorator') + ' generator!'
//      ));
      initialPrompt: function () {
      var prompts = [];
      var done = this.async();
      
      // prompts.push( {
      //   type: 'input',
      //   name: 'appname',
      //   default: 'webvrapp',
      //   message: 'what is your app\'s name [webvrapp] ?'
      // });

//vt      prompts.push( {
//vt        type: 'confirm',      
//vt        name: 'continue',
//vt        default: 'true',
//vt        message: 'do you want to add webvr capability to this application ?'
//vt      });

    prompts.push( {
      type: 'confirm',      
      name: 'continue',
      default: 'true',
      message: 'Add webVR capability to this application ?'
    });

      prompts.push( {
        type: 'checkbox',
        name: 'artifactsToRename',
        message: 'please specify any name you wish to override:',
        choices: [
          {
            value: new inquirer.Separator("--- services ---")
          },
          {
            value: 'mainService',
            name: this.globals.MAIN_SERVICE,
            checked: false
          },
        ]
      });

      this.prompt(prompts, function (answers) {
        console.log('answers=', answers);
        console.log('answers=', answers);
        this.props = answers;
        console.log('this.props=', this.props);
        //this.appName = answers.appName;      
        //vt add
        this.props.userNames = {};
        this.props.userNames.services = {};
        this.props.userNames.services.main = 'main3';
        this.props.userNames.services.base = 'base';
        this.props.userNames.services.utils = 'utils';
        
        //this.artifactsToRename = props.artifactsToRename;
        this.artifactsToRename = answers.artifactsToRename;
        //vt-x start
        console.log('now calling done');
          done();
        console.log('now back from done');
        //vt-x end
        //vt end
        }.bind(this));

    
    // this.prompt(prompts, function (answers) {
    //   this.props = answers;
    //   //this.appName = answers.appName;      

    //   if (!answers.continue) {
    //     console.log('Exiting install');
    //     return;
    //   }
    //   else {
    //     console.log('Continuing with install');
    //     done();
    //   }
    // }.bind(this));
     },           
    //}
    renameArtifactsPrompt: function() {
      var done = this.async();
      
      var prompts = [];
      
      this.artifactsToRename.forEach(function (val, index, array) {
      //for (var i =0; i < this.artifactsToRename.length; i++) {
        //debugger;
        prompts.push( {
          type: 'input',
          //name: 'userNames',
          name: val,
          //message: 'new name for ' + val + ' (current: ' this.defaultArtifactNames[val] + '):'
          //message: 'new name for ' + this.defaultArtifactNames[val]
          message: 'new name for ' + this.globals.MAIN_SERVICE + ' service:',
        });
       }.bind(this));//.(this));
      //};      this.prompt(prompts, function(props) {
      this.prompt(prompts, function(answers) {
        this.userNames = {};
        this.userNames.services = {};
        
        Object.keys(answers).forEach(function (key, index, array){
          switch(key) {
          case 'mainService':
            this.userNames.services.mainService = answers.mainService;
            this.props.userNames.services.main = answers.mainService;
            break;
          // case 'baseService':
          //   this.artifacts.services.base = props.baseService;
          //   break;
          // case 'utilsService':
          //   this.artifacts.services.utils = props.utilsService;
          //   break;
          // case 'custController':
          //   this.artifacts.controllers.cust = props.custController;
          //   break;
          // case 'canvasKeysDirective':
          //   this.artifacts.directives.canvasKeys = props.canvasKeysDirective;
          //   break;
          default:
            this.log('switch: found unknown key:' + key);
          }

        }.bind(this));
        
        done();
       }.bind(this));
    // },
     },
      },
      
      
  default: function () {    
    console.log('app:this.artifactsToRename=', this.artifactsToRename);
    console.log('app:this.userNames=', this.userNames);
    console.log('app:default: props=', this.props);
    //this.props.userNames = {};
    //this.props.userNames = this.userNames;
    if (true) {

      this.composeWith('vr-base:sub-angular',{
        options: this.props,
        //options: this.userNames,
        //userNames: this.userNames,
        //userNames: this.props,
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
    // the vr-decoorator in swoop, and it's easist to just surgically add them here.
    // Note: the official three.js bower lib is 'threejs' (no period).  There *is*
    // a 'three.js' bower, but it's not the official and does not include other
    // artifacts like examples.  Thus we want 'threejs' and not 'three.js'.  Even if
    // they have 'three.js', we need the full 'threejs' install.
    //if(!(tgtJson.dependencies['threejs'] || tgtJson.dependencies['three.js'])) {
    
    if(!this.options.skipInstall) {
      // first read the existing bower.json and see what's already installed
      var tgtJson = jsonfile.readFileSync(this.destinationPath('bower.json'));
      
      // threejs needs to go first since a lot of other modules are dependent on it.
      if(!tgtJson.dependencies['threejs']) {
        this.log('app.install: now installing threejs');
        
        this.bowerInstall(['threejs'], { 'save': true });        
      };      

      if(!tgtJson.dependencies['webvr-boilerplate']) {
        this.log('app.install: now installing webvr-boilerplate');
        
        this.bowerInstall(['webvr-boilerplate'], { 'save': true });        
      };

    };
  },
 
  end: function () {
    this.log('webvr-decorator: all done');
  }
});
