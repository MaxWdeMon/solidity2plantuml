# solidity2plantuml
Converts solidity code into a plantUML script representing UML class diagramms.

# Example

![Alt text](https://raw.githubusercontent.com/MaxWdeMon/solidity2plantuml/master/plantUML.svg?sanitize=true)


```javascript
const solidity2plantuml = require("solidity2plantuml");
var simpleInput = "contract test { uint a; }";
var simpleOutput = `
class test {
	uint a
}
`;

var input = 
`   contract test is OtherContract, AnotherContract {
        uint256 private a; //   , uint x, uint y;
        uint public b;
        uint internal c = 10;
        uint256[] public vector;
        function f() public pure returns(uint256[], uint256, testClass, testClass[]){}
        function g(uint256[] x, uint256 y, testClass u, testClass[] w) external view returns(testClass) ;
    }
    library Lib{
        function libFunc() public view{
            
        }
    }
    contract testCon2{
        using Lib for uint256;
        test public T;
        OtherContract[] private x;
        function f() public view{}
        function() public payable{}
    }
`;

var output = `@startuml

abstract class test {
	-uint256 a
	+uint b
	~uint c
	+uint256[] vector
	+f()=>(uint256[],uint256,testClass,testClass[])
	{abstract}#g(uint256[],uint256,testClass,testClass[])=>(testClass)
}
testClass o-- test
OtherContract <|-- test
AnotherContract <|-- test
class Lib<<(L,lightblue) Lib>> {
	+libFunc()
}

class testCon2 {
	+test T
	-OtherContract[] x
	+f()
	+{static}fallback()
}
Lib "using" +.. "for uint256" testCon2
test o-- testCon2
OtherContract o-- testCon2

@enduml`;

var plantUML = solidity2plantuml(input);
console.log(plantUML == output);
console.log(solidity2plantuml(simpleInput, "", "") == simpleOutput);
//true
//true
```

# Creating diagrams from folders

The below code takes a folder and generates a class diagram with all files contained in the folder:
```javascript

const fs = require("fs");
var r = fs.statSync("./").isDirectory();
function readDirectory(path){
	if(fs.statSync(path).isDirectory()){
		var dir = fs.readdirSync(path);
		for(var f in dir){
			if(dir[f].slice(0,1) != ".")
				readDirectory(path + "/" + dir[f]);
		}
	}else if(path.endsWith(".sol")){
		// var p = path.replace("/Volumes/Test/openzeppelin-solidity/contracts/","");
		var file = fs.readFileSync(path, "utf8");
		console.log(solidity2plantuml(file,"","")); 
		// future version should display files as packages e.g.: , "package " + p + "{\n", "\n}" ));
	}
}
```
