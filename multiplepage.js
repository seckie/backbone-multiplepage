/**
 * $.MultiplePage
 *
 * @author     Naoki Sekiguchi (RaNa gRam)
 * @url        https://github.com/seckie/backbone-multiplepage
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @requires   jQuery.js, Underscore.js, Backbone.js
 */

(function($, _, Backbone, window, document) {

$.MultiplePage = function (options) {
	this.options = {
		baseUrl: 'pages',
		urls: [],
		adjacentRange: 1,
		action: {
			loadStart: function () {},
			loadComplete: function () {},
			multipleLoadStart: function () { },
			multipleLoadComplete: function () { }
		}
	};
	_.extend(this.options, options);
	_.extend(this.action, options.action);
	this.initialize();
};
$.MultiplePage.prototype = {
	initialize: function () {
		var collection = new Pages();
		collection.url = this.options.baseUrl;
		_.each(this.options.urls, function (url, i) {
			collection.add({
				id: url,
				index: i
			});
		});
		this.collection = collection;
	},
	load: function (index, multiple) {
		if (multiple != true) {
			this.action.loadStart.call(this); // action
		}
		var self = this;
		var dfd = $.Deferred();
		var model = this.collection.at(index);
		if (model.has('body')) {
			// this model is already loaded.
			dfd.resolve(true); // "true" is dupulication state.
		} else {
			model.fetch({
				dataType: 'html',
				success: function (model, response, options) {
					dfd.resolve();
					if (multiple != true) {
						self.action.loadComplete.call(self); // action
					}
				},
				error: function (model, xhr, options) {
					dfd.reject();
				}
			});
		}
		return dfd.promise();
	},
	multipleLoad: function (index) {
		this.action.multipleLoadStart.call(this); // action
		var self = this;
		var dfd = $.Deferred();
		var keys = this._keys(index);
		var loadHolder = [];
		var models = [];
		_.each(keys, function (key, i) {
			var model = self.collection.at(key);
			if (typeof model === 'object') {
				loadHolder.push(self.load(key, true));
				models.push(model);
			}
		});
		$.when.apply(null, loadHolder).done(function () {
			// passing arguments to pass dupulication state
			self.action.multipleLoadComplete.call(self, models, arguments); // action
			dfd.resolve();
		});
		return dfd.promise();
	},
	_keys: function (index) {
		var keys = [index];
		var range = this.options.adjacentRange;
		for (var i=0; i<range; i++) {
			keys.push(index + (-1 * (i + 1)));
		}
		for (var i=0; i<range; i++) {
			keys.push(index + (i + 1));
		}
		keys = keys.sort(function (a, b) {
			return a - b;
		});
		return keys;
	},
	action: { }
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
	comparator: function (model) {
		return parseInt(model.cid.slice(1), 10);
	}
});

})(jQuery, _, Backbone, this, this.document);
