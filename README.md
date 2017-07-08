# jd-tiny
可对一整个项目进行打包，自动处理文件间与图片的依赖关系，并能实现图片压缩、上传、线上链接替换等

## 全局安装
```bash
npm install jd-tiny -g
```

## 教程

在命令行输入`jd-tiny`，会看到本地服务开启的提示，然后浏览器会自动打开`http://localhost:8088`
<div align="center">
	<img src="https://img20.360buyimg.com/cms/jfs/t6661/74/2280245686/36676/539fe2af/59605be3Nf5cd7462.png" width="700">
</div>

选中要打包的项目（记住是一整个项目文件夹），打包完毕之后下载按钮会自动浮现，点击按钮就可以把打包后的项目下载下来了。
操作过程如下：
<div align="center">
	<img src="https://img10.360buyimg.com/cms/jfs/t5983/319/4333636117/228426/90c96145/59605be4N06ce6495.gif" width="700">
</div>
解压完处理完的项目文件夹之后，会看到原先项目中的图片都不见了，并且都转换成了线上https链接，且每张图片都经过了压缩。