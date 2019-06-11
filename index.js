// import { parse, ParserError } from "solidity-parser-antlr"
const parse = require("solidity-parser-antlr");

let associations = {};
let inheritance = [];
let structs = [];
let classInformation = {};
function extractBaseContracts (contract) {
	if (contract.type !== "ContractDefinition") { throw new Error("trying to parse something that is not a contract, but rather type: " + typeof contract); }
	if (contract.baseContracts.length < 1) {
		return "";
	}
	var name = contract.name;
	for (var baseC of contract.baseContracts) {
		inheritance.push(baseC.baseName.namePath + " <|-- " + name);
	}
	return inheritance.reduce(function (t, v) { return t + "\n" + v; });
}

function extractFunctionsAndVariables (contract) {
	associations = [];
	inheritance = [];
	structs = [];
	classInformation = {};
	if (contract.type !== "ContractDefinition") { throw new Error("trying to parse something that is not a contract, but rather type: " + typeof contract); }
	var result = "";
	for (var par of contract.subNodes) {
		if (par.type === "StateVariableDeclaration") { 
			result += extractVariable(par.variables[0]); 
		} else if (par.type === "FunctionDefinition") {
			result += extractFunction(par);
		} else if (par.type ==="UsingForDeclaration"){
			associations[par.libraryName] = "\"using\" +.. \"for " + getType(par.typeName) + "\"";
		} else if (par.type === "StructDefinition") {
			var newStruct = "class "+par.name+"<<(S, lightyellow) struct>>{\n";
			for(var m in par.members){
				newStruct += extractVariable(par.members[m]);
			}
			newStruct += "}\n";
			structs.push(newStruct);
		}
	}
	if(contract.kind == "library"){
		classInformation["<<(L,lightblue) Lib>>"] = "post";
	}
	var cipre = "";
	var cipost = "";
	if(Object.keys(classInformation).length > 0) {
		cipre = Object.entries(classInformation)
			.map(function (p) { 
				return p[1]=="pre"?(p[0]+" "):""; })
			.reduce(function (t, v) { return t + (v==""?"":v); }); 
		cipost = Object.entries(classInformation)
			.map(function (p) { 
				return p[1]=="post"?p[0]:""; })
			.reduce(function (t, v) { return t + (v==""?"":v); }); 
	}
	result = "\n" + cipre + "class " + contract.name + cipost + " {\n" + result + "}\n";
	if (Object.keys(associations).length > 0) { 
		result += Object.entries(associations)
			.map(function (v) { return v[0] + " "+v[1]+" " + contract.name; })
			.reduce(function (t, v) { return t + "\n" + v; }) 
		+ "\n";
	}
	return result;
}
function getVisibility (variable) {
	switch (variable.visibility) {
	case "public":
		return "+";
	case "private":
		return "-";
	case "internal":
		return "~";
	case "external":
		return "#";
	case "default":
		return "";
	default:
		return "";
	}
	
}
function getType (variableTypeName) {
	switch (variableTypeName.type) {
	case "ArrayTypeName":
		return getType(variableTypeName.baseTypeName) + "[]";
	case "UserDefinedTypeName":
		associations[variableTypeName.namePath] = "o--";
		return variableTypeName.namePath;
	case "ElementaryTypeName":
		return variableTypeName.name;
	case "Mapping":
		return getType(variableTypeName.keyType) + "->" + getType(variableTypeName.valueType);
	}
}
function extractVariable (variable) {
	var varString = "\t";
	varString += getVisibility(variable);
	varString += getType(variable.typeName);
	varString += " " + variable.name;
	return varString + "\n";
}
function parseFunctionParameters (parameters) {
	var output = "(";
	for (var p of parameters) {
		output += getType(p.typeName) + ",";
	}
	if (parameters.length > 0) { output = output.slice(0, output.lastIndexOf()); }
	return output + ")";
}

function extractFunction (func) {
	var output = "\t";
	if (func.body === null) {
		classInformation["abstract"] = "pre";
		output += "{abstract}";
	}
	if(func.stateMutability == "payable"){
		output += "{static}";
	}
	var funcName = (func.name==""||func.name==null)?"{static}fallback":func.name;
	output += getVisibility(func) + funcName;
	output += parseFunctionParameters(func.parameters.parameters);
	if (func.returnParameters != null) { output += "=>" + parseFunctionParameters(func.returnParameters.parameters); }
	return output + "\n";
}

function solidity2plantuml(input, startDecorator = "@startuml\n", endDecorator = "\n@enduml") {
	var result = startDecorator;
	try {
		var parsed = parse.parse(input);
		for (var c of parsed.children) {
			if (c.type === "ContractDefinition") {
				result += extractFunctionsAndVariables(c);
				if(structs.length>0){
					result += structs.reduce(function(t, v){ return t + v; });
				}
				result += extractBaseContracts(c);
				
			}
		}
		return result + endDecorator;
	} catch (e) {
		if (e instanceof parse.ParserError) {
			// eslint-disable-next-line no-console
			console.log(e.errors);
		}
	}
}

module.exports = solidity2plantuml;