'use strict';

var fs_node = require('fs');
var async = require('async');
var cheerio = require('cheerio');
//var jquery = require('jquery');
//var jquery = require('jquery')(require("jsdom").jsdom().parentWindow);

exports.globals = {
  fileUpdatedTag : 'webvr-decorator-> file updated on: ',
};

//exports.copyUserLibDir = function (srcDir, destDir, gen) {
exports.copyUserLibDir = function (srcDir, destDir) {
  //console.log('common.copyUserLibmodules: destinationDir=' + gen.destinationDir());
  try {
    this.fs.copy(srcDir + '/*', destDir);
  }
  catch(err) {
    console.log('common.copyUserLibDir: caught error' + err.message);
  }
};

    // var dummyHtml = '<!doctype html>' +
    //   '<html class="no-js">' +
    //   '<head>' +
    //   '</head>' +
    //   '<body ng-app="yoAngularVirginApp">' +
    //   '<!-- endbower -->' +
    //   '<!-- endbuild -->' +
    //   '</body>' +
    //   '</html>';

    // <!-- manual add -->
    // <script src="bower_components/three.js/three.js"></script>
    // <script src="lib/VRControls.js"></script>
    // <script src="lib/VREffect.js"></script>
    // <script src="lib/webvr-manager.js"></script>
    // <script src="lib/webvr-polyfill.js"></script>
    // <script src="lib/stats.min.js"></script>
    // <script src="lib/dat.gui.js"></script>
    // <!--end manual add -->

// exports.updateIndexHtml = function (destPath, injection) {

// };

// register js libs in the index.html
exports.registerLibsHtml = function (htmlPath, libArray) {
  //cherio.load(fs.readFileSync('path/to/file.html'));
  //var $ = cheerio.load(this.fs.read(htmlPath));
  // //console.log('registerLibsHtml: element=', $('html').html());
  // var tmp = $('body:first');
  // console.log('typeof tmp=' + typeof tmp);
  // console.log('tmp.html()=', tmp.html());
  // console.log('registerLibsHtml: element=', $('.no.js').html());
  // console.log('$("body").html()=' + $("body").html());
  // var content = $('body').html();
  // var tmpArray = content.match(/<!--.*?-->/g);
  // console.log('tmpArray=', tmpArray);
  var htmlString, regex, match, newHtmlString;
  htmlString = this.read(htmlPath);

  regex = /^([\s\S]*<!-- endbower -->\n\s*<!-- endbuild -->\n)([\s\S]*$)/m;
  match = regex.exec(htmlString);

  //console.log('$1=' + match[1]);
  //console.log('$2=' + match[2]);
  //newHtmlString = match[1] + "new line 1\n" + "new line 2\n" + match[2];
  newHtmlString = match[1];
  newHtmlString += '<!-- webvr-decorator lib add -->\n';
  
  for(var i = 0; i < libArray.length; i++) {
    newHtmlString += ('<script src="' + libArray[i] + '"></script>\n');
  };

  newHtmlString += '<!-- webvr-decorator lib end -->\n';
  newHtmlString += match[2];

  console.log('newHtmlString=' + newHtmlString);

  console.log('would write newHtmlString to file:' +  htmlPath);
  this.write(htmlPath, newHtmlString);
  
  return newHtmlString;
};

// Return a list of all the file names in a dir
exports.getFileListSync = function (dir) {
  var dirList = fs_node.readdirSync(dir);

  return dirList;
};

// Since we want the lib paths to be relative to the destintionPath,
// this is essentially just a special case of 'readdir'.  We can't rely on
// client doing their own 'readdir' as they need to make sure the paths are
// indeed relative to the destinationPath.  Thus we promote this to a full method.
exports.getLibList = function (dir, cb) {
  //var callback_ = arguments[arguments.length - 1];
  //var dirList;

  //var done = this.async();
  var readdir_cb = function (err, files) {
    if (err) {
      console.log('readdir_cb: err=' + err);
      //return;
    }
    console.log('getFileList.readdir_cb: files=', files);

    //return files;
    //dirList = files;
    var dirList = [];
    
    for(var i=0; i < files.length; i++) {
      dirList[i] = 'lib/' + files[i];
    };

    // and call the original client
    cb(err, dirList);
    //done();
    // else {
    
    // }      
  };

  fs_node.readdir(dir, readdir_cb);
  //fs_node.readdir(dir, cb);

  //return dirList;
  
  
  //typeof cb === 'function' && cb();
};

//exports.doIt = function (gen, filePath) {
exports.doIt = function (filePath) {
  //console.log('common: controllers.main=' + gen.artifacts.controllers.main);

  //return gen.artifacts.controllers.main;
  //return 7;
  var fileContents = this.fs.read(filePath);

  return fileContents;
};

exports.doIt2 = function () {
  //return 7;

  //return this.defaultArtifactNames.utilsService;
  //console.log('common.doIt2: this=', this);
  return this.config.name;
};
