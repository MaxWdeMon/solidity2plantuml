/* eslint-disable no-console */
"use strict";
const fs = require("fs");
const solidity2plantuml = require("./sol2uml.js");


function sol2umlFolder(path = ".", showFilenameAsPackage = false, sol2uml ){
	if(fs.statSync(path).isDirectory()){
		var dir = fs.readdirSync(path);
		for(var f in dir){
			if(dir[f].slice(0,1) != "."){
				console.log(dir[f]);
			}
			sol2umlFolder(path + "/" + dir[f], showFilenameAsPackage, sol2uml);
		}
	}else if(path.endsWith(".sol")){
		var p = showFilenameAsPackage?path.split("/").pop():"";
		var file = fs.readFileSync(path, "utf8");
		sol2uml.importSolidity(file, p);
	}
}

function sol2umlInheritance(path = ".", showFilenameAsPackage = false, sol2uml ){
	if(path.endsWith(".sol")){
		var packageName = showFilenameAsPackage?path.split("/").pop():"";
		var file = fs.readFileSync(path, "utf8");
		// eslint-disable-next-line no-console
		sol2uml.importSolidity(file, packageName);
		var importDirectives = sol2uml.collectImportDirectives(file, path);
		var importDirectivesIter = Object.keys(importDirectives);
		for(var i in importDirectivesIter){
			if(!importDirectivesIter[i].startsWith("http")){
				sol2umlInheritance(importDirectivesIter[i], showFilenameAsPackage, sol2uml);
			}
		}
	}
	else
	{
		sol2umlFolder(path,showFilenameAsPackage, sol2uml);
	}
}

function sol2umlFromString(solidityCode, packageName = ""){
	var s2u = new solidity2plantuml.Sol2UML();
	s2u.importSolidity(solidityCode, packageName);
	return s2u.toString();
}

module.exports = {sol2umlFolder: sol2umlFolder, sol2umlInheritance: sol2umlInheritance, sol2umlFromString: sol2umlFromString};