// import { parse, ParserError } from "solidity-parser-antlr"
const parse = require("solidity-parser-antlr");


let associations = {};
let inheritance = [];
let classInformation = "";
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
	classInformation = "";
	if (contract.type !== "ContractDefinition") { throw new Error("trying to parse something that is not a contract, but rather type: " + typeof contract); }
	var result = "";
	for (var par of contract.subNodes) {
		if (par.type === "StateVariableDeclaration") { result += extractVariable(par.variables[0]); } else if (par.type === "FunctionDefinition") {
			result += extractFunction(par);
		}
	}
	result = "\n" + classInformation + "class " + contract.name + "{\n" + result + "}\n";
	if (Object.keys(associations).length > 0) { 
		result += Object.keys(associations)
		.map(function (v) { return v + " o-- " + contract.name; })
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
		classInformation = "abstract " + classInformation;
		output += "{abstract}";
	}
	output += getVisibility(func) + func.name;
	output += parseFunctionParameters(func.parameters.parameters);
	if (func.returnParameters != null) { output += "=>" + parseFunctionParameters(func.returnParameters.parameters); }
	return output + "\n";
}

module.exports = function solidity2plantuml (input) {
	var result = "@startuml\n";
	try {
		var parsed = parse.parse(input);
		for (var c of parsed.children) {
			if (c.type === "ContractDefinition") {
				result += extractFunctionsAndVariables(c);
				result += extractBaseContracts(c);
			}
		}
		return result + "\n@enduml";
	} catch (e) {
		if (e instanceof parse.ParserError) {
			// eslint-disable-next-line no-console
			console.log(e.errors);
		}
	}
}
