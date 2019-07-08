const parse = require("solidity-parser-antlr");
class ClassDesc{
	constructor(){
		this.fullPath = "";
		this.package = "";
		this.pre = "";
		this.post = "";
		this.name = "";
		this.parameters = [""];
		this.functions = [""];
		this.associations = {};
	}
	toString(){
		var result =`
	${this.pre} ${this.name} ${this.post} {\t${this.parameters.reduce(function (t, v) { return t + "\n\t" + (v==""?"":v); })}    \t${this.functions.reduce(function (t, v) { return t + "\n\t" + (v==""?"":v); })}
	}`;
		if(this.package != ""){
			result = `package ${this.package} {${result}\n}`;
		}
		return result;
	}
}
class Sol2UML{
	constructor(){
		this.uml  = {
			inheritance: [],
			classDescs: {}
		};
		this.currentClass = new ClassDesc();
		this.importDirectives = {};
	}

	// function populateTemplate(classDesc){
	//     var result =`
	// ${classDesc.pre} ${classDesc.name} ${classDesc.post} {\t${classDesc.parameters.reduce(function (t, v) { return t + "\n\t" + (v==""?"":v); })}    \t${classDesc.functions.reduce(function (t, v) { return t + "\n\t" + (v==""?"":v); })}
	// }`;
	//     if(classDesc.package != ""){
	//         result = `package ${classDesc.package} {${result}\n}`
	//     }
	//     return result;
	// }
	toString(){
		var r  = "";
	
		var cds = Object.values(this.uml.classDescs);

		for(var c of cds){
			r += c.toString() + "\n";
		}
		for(var i of this.uml.inheritance){
			r += i + "\n";
		}
		for(var cd of cds){
			if(Object.keys(cd.associations).length > 0) { 
				for(var a of Object.entries(cd.associations)){
					r += a[0] +" " + a[1] + "\n";
				}
			}
		}
		return r;
	}

	extractBaseContracts (contract) {
		if (contract.type !== "ContractDefinition") { throw new Error("trying to parse something that is not a contract, but rather type: " + typeof contract); }
		if (contract.baseContracts.length < 1) {
			return "";
		}
		var name = contract.name;
		for (var baseC of contract.baseContracts) {
			this.uml.inheritance.push(baseC.baseName.namePath + " <|-- " + name);
		}
	// return "check uml.inheritance"; //uml.inheritance.reduce(function (t, v) { return t + "\n" + v; });
	}

