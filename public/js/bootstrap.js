require('./app');

/**
 * Pull in the controllers.
 */
require('./controllers/base.js');
require('./controllers/app.js');
var controllers = require.context('./controllers', true, /.js$/);
controllers.keys().forEach(function(controller) {
	if(controller !== './base.js' || controller !== './app.js') {
		require('./controllers/' + controller.slice(2));
	}
});

require('./services');
require('./plexusSelect');
