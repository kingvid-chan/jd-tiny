#!/usr/bin/env node --harmony

const opn = require('opn');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const express = require('express');
const program = require('commander');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const shell = require('shelljs');
const gutil = require('gulp-util');
const bodyParser = require('body-parser');
const archiver = require('archiver');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var des = req.body[file.fieldname];
        if (Array.isArray(des)) {
            des = des[des.length - 1];
        }
        des = des.replace(/\/[^\/]*$/, '');
        var home = path.resolve(__dirname, './projects/'),
            dir = path.resolve(__dirname, './projects/', des);

        if (!fs.existsSync(home)) {
            fs.mkdirSync(home);
        }
        if (!fs.existsSync(dir)) {
            shell.mkdir('-p', dir);
        }
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, '_static')));

program
    .version('0.0.1')
    .parse(process.argv);
// 定义下载文件名
var folderName = 'project';

app.get('/', function(req, res, next) {
    res.sendFile('index.html', { root: __dirname });
})
app.post('/upload', upload.fields([{ name: 'html' }, { name: 'images' }, { name: 'css' }, { name: 'js' }]), function(req, res, next) {
    var uploadImg = require('./_src/uploadImg').upload,
        replaceUrl = require('./_src/replaceUrl'),
        homeDir = '';

    for (var p in req.body) {
        if (Array.isArray(req.body[p])) {
            homeDir = req.body[p][0].replace(/\/.*$/, '');
        } else {
            homeDir = req.body[p].replace(/\/.*$/, '');
        }
        break;
    }

    //删除projects文件夹
    shell.rm('-rf', path.resolve(__dirname, './build'));
    //上传图片
    upload(homeDir);

    function upload(homeDir) {
        uploadImg({
            homeDir: homeDir
        }).then(function() {
            //替换图片url
            replaceUrl().then(function() {
                //替换完成...
                console.log(chalk.yellow('替换完毕！'));
                folderName = homeDir;
                //删除projects文件夹
                shell.rm('-rf', path.resolve(__dirname, './projects'));

                console.log(chalk.blue('打包完成'));
                res.send({ success: true, message: '打包完成' });
            });
        }).catch(function(err) {
            console.log(chalk.red('打包出错'));
            res.send({ success: false, message: err?err.toString():'打包出错'});
        });
    }
});
app.get('/download', function(req, res, next) {
    res.set('Content-Type', 'application/zip')
    res.set('Content-Disposition', 'attachment; filename=' + folderName + '.zip');
    var copyFrom = path.resolve(__dirname, "./build/project"),
        copyTo = path.resolve(__dirname, folderName + '.zip');

    // create a file to stream archive data to.
    var archive = archiver('zip', {
        zlib: { level: 9 }
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(res);
    // archive.pipe(output);
    // append files from a directory 
    archive.directory(copyFrom, false);
    // finalize the archive (ie we are done appending files but streams have to finish yet) 
    archive.finalize();
});
app.listen(8088, function() { console.log('Local Server is running on port 8088 !'); });

if (program) {
    opn('http://localhost:8088');
}