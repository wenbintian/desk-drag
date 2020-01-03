/**
 * Created by twenbin on 2019/9/25.
 */
var webpack = require('webpack');
var path = require("path");
var plugins=[new webpack.NoEmitOnErrorsPlugin()];
if(process.env.NODE_ENV=='production'){
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            drop_console: false//true:删除警告
        },
        comments:false,//true:保留注释
    }));
}
module.exports = {
    entry: "./src/index.js",
    externals: {
        //vue: 'Vue'
        vue:{
            root:'Vue',
            commonjs:'Vue',
            commonjs2:'Vue',
            amd:'Vue'
        }
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: process.env.NODE_ENV=='production'?"zoehisSystemAide.min.js":"zoehisSystemAide.js",
        libraryTarget:"umd",
        library: "ZoehisSystemAide",
    },
    resolve: {
        extensions: ['.js',".vue"]//require 默认请求的js
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            options: {
                "presets": ["es2015", "stage-2"],
                "plugins": ["transform-runtime"]
            }
        },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                exclude: /(node_modules)/
            }]
    },
    plugins:plugins
}