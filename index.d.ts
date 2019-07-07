// Type definitions for solidity2plantuml 0.0.1
// Project: https://github.com/MaxWdeMon/solidity2plantuml
// Definitions by: Maxwell's Deamon
declare function solidity2plantuml(input: string|number): string;
declare function sol2umlFolder(inputPath: string, startDecorator: string, endDecorator: string): string;
declare function sol2umlCLI(): string;

declare namespace solidity2plantuml { }

export = solidity2plantuml;
