var config = require('config');
var dbConfig = config.get('qiniu');

var fs = require('fs');
const axios = require('axios');
const prettier = require('prettier');



const API_BASE_PATH = 'https://api.cdnjs.com';
// 同步静态资源的操作，并生成最新的`index.libs.json`文件, 上传到七牛。
console.log(dbConfig);


function updateAssetsFile(original_assets, new_assets){
    for(var i=0; i<original_assets.length; i++){

        for(var j=0; j<new_assets.length; j++){
            if(original_assets[i].version == new_assets[j].version){
                original_assets[i].files = new_assets[j].files;
            }
        }
    }
    return original_assets;
}

function getFilesByVersion(version, assets){
    let files = [];
    for(var i=0; i<assets.length; i++){
        if(assets[i].version == version){
            files = assets[i].files;
        }
    }
    return files;
}

function renderLibJson(){
    // [ ["jquery", "JavaScript library for DOM operations", 50048] , ... ]
    var indexPkgs = require(`${__dirname}/app/public/json/index.libs.json`);
    var scanPkgs = getScanPackages(`${__dirname}/ajax/libs`);
    var originalPkgs = require(`${__dirname}/app/public/json/pkgs.mhc.json`);

    var diff_pkgs = getDiffPkgs(scanPkgs, originalPkgs);
    console.log(`差异的包有: ${JSON.stringify(diff_pkgs)}`)
    async function loadFromBootCDN(){
        for (const pkg_name in diff_pkgs) {
            if (diff_pkgs.hasOwnProperty(pkg_name)) {
                var api = `${API_BASE_PATH}/libraries/${pkg_name}`;
                console.log(diff_pkgs[pkg_name])
                let assets = [...diff_pkgs[pkg_name].assets];

                let res = await axios.get(api);
                
                // let assets = pkgs[pkg_name].assets;
                //originalPkgs[pkg_name].assets = updateAssetsFile(assets, res.data.assets);

                diff_pkgs[pkg_name].assets = [];

                
                assets.forEach((item, idx)=>{
                    // todo: 版本号可能会查不到，因为太新了，未必稳定
                    item.files = getFilesByVersion(item.version, res.data.assets);
                    originalPkgs[pkg_name] = originalPkgs[pkg_name] || {};
                    originalPkgs[pkg_name].assets = originalPkgs[pkg_name].assets || [];
                    originalPkgs[pkg_name].assets.push(item);

                    diff_pkgs[pkg_name] = diff_pkgs[pkg_name] || {};
                    diff_pkgs[pkg_name].assets = diff_pkgs[pkg_name].assets || [];
                    diff_pkgs[pkg_name].assets.push(item);
                })
                
                originalPkgs[pkg_name].stars = res.data.stars;
                originalPkgs[pkg_name].homepage = res.data.homepage || '';
                originalPkgs[pkg_name].repository = res.data.repository || null;
                originalPkgs[pkg_name].description = res.data.description || '';
                originalPkgs[pkg_name].keywords = res.data.keywords || '';
                
                diff_pkgs[pkg_name].stars = originalPkgs[pkg_name].stars;
                diff_pkgs[pkg_name].homepage = originalPkgs[pkg_name].homepage;
                diff_pkgs[pkg_name].repository = originalPkgs[pkg_name].repository;
                diff_pkgs[pkg_name].description = originalPkgs[pkg_name].description;
                diff_pkgs[pkg_name].keywords = originalPkgs[pkg_name].keywords;

                let found = false;
                for(var i=0; i< indexPkgs.length; i++){
                    if(indexPkgs[i][0] == pkg_name){
                        let pkg = originalPkgs[pkg_name];
                        indexPkgs[i][1] = pkg.description;
                        indexPkgs[i][2] = pkg.stars;
                        found = true;
                    }
                }

                if(!found){
                    const pkg = diff_pkgs[pkg_name];
                    let p = [];
                    p.push(pkg_name);
                    p.push(pkg.description);
                    p.push(pkg.stars);
                    indexPkgs.push(p);
                }
            }
        }
    }

    loadFromBootCDN().then(()=>{

        console.log(`index`, indexPkgs)
        

        // index.libs.json，用于首页的搜索
        // 格式:  [
        //    ['lib', 'this is good', 100 ],
        //    ["jquery","JavaScript library for DOM operations",0]
        // ]
        fs.writeFile(`${__dirname}/app/public/json/index.libs.json`, prettyCode(indexPkgs));


        // pkgs.mhc.json，用于详情页面的展示
        // 格式: {"jquery":{"assets":[{"version":"1.12.0","files":[]}],"description":"DOM operations","stars":0}}
        fs.writeFile(`${__dirname}/app/public/json/pkgs.mhc.json`, prettyCode(originalPkgs));

        saveDiffLibPath(diff_pkgs);
    })
}
renderLibJson();



