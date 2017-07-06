var path = require('path'),
    webpack = require('webpack'),
    UglifyJSPlugin = require('uglifyjs-webpack-plugin'),
    fileListPlugin = require('./fileListPlugin');

module.exports = function(env) {
    return {
        entry: './webpack.entry',
        output: {
            filename: 'js/[name]_bundle.js',
            chunkFilename: "js/[name]_chunk.js",
            path: path.resolve(__dirname, '../build'),
            publicPath: '/'
        },
        context: __dirname,
        module: {
            rules: [{
                test: /\.scss$/,
                use: [
                    'file-loader?name=project/css/[name].css',
                    'extract-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }, {
                test: /\.css$/,
                use: [
                    'file-loader?name=project/css/[name].css',
                    'extract-loader',
                    'css-loader'
                ]
            }, {
                test: /\.(jpg|png)$/,
                use: [
                    'file-loader?name=cacheImg/[hash:15]_[name].[ext]'
                ]
            }, {
                test: /\.html$/,
                use: [
                    'file-loader?name=project/[name].[ext]',
                    'extract-loader',
                    'html-loader'
                ]
            }, {
                test: /\.js$/,
                exclude: /.entry.js/,
                loader: 'file-loader?name=project/js/[name].[ext]'
            },{
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }]
        },
        plugins: [
            new fileListPlugin(),
            new UglifyJSPlugin()
        ],
        resolve: {
            extensions: ['.js', '.css', '.scss', '.html']
        }
    }
}
