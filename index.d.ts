// Type definitions for solidity2plantuml 0.0.1
// Project: https://github.com/MaxWdeMon/solidity2plantuml
// Definitions by: Maxwell's Deamon

declare function sol2umlFolder(inputPath: string, showFilenameAsPackage: boolean, sol2uml: object ): string;
declare function sol2umlInheritance(path: string, showFilenameAsPackage: boolean, sol2uml: object ): string;
declare function sol2umlFromString(solidityCode: string, packageName: string): string;
declare function sol2umlCLI(): string;

declare namespace solidity2plantuml { }

export = solidity2plantuml;
