var _else = {identifier: 'else'};
var _if = function(cond1, lambda1, cond2, lambda2) {
    if (arguments.length % 2 !== 0) {
        throw new Error('if called with an odd number of arguments');
    }
    var i = 0;
    for (var i = 0; i < arguments.length; i += 2) {
        var condition = arguments[i];
        if (condition != null && condition !== false) {
            return arguments[i + 1].call(undefined);
        }
    }
};

var _while = function(conditionLambda, bodyLambda) {
    while (conditionLambda.call(undefined)) {
        bodyLambda.call(undefined);
    }
}

var assert = require("assert");
var _ = require("underscore");
var compile = require("./compile-for-testing");
var describe = global.describe;
var it = global.it;
var SyntaxError = global.SyntaxError;
describe("type checking", (function() {
describe("use of an undefined variable", (function() {
it("should throw a type error", (function() {
assert.throws((function(_it) {
compile(["a = b"]);
}), SyntaxError);
}));
it("should throw for mutating a const var", (function() {
assert.throws((function(_it) {
compile(["a = 5",
"mutate a = 6"]);
}), SyntaxError);
}));
it("should not throw for mutating a mutable", (function() {
assert.doesNotThrow((function(_it) {
compile(["mutable a = 5",
"mutate a = 6"]);
}));
}));
}));
}));