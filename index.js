"use strict";

var dotenv;

module.exports = function (options) {
  var t = options.types;

  const updateConfigReferenceVisitor = {
    visitor: {
      MemberExpression: function MemberExpression(path, state) {
        // If Config.VALUE is on the LHS of an assignment statement, ignore.
        // However, note that doing such could result in differing behavior
        // between Transpiled and compiled use of react-native-config, because
        // "assigned" Config values would be ignored as all references would be
        // transpiled to raw values.
        if(t.isAssignmentExpression(path.parent) && path.parent.left == path.node) return;

        if (path.get("object").matchesPattern(this.import_name)) {
          if (!dotenv) {
            dotenv = require('dotenv').config(state.opts);
          }
          var key = path.toComputedKey();
          if (t.isStringLiteral(key)) {
            var name = key.value;
            var value = (state.opts.env && name in state.opts.env) ? state.opts.env[name] : process.env[name];
            path.replaceWith(t.valueToNode(value));
          }
        }
      }
    }
  };

  return {
    visitor: {
      File: function File(path) {
        var import_name;

        if (path.node.program && path.node.program.body) {
          path.node.program.body.foreach() {
            if (this.type == "ImportDeclaration" && this.source.value == "react-native-config" && 
                this.specifiers && this.specifiers.length > 0) {
              var specifier = this.specifiers[0];
              if (specifier && specifier.type == "ImportDefaultSpecifier") {
                import_name = specifier.local.name;
                this.remove();
              }
            }
          }
        }

        path.traverse(updateConfigReferenceVisitor, { import_name });
      }
    }
  };
};
