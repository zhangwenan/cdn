'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1544666634966_7284';

  // add your config here
  config.middleware = [];

  config.view = {
    defaultViewEngine: 'nunjucks',
    defaultExtension: '.nj',
  };

  config.static = {
    prefix: '/cdn/assets/'
    // maxAge: 31536000,
  };

  config.siteInfo = {
    site_name: '卖好车CDN',
    site_desc: '为卖好车内部前端提供开源项目的CDN检索服务。规范开源项目的使用，统一引入方式和资源版本。',

  }

  return config;
};
