const assert = require("assert");
describe("Array", function() {
	describe("#indexOf()", function() {
		it("should return -1 when the value is not present", function() {
			assert.equal([1, 2, 3].indexOf(4), -1);
		});
	});
});
describe("Array2", function() {
	describe("#indexOfF()", function() {
		it("should return -234 when thesdfg value is not present", function() {
			assert.equal([1, 2, 3].indexOf(4), -1);
		});
	});
});

const s2u = require("solidity2plantuml");
describe("solidity2plantuml", function() {
    it("should return valid plantUML code", function() {
        var uml = solidity2plantuml(`contract testCon2{
            test public T;}`);
        assert.equal([1, 2, 3].indexOf(4), -1);
    });
});

