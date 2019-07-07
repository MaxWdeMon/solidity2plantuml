# solidity2plantuml
Converts solidity code into a plantUML script representing UML class diagramms.

# Example

![Alt text](https://raw.githubusercontent.com/MaxWdeMon/solidity2plantuml/master/plantUML.svg?sanitize=true)

# Usage

```sh
node sol2uml [/path/to/somefile.sol]
```
or
```sh
node sol2uml [/path/to/folder/containing/solidityfiles]
```
If you provide a file as an argument the converter will trace all import directives.
If you provide a folder all files in the folder will be processed.

# Code Embedding

Please take a look at the ```cli.js``` file if you want to embed this into yor code. 
You can either trace the Import Directives or the Folder Structure.
