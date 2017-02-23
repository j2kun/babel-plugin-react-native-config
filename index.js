"use strict";

const fspath = require('path');
const fs = require('fs');

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
          var filename = '.env';
          if (process.env.ENVFILE) {
            filename = process.env.ENVFILE;
          } else if (state.opts && state.opts.envfile) {
            filename = state.opts.envfile;
          }

          var dir = process.cwd();
          var stopIfFound = '.babelrc';

          while (!fs.existsSync(fspath.join(dir, stopIfFound)) && 
                 !fs.existsSync(fspath.join(dir, filename)) && dir != '/') {
            dir = fspath.dirname(dir);
          }

          var finalPath = fspath.join(dir, filename);
          dotenv = require('dotenv').config({ "path": finalPath });
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
      Program: function Program(path, state) {
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
          state.import_name = import_name;
          path.traverse(updateConfigReferenceVisitor, state);
        }
      }
    }
  };
};
