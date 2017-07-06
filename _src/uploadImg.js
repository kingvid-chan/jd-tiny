const webpack = require('webpack');
const webpack_config = require('./webpack.config')('dev');
const request = require('request');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const gutil = require('gulp-util');
const tiny = require('./tinyPng');
const low = require('lowdb');
const IMGFilesList = low(path.resolve(__dirname, '../_db/imgFilesList.json'));
//IMGFilesList文件默认参数
IMGFilesList.defaults({ imgFilesList: [] }).write();

var tinyKeyIndex = 0;

module.exports.upload = function(params) {
    var homeDir = params.homeDir,
        _path = path.resolve(__dirname, '../projects/' + homeDir),
        entryText = [
            'var requireContext = require.context("' + _path + '", true, /\.(css|html|js|scss)$/i);',
            'requireContext.keys().forEach(function(key){requireContext(key);});'
        ].join('\n');

    return new Promise(function(Resolve, Reject) {
        console.log(chalk.blue('正在生成发布目录...'));
        fs.writeFile(path.resolve(__dirname, './webpack.entry.js'), entryText, function(err) {
            if (err) { console.log(err); } else {
                webpack(webpack_config, function(err, stats) {
                    gutil.log('[webpack:build]', stats.toString({
                        chunks: false,
                        colors: true
                    }));
                    if (err) {
                        throw new gutil.PluginError('webpack:build', err);
                    } else {
                        console.log(chalk.blue('生成目录完成...'));
                        fs.readFile(path.resolve(__dirname, '../build/fileslist.md'), 'utf-8', function(err, imgList) {
                            if (err) { console.log(err); }
                            imgList = JSON.parse(imgList);
                            imgLength = imgList.length;
                            if (imgLength === 0) {
                                console.log(chalk.green('检测到没有图片更新'));
                                Resolve();
                            } else {
                                imgList.forEach(function(imgObj) {
                                    //查询是否已上传过该图片
                                    var search = IMGFilesList.get('imgFilesList').find({ hash: imgObj.hash }).value();
                                    if (search) {
                                        //判断用户是否给图片修改了名称
                                        if (search.imgName !== imgObj.imgName) {
                                            IMGFilesList.get('imgFilesList').find({ hash: imgObj.hash }).assign({ imgName: imgObj.imgName }).write();
                                        }
                                        console.log(chalk.blue('already uploaded: ' + imgObj.imgName));
                                        imgLength--;
                                        if (imgLength === 0) {
                                            console.log(chalk.green('所有的图片已上传完毕！'));
                                            Resolve();
                                        }
                                    } else {
                                        tiny(tinyKeyIndex, '../build/cacheImg/', imgObj.hashName).then(function(result){
                                            tinyKeyIndex = result;
                                            upload(imgObj).then(function() {
                                                console.log(chalk.green('所有的图片已上传完毕！'));
                                                Resolve();
                                            });
                                        })
                                    }
                                });
                            }

                            //图片上传接口
                            function upload(imgObj) {
                                return new Promise(function(resolve, reject) {
                                    var r = request.post('http://10.187.139.235/util/upload.action', function optionalCallback(err, httpResponse, body) {
                                        if (err) {
                                            console.error(chalk.red('upload error: ' + imgObj.imgName));
                                            console.error(chalk.red(err));
                                        }
                                        if (body) {
                                            var result = JSON.parse(body);
                                            if (typeof result == 'object') {
                                                for (var filename in result) {
                                                    IMGFilesList.get('imgFilesList').remove({ imgName: imgObj.imgName }).write();
                                                    IMGFilesList.get('imgFilesList').push({ "imgName": imgObj.imgName, "url": result[filename], "hash": imgObj.hash }).write();
                                                    console.log(chalk.green('uploaded image:', imgObj.imgName, 'success!'));
                                                }
                                            }else{
                                                console.log(chalk.bold.red('上传图片', imgObj.imgName, '失败!'));
                                            }
                                            imgLength--;
                                        } else{
                                            Reject();
                                        }
                                        //判断图片队列是否已全部上传过
                                        if (imgLength === 0) {
                                            resolve();
                                        }
                                    });
                                    var form = r.form();
                                    form.append('upload', fs.createReadStream(path.resolve(__dirname, '../build/img/' + imgObj.hashName)));
                                    console.log('uploading: ' + imgObj.imgName);
                                });
                            }
                        });
                    }
                });
            }
        });
    });
};

module.exports.IMGFilesList = IMGFilesList;
