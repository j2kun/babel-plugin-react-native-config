import Config from 'react-native-config';

var API_URL = 'foo' || 'api.my-default-url.com';
var WWW_URL = 'bar' || 'my-default-web-url.biz';
var defaultFun = true;
var ENABLE_FUN = undefined.charAt(0) in ['1', 't', 'T'] ? true : defaultFun; // watch out for undefined
var NAVBAR_HEIGHT = parseInt('65') || 64;
