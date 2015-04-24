/* InstantPjax 1.0.0 | (C) 2015-2015 Willin Wang | https://github.com/willin/instantpjax */

/*global jQuery*/
(function ($) {
	'use strict';
	$.support.ipjax = window.history && window.history.pushState && window.history.replaceState &&
			// pushState isn't reliable on iOS until 5.
		!navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]\D|WebApps\/.+CFNetwork)/);
	// if localStorage support use localStorage, otherwise save in util.stack
	// 如果支持localStorage,通过localStorage缓存优化减少请求次数,否则存在 util.stack 中
	$.support.storage = !!window.localStorage;

	var util = {
		stack: {},
		getTime: function () {
			return new Date() * 1;
		},
		toInt: function (obj) {
			return parseInt(obj, 10) || 0;
		},
		// 获取URL不带hash的部分,切去掉ipjax=true部分
		getRealUrl: function (url) {
			url = (url || '').replace(/\#.*?$/, '');
			url = url.replace('?ipjax=true&', '?').replace('?ipjax=true', '').replace('&ipjax=true', '');
			return url;
		},
		// 获取url的hash部分
		getUrlHash: function (url) {
			return url.replace(/^[^\#]*(?:\#(.*?))?$/, '$1');
		},
		// 获取本地存储的key
		getLocalKey : function(src) {
			var url = util.getRealUrl(src);
			return 'ipjax_' + encodeURIComponent(url.replace(window.location.origin,''));
		},
		// 清除所有的cache
		removeAllCache: function () {
			if (!$.support.storage)
				return;
			for (var name in localStorage) {
				if ((name.split('_') || [''])[0] === 'ipjax') {
					delete localStorage[name];
				}
			}
		},
		// 获取cache
		getCache: function (src, time, flag) {
			var item;
			var key = util.getLocalKey(src);
			time = util.toInt(time);
			if (key in util.stack) {
				item = util.stack[src];
				if ((item.time + time * 10E3) > util.getTime()) {
					return item;
				} else {
					delete util.stack[src];
				}
			} else if (flag && $.support.storage) { // 从localStorage里查询
				item = localStorage.getItem(key);
				if (item) {
					item = JSON.parse(item);
					item.time = util.toInt(item.time);
					if ((item.time + time * 10E3) > util.getTime()) {
						return item;
					} else {
						localStorage.removeItem(key);
					}
				}
			}
			return null;
		},
		// 设置cache
		setCache: function (src, data, title, flag) {
			var time = util.getTime();
			var key = util.getLocalKey(src);
			util.stack[key] = {
				data: data,
				title: title,
				time: time
			};
			if (flag && $.support.storage) {
				localStorage.setItem(key, JSON.stringify(util.stack[key]));
			}
		},
		// 清除cache
		removeCache: function (src) {
			var key = util.getLocalKey(src);
			delete util.stack[key];
			if ($.support.storage) {
				localStorage.removeItem(key);
			}
		}
	};

	//ipjax
	var ipjaxFn = function () {

	};

	var ipjax = function (options) {
		return options;
	};

	var ipjaxFallback = function (options) {
		return options;
	};

	var enable = function () {
		$.fn.ipjax = ipjaxFn;
		$.ipjax = ipjax;
		$.ipjax.enable = $.noop;
		/*eslint no-use-before-define:0*/
		$.ipjax.disable = disable;
	};

	var disable = function () {
		$.fn.ipjax = function () {
			return this;
		};
		$.ipjax = ipjaxFallback;
		$.ipjax.enable = enable;
		$.ipjax.disable = $.noop;
	};

	// $(window).bind('popstate')
	if ($.inArray('state', $.event.props) < 0) {
		$.event.props.push('state');
	}
	$.support.ipjax ? enable() : disable();

})(jQuery);
