// 
// generator-vr-decorator
//  created 2015-11-03
//
// Add VR capability to a variety of base apps, for example 'angular' and 'webapp'
//

'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.generators.Base.extend({
  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the sweet ' + chalk.red('VrDecorator') + ' generator!'
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
      default: 'vrapp',
      message: 'What is your app\'s name [vrapp] ?'
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
});
