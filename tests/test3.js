import Config from 'react-native-config';

var API_URL = Config.API_URL || 'api.my-default-url.com';
var WWW_URL = Config.WWW_URL || 'my-default-web-url.biz';
var defaultFun = true;
var ENABLE_FUN = Config.ENABLE_FUN.charAt(0) in ['1', 't', 'T'] ? true : defaultFun; // watch out for undefined
var NAVBAR_HEIGHT = parseInt(Config.NAVBAR_HEIGHT) || 64;