/**
 * 返回有变化的pkg
 * 格式: {  "jquery":{"assets":[{"version":"1.5.0","files":[]}]}    }
 * @param {*} pkgs
 * Todo: 目前没有考虑到删除文件夹的情况
 */
function getDiffPkgs(pkgs, original_pkgs){
    var diff_pkgs = {};
    
    for (const pkg_name in pkgs) {
        
        // 原json不存在
        if (!original_pkgs.hasOwnProperty(pkg_name)) {
            const element = pkgs[pkg_name];
            diff_pkgs[pkg_name] = element;
        }
        // 原json，新json都存在，对比版本
        else if(pkgs.hasOwnProperty(pkg_name)){
            
            let element = pkgs[pkg_name];

            let ret_item = Object.create(element);
            ret_item.assets = [];

            let assets = element.assets;
            let original_assets = original_pkgs[pkg_name].assets;
            
            assets.forEach((item, idx)=>{
                let found = false
                original_assets.forEach((item2, idx2)=>{
                    if(item.version == item2.version){
                        found = true;
                    }
                })

                if(!found) ret_item.assets.push(item);
            })
            if(ret_item.assets.length > 0) diff_pkgs[pkg_name] = ret_item;
        }
    }
    return diff_pkgs;
}

function is_assets (file, ext_arr) {
    var file_suffix = ext_arr;
    
	var reg_str = '';
	for(var i=0; i<file_suffix.length; i++){
		reg_str += '\\.' + file_suffix[i] + '[^\/]*$|';
	}
	reg_str = reg_str.substr(0, reg_str.length - 1);
	
	var reg = new RegExp(reg_str, 'ig');
	return reg.test(file);
}

function isPackageJson(file){
    return is_assets(file, ['json']) && /\/package\.json/.test(file);
}

function trimPath(path){
    return path.replace(`${__dirname}/ajax/libs/`, "");
}


function getScanPackages(path){
    var pkgs = {};
    var fileList = [],
        folderList = [],
        walk = function(path, fileList, folderList){
            files = fs.readdirSync(path);
            files.forEach(function(item) {  
            	var tmpPath = path + '/' + item,
	                    stats = fs.statSync(tmpPath);

                if (stats.isDirectory()) {  
                    walk(tmpPath, fileList, folderList); 
                    
                    var trimed_path = trimPath(tmpPath);
                    var matches = trimed_path.match(/\//ig);
                    if(matches && matches.length == 1){
                        var pkg_info = trimed_path.split('/');
                        var pkg_name = pkg_info[0];
                        var pkg_version = pkg_info[1];
                        pkgs[pkg_name] = pkgs[pkg_name] || {
                            assets: []
                        };
                        pkgs[pkg_name].assets.push({
                            version: pkg_version,
                            files: []
                        });
                        
                    }
                }
                else if(isPackageJson(tmpPath)){
                    var trimed_path = trimPath(tmpPath);
                    var pkgJson = require(tmpPath);
                    var pkg_name = pkgJson.name;
                    if(!pkg_name) throw new Error('包名不能为空')
                    pkgs[pkg_name] = pkgs[pkg_name] || {
                        assets: []
                    };
                    pkgs[pkg_name].description = pkgJson.description || '';
                    pkgs[pkg_name].stars = pkgJson.stars || 0;
                }
            });  
        };  

    walk(path, fileList, folderList);

    return pkgs;
}

function saveDiffLibPath(diff_pkgs){
    // 格式: {  "jquery":{"assets":[{"version":"1.5.0","files":[]}]}    }
    // https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js
    // 
    if(diff_pkgs.length <= 0) return false;
    var sourcePath = 'https://cdnjs.cloudflare.com';
    var ret = '';
    for (const pkg_name in diff_pkgs) {
        if (diff_pkgs.hasOwnProperty(pkg_name)) {
            const pkg = diff_pkgs[pkg_name];
            for(var i=0; i<pkg.assets.length; i++){
                let version = pkg.assets[i].version;
                let files = pkg.assets[i].files;
                for(var j=0; j<files.length; j++){
                    ret += `${sourcePath}/ajax/libs/${pkg_name}/${version}/${files[j]}`;
                    ret += '\r\n';
                }
            }
        }
    }
    
    ret += 'end\r\n';
    fs.writeFile(`${__dirname}/data/links.txt`, ret);
}


function prettyCode(code){
    var ret = ''
    if(typeof code == 'string'){
        ret = code;
    }
    else{
        ret = JSON.stringify(code);
    }
    return prettier.format(ret, { parser: 'json'});
}