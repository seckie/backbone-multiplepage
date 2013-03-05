/**
 * $.fn.preloadImg
 *
 * @author     RaNa design associates, inc.
 * @author     Naoki Sekiguchi
 * @url        http://ranagram.com/
 * @url        http://likealunatic.jp/
 * @copyright  2012 RaNa design associates, inc.
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @version    Release: 1.1
 * @since     2012-03-28 22:04:15
 */

;(function($, window, document, undefined) {

$.fn.preloadImg = function (options) {
	var opt = options || {};
	this.each(function (i, element) {
		opt.element = $(element);
		$(element).data('preloadImg', new PreloadImg(opt));
	});
	return this;
};
function PreloadImg() {
	// extend default options
	this.options = {};
	$.extend(this.options, this.defaultOptions, arguments[0]);
	this.element = this.options.element;
	// initialize
	this._create();
}
PreloadImg.prototype = {
	defaultOptions: {
		srcs: [],
		interval: 100,
		complete: function () { }
	},
	_create: function () {
		this.timer = {};
		if (this.options.srcs.length === 0) {
			// load images in document mode.
			this._loadImgInDocument();
		} else {
			// load specified images mode.
			this._loadSpecifiedImg();
		}
	},
	_loadImgInDocument: function () {
		var self = this;
		var imgHolder = [];
		this.element.find('img').each(function (i, img) {
			var src = $(img).attr('src');
			if (src) {
				imgHolder.push(img);
			}
		});
		this._checkLoaded(imgHolder);
	},
	_loadSpecifiedImg: function () {
		var self = this;
		var imgHolder = [];
		$.each(this.options.srcs, function (i, src) {
			var img = $('<img/>', {
				src: src
			}).css({
				'position': 'absolute',
				'visibility': 'hidden',
				'width': 0,
				'height': 0
			}).appendTo(self.element);
			imgHolder.push(img[0]);
		});
		this._checkLoaded(imgHolder, true);
	},
	_checkLoaded: function (imgHolder, resetDOM) {
		var self = this;
		var checked = [];
		$.each(imgHolder, function (i, img) {
			if (img.complete) {
				checked.push(img);
			}
		});
		if (imgHolder.length === checked.length) {
			clearTimeout(this.timer);
			if (resetDOM) {
				this._resetImgStyle(imgHolder);
			}
			this.options.complete(imgHolder);
		} else {
			setTimeout(function () {
				self._checkLoaded(imgHolder, resetDOM);
			}, this.options.interval);
		}
	},
	_resetImgStyle: function (imgHolder) {
		$.each(imgHolder, function (i, img) {
			$(img).css({
				'position': '', 'visibility': '', 'width': '', 'height': ''
			}).remove();
		});
	}
};

})(jQuery, this, this.document);
