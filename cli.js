#!/usr/local/bin/node
/* eslint-disable no-console */
"use strict";
const sol2uml = require("solidity2plantuml/sol2uml.js");
const main = require("solidity2plantuml/index.js");

function sol2umlCLI(){
	var s2u = new sol2uml.Sol2UML(); 
	if(process.argv.length == 2) {
		main.sol2umlFolder(s2u);
		console.log(s2u.toString());
	}else if(process.argv.length == 3){
		if(process.argv[2].endsWith("help")||process.argv[2] == "-h"){
			// eslint-disable-next-line no-console
			console.log("node sol2umlCLI [/path/to/somefile.sol]");
			console.log("node sol2umlCLI [/path/to/folder/containing/solidityfiles]");
			console.log("If you provide a file as an argument the converter will trace all import directives. \nIf you provide a folder all files in the folder will be processed.")
		}else{
			main.sol2umlInheritance(s2u, process.argv[2], true);
			console.log(s2u.toString());
		}
	}else if(process.argv.length == 4){
		// eslint-disable-next-line no-extra-semi
		; //add functionality to create packages for each file
	}
}

sol2umlCLI();
