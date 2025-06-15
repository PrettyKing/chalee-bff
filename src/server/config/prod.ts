import { join } from "path";

export default {
    port: 8082,
    memoryFlag: 'memory',
    viewDir: join(__dirname, '../web/'),
    staticDir: join(__dirname, '../web/'),
};