	extractFunctionsAndVariables (contract, packageName = "") {
		this.currentClass = new ClassDesc(); //JSON.parse(classDescTemplate);
		this.currentClass.pre = "class ";
		this.currentClass.package = packageName;
		this.currentClass.name = contract.name;
		if (contract.type !== "ContractDefinition") { throw new Error("trying to parse something that is not a contract, but rather type: " + typeof contract); }
		for (var par of contract.subNodes) {
			if (par.type === "StateVariableDeclaration") { 
				this.currentClass.parameters.push(this.extractVariable(par.variables[0])); 
			} else if (par.type === "FunctionDefinition") {
				this.currentClass.functions.push(this.extractFunction(par));
			} else if (par.type ==="UsingForDeclaration"){
				this.currentClass.associations[par.libraryName] = "\"using\" ..+ \"for e.g." + this.getType(par.typeName) + "\" " + contract.name;	
			} else if (par.type === "StructDefinition") {
				var newStruct = new ClassDesc();
				newStruct.pre = "class ";
				newStruct.name = par.name;
				newStruct.package = packageName;
				newStruct.post = " <<(S, lightyellow) struct>>";
				for(var m in par.members){
					newStruct.parameters.push(this.extractVariable(par.members[m]));
				}
				newStruct.associations[this.currentClass.name] = " *-- " + par.name;
				this.uml.classDescs[this.currentClass.fullPath + "#" + newStruct.name] = newStruct;
			}
		}
		if(contract.kind == "library"){
			this.currentClass.post += " <<(L,lightblue) Lib>>"; 
		}

		this.uml.classDescs[this.currentClass.fullPath + "#" + this.currentClass.name] = this.currentClass;
		return this.currentClass;
	}
	static getVisibility (variable) {
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
	getType(variableTypeName) {
		switch (variableTypeName.type) {
		case "ArrayTypeName":
			return this.getType(variableTypeName.baseTypeName) + "[]";
		case "UserDefinedTypeName":
			this.currentClass.associations[variableTypeName.namePath] = " --o " + this.currentClass.name;
			return variableTypeName.namePath;
		case "ElementaryTypeName":
			return variableTypeName.name;
		case "Mapping":
			return this.getType(variableTypeName.keyType) + "->" + this.getType(variableTypeName.valueType);
		}
	}
	extractVariable (variable) {
		var varString = "\t";
		varString += Sol2UML.getVisibility(variable);
		varString += this.getType(variable.typeName);
		varString += " " + variable.name;
		return varString;
	}
	parseFunctionParameters (parameters) {
		var output = "(";
		for (var p of parameters) {
			output += this.getType(p.typeName) + ",";
		}
		if (parameters.length > 0) { output = output.slice(0, output.lastIndexOf()); }
		return output + ")";
	}

	extractFunction (func) {
		var output = "\t";
		if (func.body === null) {
		//classInformation["abstract"] = "pre";
		//"<<(L,lightblue) Lib>>"
			this.currentClass.pre = "abstract ";
			output += "{abstract}";
		}
		if(func.stateMutability == "payable"){
			output += "{static}";
		}
		var funcName = (func.name==""||func.name==null)?"{static}fallback":func.name;
		output += Sol2UML.getVisibility(func) + funcName;
		output += this.parseFunctionParameters(func.parameters.parameters);
		if (func.returnParameters != null) { output += "=>" + this.parseFunctionParameters(func.returnParameters.parameters); }
		return output;
	}

	parseContract(c, packageName){
		this.extractBaseContracts(c);
		this.extractFunctionsAndVariables(c, packageName);
	}

	convertToAbsolutePath(base, relative){
		if(relative.startsWith("http")){
			return relative;
		}
		var pathElements = base.split("/");
		var folderLevel = pathElements.length - 1;
		var _relative = relative;
		while(_relative.startsWith("../")){
			_relative = _relative.slice(3);
			folderLevel--;
		}
		if(_relative.startsWith("./")){
			_relative = _relative.slice(2);
		}
		var path = "/";

		for(var i = 0; i < folderLevel;i++){
			path += pathElements[i] + "/";
		}
		path += _relative;
		for(var j = 0; j<5;j++){
			path = path.replace("//","/");
		}
		return path;
	}

	collectImportDirectives(input, basePath = "."){
		var importDirectives = {};
		var importDirectivesAbsolute = {};
		try {
			var parsed = parse.parse(input);
			for (var c of parsed.children) {
				if(c.type === "ImportDirective") {
					importDirectives[c.path] = basePath;
					var absolutePath = this.convertToAbsolutePath( basePath, c.path);
					importDirectivesAbsolute[absolutePath]=1;
					
				}
			}
			return importDirectivesAbsolute;
		}catch (e) {
			if (e instanceof parse.ParserError) {
			// eslint-disable-next-line no-console
				console.log(e.errors);
			}
		}
	}
	importSolidity(input, packageName) { //, startDecorator = "@startuml\n", endDecorator = "\n@enduml"
		try {
			var parsed = parse.parse(input);
			for (var c of parsed.children) {
				if (c.type === "ContractDefinition") {
					this.parseContract(c, packageName);
				}
			}
		} catch (e) {
			if (e instanceof parse.ParserError) {
			// eslint-disable-next-line no-console
				console.log(e.errors);
			}
		}
	}
}
module.exports = {ClassDesc: ClassDesc, Sol2UML: Sol2UML};