# babel-plugin-react-native-config

The [react-native-config](https://github.com/luggit/react-native-config) project is great! Sadly, but appropriately, it doesn't hot-reload config variable changes unless you do a clean and rebuild, which can take minutes. Minutes!

This babel plugin is a layer on top of `react-native-config` that allows you to get hot reloading. It works by bypassing the Config module entirely, and transpiling the configvars for faster development.

I.e., it turns this:

```
import Config from 'react-native-config';

var API_URL = Config.API_URL || 'api.my-default-url.com';
var WWW_URL = Config.WWW_URL || 'my-default-web-url.biz';
var FONT = Config.FONT || 'Helvetica';
var NAVBAR_HEIGHT = Config.NAVBAR_HEIGHT || 64;
var ENABLE_FUN = Boolean(Config.ENABLE_FUN);  // undefined
```

With the following `.env`:

```
API_URL=foo
WWW_URL=bar
FONT=baz
NAVBAR_HEIGHT=65
```

into this

```
import Config from 'react-native-config';

var API_URL = 'foo' || 'api.my-default-url.com';
var WWW_URL = 'bar' || 'my-default-web-url.biz';
var FONT = 'baz' || 'Helvetica';
var NAVBAR_HEIGHT = '65' || 64;
var ENABLE_FUN = Boolean(undefined);  // undefined
```

## Setup

I will run through the setup of this plugin in a fresh React Native project using React Native 0.41.2.

```
react-native init TestPlugin
cd TestPlugin
npm install --save react-native-config
npm install --save-dev babel-plugin-react-native-config
```

Create `.env` with

```
API_URL=hello
```

And update `.babelrc` to have

```
{
  "presets": [
    "react-native"
  ],
  "env": {
    "development": {
      "plugins": [
         ["babel-plugin-react-native-config", { envfile: ".env" }]
      ]
    }
  }  
}
```

Note that the `path` config option is a problem because the filesystem lookup is relative to the working directory of the react-native package manager, which can be different depending on your setup. For example, when running `react-native run-ios`, the packager runs in `node_modules/react-native/packager`, which seems like a bad design decision to me, but I don't work for an organization bent on world domination, so what do I know? If you run the packager manually, i.e. via `react-native start` (which is the only way to get command line flags into the packager), the working directory will be different.

So after all that tofu, this plugin will start by looking for the `.env` file in the current working directory, whatever that is. If it's not found, it will recursively look in parent directories until either

 1. The root of the filesystem is reached.
 2. A directory containing `.babelrc` is found.
 3. A file contianing `.env` is found.

You can override the `.babelrc` setting by putting `ENVFILE` in the environment of the process running babel.

Now modify `index.ios.js` to include

```
import Config from 'react-native-config';

...

export default class TestPlugin extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          API_URL = { Config.API_URL }
        </Text>
      </View>
    );
  }
}
```

And then run `react-native run-ios` to see `hello` show up in the simulator.

Now change the variable in `.env`, and refresh the code. Uh oh! It didn't change! This is because the react-packager only watches for javascript code changes before re-transpiling. Until I can figure out [a principled way](http://stackoverflow.com/questions/42212314/tell-react-native-packager-to-watch-a-non-javascript-file) to re-transpile when a specific file changes, you have to change both `.env` and the file that imports `react-native-config`. Adding or removing a blank line will do the trick.

## Tests

As of now the tests are manual, because this project is still a work in progress. To test, run `babel` manually, or use one of my provided test source files in `tests`. If unit testing in javascript weren't so awful, I'd consider writing automated tests. But as it stands this is the simplest and clearest way to see what the plugin actually does to code. If you disagree, we can take it outside.

```
babel --plugins "../index.js" tests/test3.js -o tests/test3.out.js
```
