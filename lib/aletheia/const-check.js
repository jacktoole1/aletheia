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
var SyntaxNode = require("./syntax-tree").SyntaxNode;
var is_instance = (function(a, A) {
return a instanceof A;
});
var nop = (function(node) {
return undefined;
});
var MAGIC = {
self: true,
this: true,
_it: true
};
var Context = (function(_it) {
this.scopes = [{

}];
});
_.extend(Context.prototype, {
has: (function(varname) {
var result = false;
_.each(this.scopes, (function(scope) {
_if(_.has(scope, varname), (function(_it) {
result = true;
}));
}));
return result;
}),
may_declare: (function(varname) {
return ! this.has(varname);
}),
may_be_param: (function(varname) {
return ((this.may_declare(varname) || MAGIC[varname]) === true);
}),
declare: (function(varname) {
_.last(this.scopes)[varname] = true;
}),
pushScope: (function(_it) {
this.scopes.push([]);
}),
popScope: (function(_it) {
this.scopes.pop();
})
});
var check = (function(node, context) {
assert(is_instance(context, Context), (("Prototype " + JSON.stringify(Object.getPrototypeOf(context))) + " is not a Context"));
var res = _if(is_instance(node, SyntaxNode), (function(_it) {
return check[node.type](node, context);
}), check[typeof(node)], (function(_it) {
return check[typeof(node)](node, context);
}), _else, (function(_it) {
return true;
}));
return res;
});
_.extend(check, {
number: nop,
string: nop,
undefined: nop,
boolean: nop,
"table-key": nop,
"unit-list": nop,
"table-access": nop,
operation: nop,
javascript: nop,
regex: nop,
"statement-list": (function(stmts, context) {
_.each(stmts, (function(stmt) {
check(stmt, context);
}));
}),
object: (function(obj, context) {
_.each(obj, (function(value, key) {
return check(value, context);
}));
}),
assignment: (function(assign, context) {
assert(is_instance(context, Context), (Object.getPrototypeOf(context) + " is not a Context"));
var modifier = assign.modifier;
var left = assign.left;
var type = left.type;
assert(_.contains([null,
"mutable",
"mutate"], modifier), (("ALC: Unrecognized modifier `" + modifier) + "`"));
return _if((type === "variable"), (function(_it) {
_if(((modifier === null) || (modifier === "mutable")), (function(_it) {
_if(! context.may_declare(left.name), (function(_it) {
throw new SyntaxError(((("ALC: Shadowing `" + left.name) + "`") + " not permitted. Use `mutate` to mutate."));
}), _else, (function(_it) {
context.declare(left.name);
}));
}), (modifier === "mutate"), (function(_it) {
nop();
}), _else, (function(_it) {
assert(false, ("Invalid modifier " + modifier));
}));
}), (type === "table-access"), (function(_it) {
nop();
}), _else, (function(_it) {
throw new Error(("ALINTERNAL: Unrecognized lvalue type: " + type));
}));
}),
lambda: (function(lambda, context) {
context.pushScope();
_.each(lambda.arguments, (function(arg) {
_if(! context.may_be_param(left.name), (function(_it) {
throw new SyntaxError(((("ALC: Param shadowing `" + left.name) + "`") + " not permitted. Use `mutate` to mutate."));
}), _else, (function(_it) {
context.declare(left.name);
}));
}));
_.each(lambda.statements, (function(stmt) {
check(stmt, context);
}));
context.popScope();
})
});
var check_program = (function(node) {
var context = new Context();
check["statement-list"](node, context);
});
module.exports = check_program;