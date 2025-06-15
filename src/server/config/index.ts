import _ from 'lodash';
import { join } from 'path';

let config = {
  port: 8081,
  memoryFlag: false,
};
if (process.env.NODE_ENV === 'development') {
  let localConfig = {
    port: 8081,
    viewDir: join(__dirname, '../../../dist/web/'),
    staticDir: join(__dirname, '../../../dist/web/'),
  };
  config = _.assignIn(config, localConfig);
}
if (process.env.NODE_ENV === 'production') {
  let prodConfig = {
    port: 8082,
    memoryFlag: 'memory',
    viewDir: join(__dirname, '/web/'),
    staticDir: join(__dirname, '/web/'),
  };
  config = _.assignIn(config, prodConfig);
}

export default config;
