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
  initializing: function() {
    this.props = {};
    this.props.skipInstall = true;
    //this.props.skipInstall = false;
  },
  
  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the sweet ' + chalk.red('WebVrDecorator') + ' generator!'
    ));

    // var prompts = [{
    //   type: 'confirm',
    //   name: 'someOption',
    //   message: 'Would you like to enable this option?',
    //   default: true
    // }];

    // this.prompt(prompts, function (props) {
    //   this.props = props;
    //   // To access props later use this.props.someOption;

    //   done();
    // }.bind(this));

    var prompts = [];
    
    prompts.push( {
      type: 'input',
      name: 'appName',
      default: 'webvrapp',
      message: 'What is your app\'s name [webvrapp] ?'
    });

    this.prompt(prompts, function (props) {
      this.props = props;
      this.appName = props.appName;

      done();
    }.bind(this));
   
  },

  default: function () {

    //TODO: Turns out, I don't think I need the appName for anything
    // this.appname = subGenerator.getAppName();
    // this.log('base.default: now installing sub-angular, this.artifacts=', this.artifacts);
    // this.log('base.default: appName=' + this.appName);
    //console.log('base.default: now installing sub-angular');
    //if (this.options.travis) {
    console.log('about to call sub-angular');
    if (true) {
      // var artifacts = {};
      // artifacts.services = {};

      // artifacts.services.main = 'main';
      // artifacts.services.base = 'base';

      this.composeWith('vr-base:sub-angular',{
        options: this.props
      },
       {
        local: require.resolve('../sub-angular')
      });
    }
    this.log('base.default: done installing sub-angular');
  },

  // writing: function () {
  //   //var file = '/tmp/data.json'
  //   console.log('now in app:writing');

  //   var srcJson = jsonfile.readFileSync(this.templatePath('_bower.json'));

  //   console.log('app: srcJson=',srcJson);
  //   console.log('app: srcJson.dependencies=',srcJson.dependencies);
  //   //console.log('app: srcJson.dependencies.length=',srcJson.dependencies.length);

  //   var tgtJson = jsonfile.readFileSync(this.destinationPath('bower.json'));

  //   console.log('app: tgtJson=',tgtJson);
  //   console.log('app: tgtJson.dependencies=',tgtJson.dependencies);

  //   // Try to create idempotency, by not re-adding if there signs we've been
  //   // here before.
  //   if(!tgtJson.dependencies['webvr-boilerplate']) {
  //     console.log('app: about to merge');
  //     var mergedDependencies = merge(tgtJson.dependencies, srcJson.dependencies);
      
  //     console.log('\n\napp: mergedDependencies=', mergedDependencies);

  //     tgtJson.dependencies = mergedDependencies;

  //     jsonfile.writeFileSync(this.destinationPath('bower.json'), tgtJson, {spaces: 2});
  //     console.log('\nwrote new file');

  //   }
    
  // },
  // writing: {
  //   app: function () {
  //     this.fs.copy(
  //       this.templatePath('_package.json'),
  //       this.destinationPath('package.json')
  //     );
  //     this.fs.copy(
  //       this.templatePath('_bower.json'),
  //       this.destinationPath('bower.json')
  //     );
  //   },

  //   projectfiles: function () {
  //     this.fs.copy(
  //       this.templatePath('editorconfig'),
  //       this.destinationPath('.editorconfig')
  //     );
  //     this.fs.copy(
  //       this.templatePath('jshintrc'),
  //       this.destinationPath('.jshintrc')
  //     );
  //   }
  // },

  // this interferes with the angular app install
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
    if(!this.props.skipInstall) {
      // first read the existing bower.json and see what's already installed
      var tgtJson = jsonfile.readFileSync(this.destinationPath('bower.json'));

      console.log('app: tgtJson=',tgtJson);
      console.log('app: tgtJson.dependencies=',tgtJson.dependencies);

      if(!tgtJson.dependencies['webvr-boilerplate']) {
        this.log('app.install: now installing webvr-boilerplate');
        
        this.bowerInstall(['webvr-boilerplate'], { 'save': true });        
      };

      // Note: the official three.js bower lib is 'threejs' (no period).  There *is*
      // a 'three.js' bower, but it's not the official and does not include other
      // artifacts like examples.  Thus we want 'threejs' and not 'three.js'.  Even if
      // they have 'three.js', we need the full 'threejs' install.
      //if(!(tgtJson.dependencies['threejs'] || tgtJson.dependencies['three.js'])) {
      // if(!tgtJson.dependencies['threejs']) {
      //   this.log('app.install: now installing threejs');
        
      //   this.bowerInstall(['threejs'], { 'save': true });        
      // };      
    };
  }
  
});
