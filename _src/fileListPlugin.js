function FilesListPlugin(options) {
    this.options = options;
}

FilesListPlugin.prototype.apply = function(compiler) {
    compiler.plugin('emit', function(compilation, callback) {
        var fileslist = [],
            fileDependencies = compilation.fileDependencies;
        for (var filename in compilation.assets) {
            if (filename.indexOf('cacheImg/')===0) {
                for (var i = 0; i < fileDependencies.length; i++) {
                    if (new RegExp(filename.slice(25)).test(fileDependencies[i])) {
                        fileslist.push({
                            imgName: filename.slice(25),
                            hash: filename.slice(9, 24),
                            hashName: filename.slice(9)
                        });
                        fileDependencies.splice(i,1);
                        break;
                    }
                }
            }
        }
        compilation.assets['fileslist.md'] = {
            source: function() {
                return JSON.stringify(fileslist, null, 4);
            },
            size: function() {
                return fileslist.length;
            }
        };
        
        callback();
    });
};

module.exports = FilesListPlugin;
