#!/usr/bin/env node
// 生产环境启动脚本 - 精简版
process.env.NODE_ENV = 'production';
console.log('🚀 启动生产服务器 (端口: 8082)');
console.log('📁 配置: 生产环境 (内联配置)');
require('./app.js');
