var path = require('path');
var basePath = path.resolve(__dirname, '../' + "/public");
var webpack = require('webpack');

module.exports = {
	context: basePath,
	entry: './js/bootstrap.js',
	output: {
		path: basePath +'/js',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{ test: /\.html$/, loader: 'raw', exclude: /node_modules/ }
		]
	},
	watch: true,
	devtool: 'sourcemap',
	plugins: [new webpack.optimize.OccurenceOrderPlugin(),
						new webpack.DefinePlugin({ ENV: JSON.stringify(process.env.NODE_ENV) })]
};
