// 
// generator-webvr-decorator
//  created 2015-11-03
//
// Add VR capability to a variety of base apps, for example 'angular' and 'webapp'
//

'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var jsonfile = require('jsonfile');
var util = require('util');
var merge = require('merge'), original, cloned;

module.exports = yeoman.generators.Base.extend({

  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.option('skipInstall');
  },
  
  initializing: function() {
    this.props = {};
    
    this.props.skipInstall = (this.options.skipInstall ? true : false);    
  },
  
  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the sweet ' + chalk.red('WebVrDecorator') + ' generator!'
    ));

    var prompts = [];
    
    // prompts.push( {
    //   type: 'input',
    //   name: 'appName',
    //   default: 'webvrapp',
    //   message: 'What is your app\'s name [webvrapp] ?'
    // });

    prompts.push( {
      type: 'confirm',      
      name: 'continue',
      default: 'true',
      message: 'Do you want to add webVR capability to this application ?'
    });
    
    this.prompt(prompts, function (answers) {
      this.props = answers;
      //this.appName = answers.appName;      

      if (!answers.continue) {
        console.log('Exiting install');
        return;
      }
      else {
        console.log('Continuing with install');
        done();
      }
      
    }.bind(this));
   
  },

  default: function () {    
    if (true) {

      this.composeWith('vr-base:sub-angular',{
        options: this.props
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
    
    if(!this.props.skipInstall) {
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
  }
  
});
