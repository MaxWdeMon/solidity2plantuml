# solidity2plantuml
Converts solidity code into a plantUML script, from which UML diagramms can be generated.

# Example
```javascript
const solidity2plantuml = require("solidity2plantuml");
var input = 
`
    contract test is OtherContract, AnotherContract {
        uint256 private a; //   , uint x, uint y;
        uint public b;
        uint internal c = 10;
        uint256[] public vector;
        function f() public pure returns(uint256[], uint256, testClass, testClass[]){}
        function g(uint256[] x, uint256 y, testClass u, testClass[] w) external view returns(testClass) ;
    }
    contract testCon2{
        test public T;
        OtherContract[] private x;
        function f() public view;
    }
`;
var plantUML = solidity2plantuml(input);
var output = `@startuml
abstract class test{
	-uint256 a
	+uint b
	~uint c
	+uint256[] vector
	+f()=>(uint256[],uint256,testClass,testClass[])
	{abstract}#g(uint256[],uint256,testClass,testClass[])=>(testClass)
}
OtherContract <|-- test
AnotherContract <|-- test

abstract class testCon2{
	+test T
	-OtherContract[] x
	{abstract}+f()
}

@enduml`;
console.log(plantUML == output);
//true
```

![Alt text](https://raw.githubusercontent.com/MaxWdeMon/solidity2plantuml/master/plantUML.svg?sanitize=true)
