const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const outputDir = path.resolve(__dirname, 'dist');

module.exports = {
	entry: {
		'mazegame': './src/index.ts'
	},
	output: {
		filename: '[name].js',
		path: outputDir
	},
	devtool: 'source-map',
	mode: 'none',
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json']
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'awesome-typescript-loader'
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin(['public'])
	],
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				uglifyOptions: {
					mangle: true
				},
				sourceMap: true
			})
		]
	},
	devServer: {
		contentBase: outputDir,
		port: 8080,
		hot: false,
		inline: false
	}
};
