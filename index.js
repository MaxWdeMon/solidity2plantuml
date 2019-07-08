/* eslint-disable no-console */
"use strict";
const fs = require("fs");
const solidity2plantuml = require("./sol2uml.js");
const sep = require("path").sep;
function makePathAbsolute(path){
	if(path.startsWith("." + sep)){
		path = process.cwd() + path.slice(1);
	}else if (path == "."){
		path = process.cwd();
	}else if (!path.startsWith(sep)){
		path = process.cwd() + sep + path;
	}
	return path;
}

function sol2umlFolder(sol2umlObj, path = ".", showFilenameAsPackage = false){
	path = makePathAbsolute(path);
	if(fs.statSync(path).isDirectory()){
		var dir = fs.readdirSync(path);
		for(var f in dir){
			sol2umlFolder(sol2umlObj, path + sep + dir[f], showFilenameAsPackage);
		}
	}else if(path.endsWith(".sol")){
		var p = showFilenameAsPackage?path.split(sep).pop():"";
		var file = fs.readFileSync(path, "utf8");
		sol2umlObj.importSolidity(file, p);
	}
}

function sol2umlInheritance(sol2umlObj, path = ".", showFilenameAsPackage = false ){
	path = makePathAbsolute(path);
	if(path.endsWith(".sol")){
		var packageName = showFilenameAsPackage?path.split(sep).pop():"";
		var file = fs.readFileSync(path, "utf8");
		// eslint-disable-next-line no-console
		sol2umlObj.importSolidity(file, packageName);
		var importDirectives = sol2umlObj.collectImportDirectives(file, path);
		var importDirectivesIter = Object.keys(importDirectives);
		for(var i in importDirectivesIter){
			if(!importDirectivesIter[i].startsWith("http")){
				sol2umlInheritance(sol2umlObj, importDirectivesIter[i], showFilenameAsPackage);
			}
		}
	}
	else
	{
		sol2umlFolder(sol2umlObj, path,showFilenameAsPackage);
	}
}

function sol2umlFromString(solidityCode, packageName = ""){
	var s2u = new solidity2plantuml.Sol2UML();
	s2u.importSolidity(solidityCode, packageName);
	return s2u.toString();
}

module.exports = {sol2umlFolder: sol2umlFolder, sol2umlInheritance: sol2umlInheritance, sol2umlFromString: sol2umlFromString};