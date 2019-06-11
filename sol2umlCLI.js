'use strict';
const fs = require("fs");
const solidity2plantuml = require("./index.js");




function sol2umlFolder(path = ".", showFilenameAsPackage = false ){
	if(fs.statSync(path).isDirectory()){
		var dir = fs.readdirSync(path);
		for(var f in dir){
			if(dir[f].slice(0,1) != ".")
				sol2umlFolder(path + "/" + dir[f]);
		}
	}else if(path.endsWith(".sol")){
		// var p = path.replace("/Volumes/DOCS/deveth/2Solidity/oz/openzeppelin-solidity/contracts/","");
		var startDecorator = showFilenameAsPackage?`package ${filename} {
			`:"";
		var endDecorator = showFilenameAsPackage?"\n}":"";
		var file = fs.readFileSync(path, "utf8");
		console.log(solidity2plantuml(file, startDecorator, endDecorator)); 
		// future version should display files as packages e.g.: solidity2plantuml(file, "", "\n}" ));
	}
}
// sol2umlFolder("/Volumes/DOCS/deveth/2Solidity/oz/openzeppelin-solidity/contracts/access/");





function sol2umlCLI(){
	if(process.argv.length == 2) {  
		sol2umlFolder();
	}else if(process.argv.length == 3){
		if(process.argv[2].endsWith("help")||process.argv[2] == "-h"){
			console.log("node sol2umlCLI [/path/to/folder/containing/somefiles.sol]");
		}else{
			sol2umlFolder(process.argv[2]);
		}
	}else if(process.argv.length == 4){
;
	}
}
sol2umlCLI();

module.exports = {sol2umlFolder: sol2umlFolder, sol2umlCLI: sol2umlCLI};