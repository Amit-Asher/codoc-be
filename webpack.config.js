const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    /**
     * Mode tells webpack to use its built-in optimizations accordingly.
     * @type {'development' | 'production' | 'none'}
     */
    mode: 'production',

    /**
     * Choose a style for the output information at the end of the build in the terminal.
     * errors/warnings/none
     * see more https://webpack.js.org/configuration/stats/
     * @type {import('webpack').Options.Stats.ToStringOptions}
     */
    stats: 'errors-only',

    node: false,
    entry: './src/server.ts',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'codoc.js'
    },
    resolve: {
        extensions: ["webpack.js", ".web.js", ".ts", ".js", ".json"]
    },
    externals: [
        "pg-native"
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    'ts-loader'
                ]
            },
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: 'javascript/auto'
            },
            {
                test: /\.js$/,
                exclude: [
                    /dist/
                ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                PORT: JSON.stringify(process.env.PORT),
                RUN_MODE: JSON.stringify(process.env.RUN_MODE)
            }
        }),
        new webpack.ProgressPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                './node_modules/swagger-ui-dist/swagger-ui.css',
                './node_modules/swagger-ui-dist/swagger-ui-bundle.js',
                './node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js',
                './node_modules/swagger-ui-dist/favicon-16x16.png',
                './node_modules/swagger-ui-dist/favicon-32x32.png',
            ]
        }),
    ]
}