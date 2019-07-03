"use strict";
const fs = require("fs");
const solidity2plantuml = require("./index.js");




function sol2umlFolder(path = ".", showFilenameAsPackage = false, sol2uml ){
	if(fs.statSync(path).isDirectory()){
		var dir = fs.readdirSync(path);
		for(var f in dir){
			if(dir[f].slice(0,1) != ".")
				console.log(dir[f]);
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
}




function sol2umlCLI(){
	if(process.argv.length == 2) {  
		sol2umlFolder();
	}else if(process.argv.length == 3){
		if(process.argv[2].endsWith("help")||process.argv[2] == "-h"){
			// eslint-disable-next-line no-console
			console.log("node sol2umlCLI [/path/to/somefile.sol]");
			console.log("node sol2umlCLI [/path/to/folder/containing/somefiles.sol]");
			console.log("If you provide a file as an argument the converter will trace all import directives. If you provide a folder all files in the folder will be processed.")
		}else{
			var s2u = new solidity2plantuml.Sol2UML();
			sol2umlInheritance(process.argv[2], true, s2u);
			console.log(s2u.toString());
		}
	}else if(process.argv.length == 4){
		// eslint-disable-next-line no-extra-semi
		; //add functionality to create packages for each file
	}
}

sol2umlCLI();

module.exports = {sol2umlFolder: sol2umlFolder, sol2umlCLI: sol2umlCLI};