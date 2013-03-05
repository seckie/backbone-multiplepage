/**
 * $.MultiplePage
 *
 * @author     Naoki Sekiguchi (RaNa gRam)
 * @url        https://github.com/seckie/Backbone-MultiplePage
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @requires   jQuery.js, Underscore.js, Backbone.js, jQuery.preload.js
 */

(function($, _, Backbone, window, document) {

$.MultiplePage = function (options) {
	this.options = {
		urls: [],
		action: {
			loadComplete: function () {}
		}
	};
	_.extend(this.options, options);
	this.initialize();
};
$.MultiplePage.prototype = {
	initialize: function () {
		var collection = new Pages();
		collection.url = 'pages';
		_.each(this.options.urls, function (url, i) {
			collection.add({ id: (i + 1) + '.html' });
		});

		this.collection = collection;
	},
	load: function (index) {
		var dfd = $.Deferred();
		var model = this.collection.at(index);
		model.fetch({
			dataType: 'html',
			success: function (model, response, options) {
				dfd.resolve(model.get('title'), model.get('body'));
			},
			error: function (model, xhr, options) {
				dfd.reject();
			}
		});
		return dfd.promise();
	}
};

var Page = Backbone.Model.extend({
	parse: function (res) {
		var title, body;
		title = res.slice(res.search(/<title>/), res.search(/<\/title>/));
		title = title.replace('<title>', '');
		body = res.slice(res.search(/<body/), res.search(/<\/body>/));
		body = body.replace(/<body[^>]*>\n?/, '');
		return {
			title: title,
			body : body
		};
	}
});

var Pages = Backbone.Collection.extend({
	model: Page,
	options: {
		urls: [ ],
		adjacentLength: 1
	},
	initialize: function (options) {
		var self = this,
			opt = this.options;
//        _.extend(this.options, options);
//        _.extend(this.action, opt.action);
	},
	comparator: function (model) {
		return parseInt(model.cid.slice(1), 10);
	},
	// interface functions that should be overridden
	action: {
		loadComplete: function () { },
	}
});

})(jQuery, _, Backbone, this, this.document);
