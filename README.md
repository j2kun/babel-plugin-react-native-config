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
