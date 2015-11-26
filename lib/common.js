'use strict';

var fs_node = require('fs');
var async = require('async');
// var cheerio = require('cheerio');
// var escope = require('escope');
// var esprima = require('esprima');
//var jquery = require('jquery');
//var jquery = require('jquery')(require("jsdom").jsdom().parentWindow);

exports.globals = {
  fileUpdatedTag : 'webvr-decorator-> file updated on: ',
};

exports.copyUserLibDir = function (srcDir, destDir) {  
  try {
    this.fs.copy(srcDir + '/*', destDir);
  }
  catch(err) {
    console.log('common.copyUserLibDir: caught error' + err.message);
  }
};

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

  newHtmlString = '';
  
  if (/.*<!-- webvr-decorator lib add -->.*/m.test(htmlString)) {
    // we've been here already
    console.log('common.registerLibHtml: skipping lib insert since this index.html has previously been processed by webvr-decorator');
  }
  else {
    regex = /^([\s\S]*<!-- endbower -->\n\s*<!-- endbuild -->\n)([\s\S]*$)/m;
    match = regex.exec(htmlString);

    newHtmlString = match[1];
    newHtmlString += '<!-- webvr-decorator lib add -->\n';
    
    for(var i = 0; i < libArray.length; i++) {
      newHtmlString += ('<script src="' + libArray[i] + '"></script>\n');
    };

    newHtmlString += '<!-- webvr-decorator lib end -->\n';
    newHtmlString += match[2];

    this.write(htmlPath, newHtmlString);
  }
  
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
  var readdir_cb = function (err, files) {
    if (err) {
      console.log('readdir_cb: err=' + err);      
    }
    
    var dirList = [];
    
    for(var i=0; i < files.length; i++) {
      dirList[i] = 'lib/' + files[i];
    };

    // and call the original client
    cb(err, dirList);
  };

  fs_node.readdir(dir, readdir_cb);
};

exports.doIt = function (filePath) {
  var fileContents = this.fs.read(filePath);

  return fileContents;
};

exports.doIt2 = function () {
  return this.config.name;
};

// comment out a section of code in a file.
// This is effectively a safe form of code removal.
// We parse the AST and pass each node to the
// 'removalFiler'.  If it returns true, we comment out that node
exports.commentOutCode = function(file, regex) {
  console.log('common.js: now in commentOutCode');

  var fileContents, match, regex, commentedCode;

  fileContents = this.fs.read(file);
  console.log('fileContents=', fileContents + '\n\n');

  // //var regex = /(.*)(\n^\s*return\s*\{)(.*)/m;
  // // note the $3 group is a hack, and is not very general, but it's the best I could do.
  // // I can't figure out to get it to gobble over multiple lines.
  // var regex = /(.*)(\n^\s*return\s*\{[^\}]*\})(\n.*\n.*$)/m;
  // //var regex = /(.*)(\n^\s*return\s*\{[^\}]*\})(\n^.*$)/m;
  // //console.log('commentOutCode: fileContents=', fileContents);
  // //var fileRegex = new RegExp('\\(.*\\)' + '\\(' + regex + '\\)'  + '\\(.*\\)', 'm');
  // //var fileRegex = new RegExp('\\(.*\\)' + '\\(' + regex + '\\)'  + '\\(.*\\)', 'm');
  // //var match = fileRegex.exec(fileContents);
  // //var match = fileContents.match(fileRegex);
  // //var match = fileContents.match(regex);
  // //var match = fileContents.match(/return/);
  // //var match = "abc-def-ghi".match(/(abc)-(def)-(ghi)/);
  // //var match = "abc-def-ghi".match(/(def)/);
  // match = fileContents.match(regex);

  // //console.log('match=', match);
  // console.log('match.length=', match.length);
  // console.log('$0=', match[0]);
  // console.log('$1=', match[1]);
  // console.log('$2=', match[2]);
  // console.log('$3=', match[3]);
  // // console.log('$2=', $2);
  // // console.log('$3=', $3);

  // var commentedCode = match[2];
  
  // //commentedCode = commentedCode.replace(/\n^/gm, '\nxx');
  // commentedCode = commentedCode.replace(/^/gm, '//');

  // console.log('commentedcode=' + commentedCode);

  //var commentedCode2 = fileContents.replace(/\n^\s*return\s*\{[^\}]*\}/gm, "//$1");
  //regex = /(\n^\s*return\s*\{[^\}]*\})/m;
  regex = /(^\s*return\s*\{[^\}]*\})/m;
  match = fileContents.match(regex);

  console.log('match[1]=' + match[1]);

  // foreach(match[1].split('\n')) {

  // };
  var splitArray = match[1].split('\n');

  commentedCode = '';
  
  for(var i =0; i < splitArray.length; i++) {
    //console.log('splitArray ' + i + '=' + splitArray[i]);
    commentedCode += '//' + splitArray[i] + '\n';
  }
  console.log('commentedcode2=' + commentedCode);

  var newFileContents = fileContents.replace(regex, commentedCode);

  console.log('newFilecontents=', newFileContents);
};

// exports.commentOutCode = function(file, filter) {
//   console.log('common.js: now in commentOutCode');

//   var fileContents, ast, globalScope, scopes;

//   fileContents = this.fs.read(file);
  
//   console.log('commentOutCode: fileContents=', fileContents);

//   //$ = cheerio.load(this.fs.read(htmlPath));
//   // var ast = esprima.parse('var answer = 42');
  

//   // console.log('commentOutCode: ast=', ast);
//   // console.log(JSON.stringify(esprima.parse(fileContents), null, 4));

//   ast = esprima.parse(fileContents);
//   globalScope = escope.analyze(ast).scopes[0];

//   scopes = escope.analyze(ast).scopes;
//  //   console.log(scopes);
//   //console.log('scopes.length=', scopes.length);

//   for(var i = 0; i < scopes.length; i++) {
//     console.log('scope ' + i + '=', scopes[i]);
//   };
  
  
// };
