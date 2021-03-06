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

var fs = require("fs");
var path = require("path");
var jison = require("jison");
var process = global.process;
var PARSER_DEBUG_MODE = false;
var outputFile = (function(args) {
var index = (args.indexOf("-o") + 1);
_if(((index === 0) || (index === args.length)), (function(_it) {
throw new Error("Must supply an output file name with a -o option");
}));
return args[index];
})(process.argv);
var grammar = {
lex: {
startConditions: {
INSIDE_PARENS: 0
},
rules: [["\\(",
"this.pushState(\"INSIDE_PARENS\"); return \"(\";"],
["\\)",
"this.popState(); return \")\";"],
["\\{",
"this.pushState(\"INITIAL\"); return \"{\";"],
["\\}",
"this.popState(); return \"}\";"],
["\\[",
"this.pushState(\"INITIAL\"); return \"[\";"],
["\\]",
"this.popState(); return \"]\";"],
["\\|",
"return \"|\";"],
["->",
"return \"->\";"],
["(\\r\\n?|\\n)",
"return YY_START === \"INITIAL\" ? \"NEWLINE\" : null;"],
["[^\\S\\r\\n]+",
"/* skip other whitespace */"],
["\\/\\/.*?(\\r\\n?|\\n)",
"return YY_START === \"INITIAL\" ? \"NEWLINE\" : null; /* skip comments */"],
["==|!=|<=|>=|<|>",
"return \"SIGN\";"],
["and",
"return \"AND\";"],
["or",
"return \"OR\";"],
["-[0-9]+",
"return \"NEG_NUMBER\";"],
["-([0-9]+)?\\.[0-9]+",
"return \"NEG_NUMBER\";"],
["[0-9]+",
"return \"NUMBER\";"],
["([0-9]+)?\\.[0-9]+",
"return \"NUMBER\";"],
["\\/(\\\\.|[^\\/\\n])*\\/[gim]*",
"return \"REGEX\";"],
["\\*",
"return \"*\";"],
["\\/",
"return \"/\";"],
["-",
"return \"-\";"],
["\\+",
"return \"+\";"],
["\\%",
"return \"%\";"],
["@",
"return \"@\";"],
["\\?",
"return \"?\";"],
["=",
"return \"=\";"],
["\\!",
"return \"!\";"],
["\\:\\:",
"return \"TYPEDELIM\";"],
["\\:",
"return \":\";"],
["\\.",
"return \"DOT\";"],
[",",
"return \",\";"],
["\\\"(\\\\.|[^\"\\n])*?\\\"",
"return \"STRING\";"],
["\\'(\\\\.|[^'\\n])*?\\'",
"return \"STRING\";"],
["[a-zA-Z_$][a-zA-Z0-9_$]*",
"return \"IDENTIFIER\";"],
["```.*?```",
"return \"JAVASCRIPT\";"],
["$",
"return \"EOF\";"],
[".",
"return \"INVALID\";"]],
options: []
},
operators: [["precedence",
"IDENTIFIER",
"NUMBER",
"STRING"],
["nonassoc",
"SIGN",
"COMPARISON"],
["left",
"+",
"-",
"NEG_NUMBER"],
["left",
"*",
"/",
"%"],
["precedence",
"UMINUS"],
["left",
"FUNC_CALL"],
["left",
"->"],
["precedence",
"(",
"[",
"{"],
["left",
"DOT",
"@"],
["precedence",
"WRAP_EXPR"],
["precedence",
"STMT"],
["precedence",
"STMT_LIST"],
["left",
"_separator"]],
start: "program",
bnf: {
program: [["statementList EOF",
"return $1;"],
["EOF",
"return [];"]],
statementList: [["statementListBody",
"$$ = $1;"],
["statementListBody separator",
"$$ = $1;"],
["separator statementListBody",
"$$ = $2;"],
["separator statementListBody separator",
"$$ = $2;"]],
statementListBody: [["statement",
"$$ = [$1];",
{
prec: "STMT"
}],
["statementListBody separator statement",
"$$ = $1; $1.push($3);",
{
prec: "STMT_LIST"
}]],
separator: [["NEWLINE",
"",
{
prec: "_separator"
}],
["separator NEWLINE",
"",
{
prec: "_separator"
}]],
statement: [["lvalue = expression",
"$$ = yy.Declaration($1, $3, @2);"],
["unitList = expression",
"$$ = yy.Assignment($1, $3, @2);"],
["expression",
"$$ = $1;",
{
prec: "STATEMENT_BODY"
}]],
expression: [["unitList",
"$$ = $1;",
{
prec: "WRAP_EXPR"
}],
["additive",
"$$ = $1;",
{
prec: "WRAP_EXPR"
}],
["booleanOp",
"$$ = $1",
{
prec: "WRAP_EXPR"
}],
["arrowExpr",
"$$ = $1",
{
prec: "WRAP_EXPR"
}]],
booleanOp: [["comparison",
"$$ = $1"],
["booleanAndOp",
"$$ = $1"],
["booleanOrOp",
"$$ = $1"]],
booleanAndOp: [["comparison AND comparison",
"$$ = yy.Operation($1, $2, $3);"],
["comparison AND unitExpression",
"$$ = yy.Operation($1, $2, $3);"],
["unitExpression AND comparison",
"$$ = yy.Operation($1, $2, $3);"],
["unitExpression AND unitExpression",
"$$ = yy.Operation($1, $2, $3);"],
["booleanAndOp AND comparison",
"$$ = yy.Operation($1, $2, $3);"],
["booleanAndOp AND unitExpression",
"$$ = yy.Operation($1, $2, $3);"]],
booleanOrOp: [["comparison OR comparison",
"$$ = yy.Operation($1, $2, $3);"],
["comparison OR unitExpression",
"$$ = yy.Operation($1, $2, $3);"],
["unitExpression OR comparison",
"$$ = yy.Operation($1, $2, $3);"],
["unitExpression OR unitExpression",
"$$ = yy.Operation($1, $2, $3);"],
["booleanOrOp OR comparison",
"$$ = yy.Operation($1, $2, $3);"],
["booleanOrOp OR unitExpression",
"$$ = yy.Operation($1, $2, $3);"]],
comparison: [["additive SIGN additive",
"$$ = yy.Operation($1, $2, $3);",
{
prec: "COMPARISON"
}]],
unitExpression: [["( expression )",
"$$ = $2;"],
["function",
"$$ = $1;"],
["literal",
"$$ = $1;"],
["lvalue",
"$$ = $1;"],
["singleUnitList",
"$$ = $1;"],
["JAVASCRIPT",
"$$ = yy.Javascript($1.slice(3, -3));"]],
lvalue: [["IDENTIFIER",
"$$ = yy.Variable($1, null);",
{
prec: "WRAP_EXPR"
}],
["IDENTIFIER TYPEDELIM unitExpression",
"$$ = yy.Variable($1, $3);",
{
prec: "WRAP_EXPR"
}],
["IDENTIFIER TYPEDELIM ?",
"$$ = yy.Variable($1, $3);",
{
prec: "WRAP_EXPR"
}],
["tableaccess",
"$$ = $1;"]],
unitList: [["unitExpression unitExpression",
"$$ = yy.UnitList([$1, $2]);",
{
prec: "FUNC_CALL"
}],
["unitExpression unitList",
"$$ = $2; $2.units.unshift($1);",
{
prec: "FUNC_CALL"
}]],
singleUnitList: [["unitExpression ( )",
"$$ = yy.UnitList([$1]);"]],
arrowExpr: [["expression -> unitList",
"$$ = yy.ArrowApplication($1, $3);"],
["expression -> unitExpression",
"$$ = yy.ArrowApplication($1, yy.UnitList([$3]));"]],
tableaccess: [["unitExpression DOT IDENTIFIER",
"$$ = new yy.TableAccess($1, $3);",
{
prec: "DOT"
}],
["unitExpression @ unitExpression",
"$$ = new yy.TableAccess($1, $3);",
{
prec: "@"
}]],
literal: [["tableNameLiteral",
"$$ = $1;"],
["table",
"$$ = $1;"],
["REGEX",
"$$ = yy.Regex($1);"]],
tableNameLiteral: [["NUMBER",
"$$ = Number($1);"],
["NEG_NUMBER",
"$$ = Number($1);"],
["STRING",
"$$ = yy.String($1);"]],
table: [["{ }",
"$$ = new yy.Table([], false);"],
["{ : }",
"$$ = new yy.Table([], true);"],
["{ = }",
"$$ = new yy.Table([], true);"],
["{ fieldList }",
"$$ = new yy.Table($2, false);"]],
fieldList: [["fieldListBody",
"$$ = $1;"],
["fieldListBody separator",
"$$ = $1;"],
["separator fieldListBody",
"$$ = $2;"],
["separator fieldListBody separator",
"$$ = $2;"]],
fieldListBody: [["field",
"$$ = [$1];"],
["fieldListBody , field",
"$$ = $1; $1.push($3);"],
["fieldListBody separator field",
"$$ = $1; $1.push($3);"],
["fieldListBody , separator field",
"$$ = $1; $1.push($4);"]],
field: [["expression",
"$$ = yy.Field(null, $1);"],
["IDENTIFIER : expression",
"$$ = yy.Field($1, $3);"],
["IDENTIFIER = expression",
"$$ = yy.Field($1, $3);"],
["tableNameLiteral : expression",
"$$ = yy.Field($1, $3);"],
["tableNameLiteral = expression",
"$$ = yy.Field($1, $3);"]],
function: [["[ statement ]",
"$$ = yy.RetLambda([yy.Variable('_it', null)], $2);"],
["[ | statement ]",
"$$ = yy.RetLambda([], $3);"],
["[ unitList | statement ]",
"$$ = yy.RetLambda($2.units, $4);"],
["[ unitExpression | statement ]",
"$$ = yy.RetLambda([$2], $4);"],
["[ separator statementListBody separator ]",
"$$ = yy.Lambda([yy.Variable('_it', null)], $3);"],
["[ | separator statementListBody separator ]",
"$$ = yy.Lambda([], $4);"],
["[ unitList | separator statementListBody separator ]",
"$$ = yy.Lambda($2.units, $5);"],
["[ unitExpression | separator statementListBody separator ]",
"$$ = yy.Lambda([$2], $5);"]],
additive: [["multiplicative",
"$$ = $1;",
{
prec: "+"
}],
["additive + additive",
"$$ = yy.Operation($1, $2, $3);"],
["additive - additive",
"$$ = yy.Operation($1, $2, $3);"]],
multiplicative: [["negative",
"$$ = $1;"],
["multiplicative * multiplicative",
"$$ = yy.Operation($1, $2, $3);"],
["multiplicative / multiplicative",
"$$ = yy.Operation($1, $2, $3);"],
["multiplicative % multiplicative",
"$$ = yy.Operation($1, $2, $3);"]],
negative: [["- negative",
"$$ = yy.Operation(null, $1, $2);",
{
prec: "UMINUS"
}],
["unitExpression",
"$$ = $1;",
{
prec: "UMINUS"
}]]
}
};
var prelude = "";
var parser = new jison.Parser(grammar, {
debug: PARSER_DEBUG_MODE
}).generate({
moduleType: "js"
});
var postlude = "\n\nparser.yy = require('./parse-tree.js');\nmodule.exports = parser;\n";
fs.writeFileSync(outputFile, ((prelude + parser) + postlude));
