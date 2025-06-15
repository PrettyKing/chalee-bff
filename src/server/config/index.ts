import _ from 'lodash';
import devConfig from './dev';
import prodConfig from './prod';

let config = {
  port: 8081,
  memoryFlag: false,
};
const env = process.env.NODE_ENV || 'development';
if (env === 'production') {
  config = _.merge(config, prodConfig);
} else {
  config = _.merge(config, devConfig);
}

export default config;
