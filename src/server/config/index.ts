import _ from 'lodash';
import devConfig from './dev';
import prodConfig from './prod';
import { join } from 'path';

let config = {
  port: 8081,
  memoryFlag: false,
  viewDir: join(__dirname, '../../../dist/web/'),
  staticDir: join(__dirname, '../../../dist/web/'),

};
const env = process.env.NODE_ENV || 'development';
if (env === 'production') {
  config = _.merge(config, prodConfig);
} else {
  config = _.merge(config, devConfig);
}

export default config;
