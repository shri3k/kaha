var path = require('path');
var basePath = path.resolve(__dirname, '../' + '/public');
var webpack = require('webpack');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
	context: basePath,
	entry: './js/bootstrap.js',
	output: {
		path: basePath + '/dist/js',
		filename: 'bundle.min.js'
	},
	module: {
		loaders: [
			{ test: /\.html$/, loader: 'raw', exclude: /node_modules/ }
		]
	},
	'uglify-loader': {
   		 mangle: false
	},
	devtool: 'sourcemap',
	plugins: [
			new webpack.optimize.OccurenceOrderPlugin(),
			new ngAnnotatePlugin({ add: true }), 
			new webpack.optimize.UglifyJsPlugin(),
			new webpack.DefinePlugin({ ENV: JSON.stringify(process.env.NODE_ENV) })
	]		
};