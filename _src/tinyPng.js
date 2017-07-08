const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const tinify = require("tinify");
const low = require('lowdb');
const tinyKeys = low(path.resolve(__dirname, '../_db/tinyPngKeys.json')).get('keys').value();

function tiny(index, _path, filename, Resolve) {
	if (!fs.existsSync(path.resolve(__dirname, _path, '../img'))) {
		fs.mkdirSync(path.resolve(__dirname, _path, '../img'), 0777);
	}
    tinify.key = tinyKeys[index].key;
    return new Promise((resolve, reject) => {
        tinify.validate((err) => {
            let compressionsThisMonth = tinify.compressionCount;
            // Validation of API key failed.
            if (err || compressionsThisMonth >= 500) {
                //  当前账户当月已压缩超出500数量的图片
                // console.log(chalk.yellow(tinyKeys[index].key, '压缩额度已用完'))
                index++;
                tiny(index, _path, filename, Resolve ? Resolve : resolve);
            } else {
                tinify.fromFile(path.resolve(__dirname, _path, filename)).toFile(path.resolve(__dirname, '../build/img/', filename), function(err){
                    if (err) {
                        console.log(chalk.red(err));
                        index++;
                        tiny(index, _path, filename, Resolve ? Resolve : resolve);
                    }else{
                        console.log(chalk.green(filename, '压缩成功'));
                        resolve(index);
                        Resolve && Resolve(index);
                    }
                });
            }
        });
    });
}

module.exports = tiny;
