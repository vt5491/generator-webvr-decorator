'use strict';

var fs_node = require('fs');
var async = require('async');

exports.globals = {
  fileUpdatedTag : 'webvr-decorator-> file updated on: ',
  CODE_COMMENTED_BEGIN_TAG : 'webvr-decorator-> code commented out on: ',
  CODE_COMMENTED_END_TAG : 'webvr-decorator-> end code commenting',
  //vt add
  MAIN_SERVICE : 'main', 

  //vt end
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
  var htmlString, regex, match, newHtmlString;
  htmlString = this.read(htmlPath);  

  newHtmlString = '';
  
  if (/.*<!-- webvr-decorator lib add -->.*/m.test(htmlString)) {
    // we've been here already
    this.log('common.registerLibHtml: skipping lib insert since this index.html has previously been processed by webvr-decorator');
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
    
    if (files) {
      for(var i=0; i < files.length; i++) {
        dirList[i] = 'lib/' + files[i];
      };
    }

    // and call the original client
    cb(err, dirList);
  };

  if (fs_node.existsSync(dir)) {
    fs_node.readdir(dir, readdir_cb);
  }
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
  var fileContents, match;  
  var commentedCode;

  fileContents = this.fs.read(file);
  
  match = fileContents.match(regex);

  if(match) {
    var splitArray = match[1].split('\n');

    commentedCode = '';

    var ts = new Date().toLocaleString();

    // add a commented out tag and timestamp
    commentedCode += '//' + this.globals.CODE_COMMENTED_BEGIN_TAG + ts + '\n';  
    
    for(var i =0; i < splitArray.length; i++) {      
      commentedCode += '//' + splitArray[i] + '\n';
    }
    
    // add a commented out closing tag
    commentedCode += '//' + this.globals.CODE_COMMENTED_END_TAG + '\n';
    
    var newFileContents = fileContents.replace(regex, commentedCode);
    
    // and write the updated file back out
    this.fs.write(file, newFileContents);    
  }
};

