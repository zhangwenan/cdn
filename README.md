#   卖好车CDN
为卖好车内部前端提供CDN检索服务。规范开源项目的使用，统一引入方式和资源版本。

##  如何新增资源

以新增`jquery@1.12.0`为例，步骤如下:
1. 拉取当前项目`git@git.dawanju.net:mhc-fe/infrastructure/cdn.git`
2. 创建分支`hotfix/<Your Name>_<Lib Info>_<DateTime>`, 比如: `hotfix/wenan_jquery1.12.0_20181213`
3. 切换到新分支, 在`ajax/libs/`目录下, 创建`jquery/1.12.0`目录。
4. 执行如下命令:

```
cd ajax/libs/jquery
touch .gitkeep
touch 1.12.0/.gitkeep
```
5. 将`jquery/.gitkeep`和`jquery/1.12.0/.gitkeep`文件提交
6. 创建`Merge Requests`, 指定给项目Owner:`文安`合并代码。
7. 代码合并后，项目Owner依次执行`npm run sync`和`npm run qiniu`, 完成资源更新。
8. 修改`home.nj`和`package.nj`页面中的`build`版本号，更新浏览器缓存
9. **不允许直接在master上操作!!!**

##  关于资源更新
可以参考: <./qshell-v2.3.4/README.md>

##  特别感谢
感谢各位贡献代码，提供修改意见
*   [奔腾](https://git.dawanju.net/benteng)

##  其他说明

首页的展示的三方库, 是根据本项目中收录的三方库, 按照stars数量排序，选取前10进行展示。

另外，卖好车CDN不会收录所有CDN，只收录公司项目中常用的三方库资源，且只收录稳定运行或经过测试的版本。其他情况，由前端团队审议通过方可使用。



##  项目开发

本项目采用egg.js脚手架生成。开发阶段参考:

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### 部署

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.

