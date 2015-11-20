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
  console.log('now in writeDummyIndexHtml');
  
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
  //gen.fs.write(gen.destinationPath('app/index.html'), dummyHtml);
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
    console.log('test-lib-common: now in beforeEach');
      
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

    // var srcRoot = subAngularGenerator.sourceRoot();
    // //var srcRoot = subAngularGenerator.templatePath();
    
    // subAngularGenerator.fs.write(path.join(srcRoot, 'generators/common/lib/VRControls.js'), '//dummy VRControls.js\n  });\n');
    // subAngularGenerator.fs.write(path.join(srcRoot, 'generators/common/lib/VREffect.js'), '//dummy VREffect.js\n  });\n');
    var dummyHtml = '<!doctype html>\n' +
      '<html class="no-js">\n' +
      '<head>\n' +
      '</head>\n' +
      '<body ng-app="yoAngularVirginApp">\n' +
      '<!-- endbower -->\n' +
      '<!-- endbuild -->\n' +
      '</body>\n' +
      '</html>\n';
    
    //SAGen.fs.write(SAGen.destinationPath('app/index.html'), dummyHtml);

    _writeDummyIndexHtml(dummyHtml, SAGen);

    // put some dummy files in common/lib
    // SAGen.fs.write(SAGen.templatePath('../../common/lib/') + 'VRControls.js', 'dummy');
    // SAGen.fs.write(SAGen.templatePath('../../common/lib/') + 'VREffect.js', 'dummy');

    // console.log('dummy file=' + '../../common/lib/'  + 'VRControls.js');
    done();
  });

  // it('copyUserLibDir works', function () {    
  //   //var srcPath = subAngularGenerator.destinationPath('generators/common/lib/VRControls.js');
  //   var srcDir, destDir, fileContents;
    
  //   //srcDir = subAngularGenerator.destinationPath('generators/common/lib/');
  //   console.log('sourceRoot (a)= ' + subAngularGenerator.sourceRoot());
  //   //srcDir = path.join(subAngularGenerator.sourceRoot(), 'generators/common/lib/');
  //   srcDir = subAngularGenerator.templatePath('../../common/lib/');
  //   //../../common/lib/
  //   console.log('sourceRoot (b)= ' + subAngularGenerator.sourceRoot());
  //   console.log('srcDir= ' + srcDir);
  //   //srcDir = subAngularGenerator.templatePath('generators/common/lib/');
  //   //var destPath = subAngularGenerator.destinationPath('app/lib/VRControls.js');
  //   destDir = subAngularGenerator.destinationPath('app/lib/');

  //   //common.copyUserLibDir(srcDir, destDir, subAngularGenerator);
  //   subAngularGenerator.copyUserLibDir(srcDir, destDir);
    
  //   //console.log('test-lib-common: libDir=' + libDir);

  //   fileContents = subAngularGenerator.fs.read(path.join(destDir, 'VRControls.js'));

  //   //console.log('test-lib-common: fc=' + fileContents);

  //   assert(typeof fileContents !== 'undefined');
  //   //assert(/dummy VRControls/.test(fileContents));

  //   //fileContents = subAngularGenerator.fs.read(destDir/VREffect.js);
  //   fileContents = subAngularGenerator.fs.read(path.join(destDir, 'VREffect.js'));

  //   //console.log('test-lib-common: fc=' + fileContents);

  //   assert(typeof fileContents !== 'undefined');
  //   //assert(/dummy VREffect/.test(fileContents));
    
  // });

  it('registerLibsHtml works', function () {
    var result, htmlPath, libArray, regex;

    htmlPath = SAGen.destinationPath('app/index.html');
    libArray = [
      'lib/VRControls.js',
      'lib/VREffect.js',
    ];
    // result = SAGen.read(SAGen.destinationPath(htmlPath));

    // console.log('ut.registerLibsHtml: result=', result);
    SAGen.registerLibsHtml(htmlPath, libArray);

    result = SAGen.read(htmlPath);
    console.log('ut.registerLibsHtml: result=' + result);

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
    //
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
    console.log('ut.registerLibsHtml.idempotent test: result=' + result);
    
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

    //console.log('test-lib-common.getFileList: fs=', subAngularGenerator.fs);
    //dirList = subAngularGenerator.fs.readdir(dir);
    //var done = this.async();
    
    var readdir_cb = function (err, files) {
      if (err) {
        console.log('readdir_db: err=' + err);
        return;
      }
      console.log('readdir_cb: files=', files);

      //done();
      // else {
        
      // }      
    };

    //var done2 = this.async();
    //dirList = fs_node.readdir(dir, readdir_cb);
    //dirList = fs_node.readdirSync(dir);
    //var dirlist = common.getFileListSync(dir);
    //var dirlist = common.getFileList(dir);

    //console.log('-->test-lib-common.getFileList: dirList=', dirList);
    // use async to synchronize the subgenerator steps
//    subgeneratorAll: function () {
      // try {
      //   //async.waterfall([
      //   async.series([
      //     function callMethod (cb) {
      //       //this._subgeneratorApp(cb);
      //       console.log('now in a');
      //       dirList = common.getFileList(dir);
      //       cb();
      //     },
      //     function testIt (cb) {
      //       //this._subgeneratorServices(cb);
      //       console.log('now in b');
      //       console.log('-->test-lib-common.getFileList: dirList=', dirList);

      //       cb();
      //       //done();
      //     },
      //     function theEnd (cb) {
      //       console.log('now in c');
      //       done();
      //     }
            

      //     //this._subgeneratorServices(callback),
      //     // this._subgeneratorControllers(),
      //     // this._subgeneratorDirectives()
      //   ]);
      // }
      // catch(e){
      //   console.log('subgeneratorAll: caught error ' + e);
      // };
//    },

    subAngularGenerator.getLibList(dir, function (err, dirList) {
      console.log('ut.dirList=', dirList);

      assert.equal(typeof dirList, 'object' );
      console.log('dirList.length=' + dirList.length) ;
      console.log('dirList[0]=' + dirList[0]) ;
      // assert.equal(dirList[0], 'lib/VRControls.js');
      // assert.equal(dirList[1], 'lib/VREffect.js');
      done();
    });
    //done();
  });

  it('getFileListSync works', function (done) {
    var fileList;
    var dir = subAngularGenerator.templatePath('../../common/lib/');
    
    fileList = common.getFileListSync(dir);

    console.log('ut.getFilelistSync: fileList=', fileList);

    done();
  });
  
  it('doIt2 works', function () {
    //var result = common.doIt2();
    var result = subAngularGenerator.doIt2();

    //assert.equal(result, 7);
    console.log('ut.doIt2: result=' + result);
    assert.equal(result, 'generator-webvr-decorator');
  });

  it('doIt works', function () {
    //var result = common.doIt(subAngularGenerator, 'file.txt');
    var result = subAngularGenerator.doIt( 'file.txt');

    assert(/dummy-line/.test(result));
  });
  
});
