import { join } from "path";

export default {
    port: 8081,
    viewDir: join(__dirname, '../../../dist/web/'),
    staticDir: join(__dirname, '../../../dist/web/'),
}