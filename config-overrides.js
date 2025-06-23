module.exports = function override(config, env) {
  // 修改开发服务器配置
  if (env === 'development') {
    config.devServer = {
      ...config.devServer,
      allowedHosts: 'all',
      host: 'localhost',
      port: 3000
    };
  }
  return config;
}; 