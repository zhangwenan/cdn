'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    // this.ctx.body = 'hi, egg';
    let pkg_map = require('../public/json/pkgs.mhc.json');

    let pkg_arr = [];
    for (const pkg_name in pkg_map) {
      if (pkg_map.hasOwnProperty(pkg_name)) {
        let pkg = pkg_map[pkg_name];
        pkg.name = pkg_name;
        pkg_arr.push(pkg);
      }
    }
    let topLibs = pkg_arr.sort((pkg1, pkg2)=>{
      if(pkg1.stars > pkg2.stars){
        return -1;
      }
      else if(pkg1.stars < pkg2.stars){
        return 1;
      }
      else{
        return 0
      }
    });
    topLibs = topLibs.slice(0,10);
    await this.ctx.render('home.nj', {
      topLibs,
      app_config: this.ctx.app.config,
      total: pkg_arr.length
    });
  }
}

module.exports = HomeController;
