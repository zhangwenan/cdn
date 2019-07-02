'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/cdn/', controller.home.index);
  router.get('/cdn/:pkg', controller.package.info);
};
