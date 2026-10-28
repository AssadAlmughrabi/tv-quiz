/**
 * Entry for the web build (LG webOS, Samsung Tizen, desktop browser).
 */
import { AppRegistry } from 'react-native';
import App from 'app/app';
import { fitToWindow } from 'core/platform/fit-to-window';
import { name as appName } from './app.json';

const root = document.getElementById('root');
fitToWindow(root);

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, { rootTag: root });
