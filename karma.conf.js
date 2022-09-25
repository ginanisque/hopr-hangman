const webpack = require('webpack');
const webpackConfigFile = require('./node_modules/react-scripts/config/webpack.config.js');

module.exports = function(config) {
    let webpackConfig = {};
    {
        const { target, stats, mode, bail, devtool, entry, output, cache, infrastructureLogging,
            optimization, resolve, module, plugins, } = webpackConfigFile("development");

        webpackConfig = {
            target, stats, mode, bail, devtool, entry, cache, infrastructureLogging,
            optimization, resolve, 
            plugins: [plugins[0], plugins[1], plugins[3]]
            // plugins
        }
    }

    config.set({
        browsers: [ 'Chrome' ], //run in Chrome
        singleRun: false,
        frameworks: [ 'webpack', 'mocha' ], //use the mocha test framework
        files: [
            'tests.webpack.js' //just load this file
        ],
        browserNoActivityTimeout: 10000,
        plugins: [
            'karma-mocha',
            'karma-webpack',
            'karma-babel-preprocessor',
            'karma-sourcemap-loader',
            'karma-chrome-launcher',
        ],
        preprocessors: {
            'tests.webpack.js': [ 'webpack', 'sourcemap' ], //preprocess with webpack and our sourcemap loader
        },
        // reporters: [ 'dots' ], //report results in this format
        reporters: ['progress'],

        webpack: webpackConfig,
        webpackServer: {
            noInfo: true //please don't spam the console when running in karma!
        }
    });
}
