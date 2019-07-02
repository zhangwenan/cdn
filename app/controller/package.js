'use strict';

const Controller = require('egg').Controller;

class PkgController extends Controller {
  async info() {
    let pkg_name = this.ctx.params.pkg;
    let pkg_map = require('../public/json/pkgs.mhc.json');
    await this.ctx.render('package.nj', {
      pkg_info: pkg_map[pkg_name],
      pkg_name: pkg_name,
      app_config: this.ctx.app.config
    });
  }
}

module.exports = PkgController;
