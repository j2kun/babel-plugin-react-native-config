"use strict";

var dotenv;

module.exports = function (options) {
  var t = options.types;

  const updateConfigReferenceVisitor = {
    MemberExpression(path, state) {
      // If Config.VALUE is on the LHS of an assignment statement, ignore.
      // However, note that doing such could result in differing behavior
      // between transpiled and compiled use of react-native-config, because
      // "assigned" Config values would be ignored as all references would be
      // transpiled to raw values.
      if(t.isAssignmentExpression(path.parent) && path.parent.left == path.node) {
        return;
      }

      var object = path.node.object;
      var property = path.node.property;
      if (object.name == this.import_name) {
        if (!dotenv) {
          dotenv = require('dotenv').config(state.opts);
        }

        var name = property.name;
        var overrideEnv = state.opts && state.opts.env && name in state.opts.env;
        var replaceValue = overrideEnv ? state.opts.env[name] : process.env[name];
        path.replaceWith(t.valueToNode(replaceValue));
      }
    }
  };

  return {
    visitor: {
      Program: function Program(path) {
        var import_name;

        if (path.node.body) {
          path.node.body.forEach(function(childNode) {
            if (childNode.type == "ImportDeclaration" && childNode.source.value == "react-native-config" && 
                childNode.specifiers && childNode.specifiers.length > 0) {
              var specifier = childNode.specifiers[0];
              if (specifier && specifier.type == "ImportDefaultSpecifier") {
                import_name = specifier.local.name;
              }
            }
          });
        }

        if (import_name) {
          path.traverse(updateConfigReferenceVisitor, { import_name });
        }
      }
    }
  };
};
