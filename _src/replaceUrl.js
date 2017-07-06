const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const cheerio = require('cheerio');
const IMGFilesList = require('./uploadImg').IMGFilesList;
const imgFilesList = IMGFilesList.get('imgFilesList').value();

module.exports = function(){
	return new Promise(function(Resolve, Reject){
		console.log(chalk.yellow('开始替换图片链接...'));

		getFilePathRecursive(path.resolve(__dirname, '../build/project'),'(css|html)').then(function(results){
		    var tasks = [];
		    results.forEach(function(path){
		    	tasks.push(rewrite(path, imgFilesList));
		    });
    		//所有替换tasks已完成，执行下一步
            Promise.all(tasks).then(function(){
                console.log(chalk.green('替换图片链接完毕！'));
                Resolve();
            });
		}).catch(function(err){
		    console.log(chalk.bold.red(err));
		});
	});
};


function rewrite(filePath, images){
	return new Promise(function(resolve, reject){
		//判断是否是自定义模块，非自定义模块时替换.css文件
		fs.readFile(filePath, 'utf-8', function(err, text){
			if (err) console.log(err);
			else if (new RegExp(/\.css$/i).test(filePath)){
				var imgPathReg = new RegExp(/url\((?!(\/\/|data:|http)).*?\)/g),
					bgImages = text.match(imgPathReg);

				if (bgImages) {
					bgImages.forEach(function(url, index){
						for (var i = 0; i < images.length; i++) {
							var image = images[i],
								str = '_'+image.imgName;
							if (new RegExp(str).test(url)) {
								text = text.replace(url, 'url('+image.url+')');
								break;
							}
						}
					});
				}
			}else{
				var $ = cheerio.load(text, {decodeEntities: false});
				$('img').each(function(){
					var _this = $(this),
						src = _this.attr('src');
					for (var i = 0; i < images.length; i++) {
						var image = images[i];
						if (new RegExp(image.imgName).test(src)) {
							_this.attr('src', image.url);
							break;
						}
					}		
				});
				$("script").each(function(){
					var _this = $(this),
						src = _this.attr('src'),
						srcReg = new RegExp(/^((http)|(\/\/))/g);
					if (src && !srcReg.test(src)) {
						var results = src.replace(/\.js\?.*/g, '.js').match(/[^\/]+\.js$/g);
						results && _this.attr('src', './js/'+results[0]+'?'+Date.parse(new Date()));
					}
				});
				$("link").each(function(){
					var _this = $(this),
						href = _this.attr('href'),
						hrefReg = new RegExp(/^((http)|(\/\/))/g);
					if (href && !hrefReg.test(href)) {
						var results = href.replace(/\.css\?.*/g, '.css').match(/[^\/]+\.css$/g);
						results && _this.attr('href', './css/'+results[0]+'?'+Date.parse(new Date()));
					}
				});
				text = $.html();
			}

			fs.writeFile(filePath, text, function(err){
				if (err) console.log(err);
				else resolve();
			});
		});
	});
}

//在目录中递归读取对应文件格式（.css .js .vm）的文件
function getFilePathRecursive(dir, fileExc) {
    var errMsg = '读取目录' + dir + '下' + fileExc + '文件错误';
    return new Promise(function(resolve, reject){
        if (fs.existsSync(dir)) {
            walk(dir, fileExc, function(err, results){
                if (err) 
                    reject(errMsg);
                else
                    resolve(results);
            });
        } else {
            reject(errMsg);
        }
    });
    
    function walk(dir, fileExc, done) {
        var results = [];
        fs.readdir(dir, function(err, list) {
            if (err) return done(err);
            var i = 0;
            (function next() {
                var file = list[i++];
                if (!file) return done(null, results);
                file = dir + '/' + file;
                fs.stat(file, function(err, stat) {
                    if (stat && stat.isDirectory()) {
                        walk(file, fileExc, function(err, res) {
                            results = results.concat(res);
                            next();
                        });
                    } else {
                        if (new RegExp('\.' + fileExc + '$', 'i').test(file)) {
                            results.push(file);
                        }
                        next();
                    }
                });
            })();
        });
    }
}