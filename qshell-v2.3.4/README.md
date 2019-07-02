
##  七牛的上传

可以使用七牛官方工具，直接拉取网络上的资源。
文档地址: [qshell](https://github.com/qiniu/qshell/blob/master/docs/batchfetch.md)

##  操作步骤

1. 下载`qshell_darwin_x64`到`/qshell-v2.3.4`目录下,建议使用`v2.3.4`,此版本亲测可用。[下载地址](http://img.4455q.com/qshell_darwin_x64)
2. 根据七牛官方文档配置`ACCESS_KEY`和`SECRET_KEY`
3. 运行`npm run qiniu`

##  其他说明

运行`npm run qiniu`相当于运行以下命令.

`./qshell-v2.3.4/qshell_darwin_x64 batchfetch maihaoche -i ./data/links.txt --success-list ./data/fetch_success.txt --failure-list ./data/fetch_failure.txt`

