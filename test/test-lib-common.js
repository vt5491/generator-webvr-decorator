//
// test-lib-common
//
// unit test for the common library 'common.js' under the ROOT_DIR/libs
// Note: this is a Node module, not a generator.
//
// created 2015-11-05
//
'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var generators = require('yeoman-generator').generators;
var common = require('../lib/common.js');
var fs_node = require('fs');
var async = require('async');

// helper test methods
// these may be called by unit tests for modules that mixin in the common lib
var  _writeDummyIndexHtml = function (str, gen) {    
  var dummyHtml = '<!doctype html>\n' +
        '<html class="no-js">\n' +
        '<head>\n' +
        '</head>\n' +
        '<body ng-app="yoAngularVirginApp">\n' +
        '<!-- endbower -->\n' +
        '<!-- endbuild -->\n' +
        '</body>\n' +
        '</html>\n';

  str = str || dummyHtml;
  
  gen.fs.write(gen.destinationPath('app/index.html'), str);
};

exports.writeDummyIndexHtml = _writeDummyIndexHtml;

describe('common lib', function () {

  // We test the common mixin class by mixing into various generators.
  // In this particular case we use the 'sub-angular' subgenerator, since at this
  // time of this writing that is the only sub-generator available.  But we should also
  // be able to mix into any other future generators if we so desire.
  var subAngularGenerator;
  // define a shorter alias name
  var SAGen; 
  
  beforeEach(function (done) {
    subAngularGenerator = helpers.createGenerator('webvr-decorator:sub-angular', [
      path.join(__dirname, '../generators/sub-angular')
      ],
      null,
     { appName: 'testapp',
     }
    );

    // alias subAngularGenerator to a simpler name
    SAGen = subAngularGenerator;

    subAngularGenerator.fs.write('file.txt', '//dummy-line\n  });\n');

    var dummyHtml = '<!doctype html>\n' +
      '<html class="no-js">\n' +
      '<head>\n' +
      '</head>\n' +
      '<body ng-app="yoAngularVirginApp">\n' +
      '<!-- endbower -->\n' +
      '<!-- endbuild -->\n' +
      '</body>\n' +
      '</html>\n';
        
    _writeDummyIndexHtml(dummyHtml, SAGen);

    done();
  });

  it('registerLibsHtml works', function () {
    var result, htmlPath, libArray, regex;

    htmlPath = SAGen.destinationPath('app/index.html');
    libArray = [
      'lib/VRControls.js',
      'lib/VREffect.js',
    ];
        
    SAGen.registerLibsHtml(htmlPath, libArray);

    result = SAGen.read(htmlPath);    

    // make sure the libs are deliminted
    regex = /<!-- webvr-decorator lib add -->/m;
    assert(regex.test(result));

    regex = /<!-- webvr-decorator lib end -->/m;
    assert(regex.test(result));

    // make sure the libs are there
    regex = /\<script src="lib\/VRControls\.js"><\/script>/m;
    assert(regex.test(result));

    regex = /\<script src="lib\/VREffect\.js"><\/script>/m;
    assert(regex.test(result));
  });

  it('registerLibsHtml is idempotent', function () {    
    // write a new index.html which has the webvr-decorator tag
    var dummyHtml = '<!doctype html>\n' +
      '<html class="no-js">\n' +
      '<head>\n' +
      '</head>\n' +
      '<body ng-app="yoAngularVirginApp">\n' +
      '<!-- endbower -->\n' +
      '<!-- endbuild -->\n' +
      '<!-- webvr-decorator lib add -->\n' +
      '</body>\n' +
      '</html>\n';    

    _writeDummyIndexHtml(dummyHtml, SAGen);

    var result, htmlPath, libArray, regex;

    htmlPath = SAGen.destinationPath('app/index.html');
    
    libArray = [
      'lib/VRControls.js',
      'lib/VREffect.js',
    ];
    
    SAGen.registerLibsHtml(htmlPath, libArray);

    result = SAGen.read(htmlPath);    
    
    // make sure the libs are *not* there
    regex = /\<script src="lib\/VRControls\.js"><\/script>/m;
    assert(!regex.test(result));

    regex = /\<script src="lib\/VREffect\.js"><\/script>/m;
    assert(!regex.test(result));
    
  });
     
  it('getLibList returns all files in a given directory', function (done) {
    var dir;
    var dirList;
    
    dir = subAngularGenerator.templatePath('../../common/lib/');

    var readdir_cb = function (err, files) {
      if (err) {
        console.log('readdir_db: err=' + err);
        return;
      }
    };

    subAngularGenerator.getLibList(dir, function (err, dirList) {      
      assert.equal(typeof dirList, 'object' );
      
      done();
    });    
  });

  it('getFileListSync works', function (done) {
    var fileList;
    var dir = subAngularGenerator.templatePath('../../common/lib/');
    
    fileList = common.getFileListSync(dir);

    done();
  });
  
  it('doIt2 works', function () {    
    var result = subAngularGenerator.doIt2();

    assert.equal(result, 'generator-webvr-decorator');
  });

  it('doIt works', function () {    
    var result = subAngularGenerator.doIt( 'file.txt');

    assert(/dummy-line/.test(result));
  });

  it('commentOutCode properly comments out code given a regex', function () {
    // here we define a simple file where we want to comment out the lines of the
    //'return' statement
    var result = null;
    var file = 'commentOutCode.txt';
    var fileContents =
    "'use strict';\n\n" +
    "angular.module('yoAngularVirginApp')" +
    ".directive('canvasKeys', function ( $document, $rootScope, main, base) {\n" +
    "return {\n" +
    " template: '<div></div>',\n" +
    " restrict: 'E',\n" +
    " link: function postLink(scope, element, attrs) {\n" +
    "   element.text('this is the canvasKeys directive');\n" +
    " }\n " +
   "};\n" +
   "  });\n";
    
    subAngularGenerator.fs.write(file, fileContents);

    var regex = /(^\s*return\s*\{[^\}]*\}.*\n^.*\};)/m; //works
        
    subAngularGenerator.commentOutCode('commentOutCode.txt', regex);

    result = subAngularGenerator.fs.read(file, fileContents);

    // the return statement should be commented out
    assert(/^\/\/return/m.test(result));

    // there should also be a comment saying it was commented out
    // by 'webvr-decorator'
    var tagRegex = new RegExp('^\/\/' + '\\s*' + common.globals.CODE_COMMENTED_BEGIN_TAG, 'm');
    assert(tagRegex.test(result));
  });
  
});
