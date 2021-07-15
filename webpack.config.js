const path = require('path');


// setup webpack using the ts-loader
module.exports = [
{
    name: 'lib',
    devtool: "eval-source-map", // just source-map is slower, but nicer
    entry: "./src/lib.ts", 
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'src')]
            }
        ]
    },
    resolve : {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'lib.js',
        path: path.resolve(__dirname, 'build')
    },
    // devServer: {
    //     filename: 'lib.js',
    //     lazy: true,
    //     contentBase: path.join(__dirname, 'build'),
        
    //     // publicPath: "src",
        
    //     // path: path.resolve(__dirname, 'build'),
        
    //     // compress: true,
    //     // hot: true
    // }
}];