/* Instantipjax 1.0.4 | (C) 2015-2015 Willin Wang | https://github.com/willin/instantipjax */

(function ($) {
	'use strict';
	$.support.ipjax = window.history && window.history.pushState && window.history.replaceState &&
			// pushState isn't reliable on iOS until 5.
		!navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]\D|WebApps\/.+CFNetwork)/);
	// if localStorage support use localStorage, otherwise save in util.stack
	// 如果支持localStorage,通过localStorage缓存优化减少请求次数,否则存在 util.stack 中
	$.support.storage = !!window.localStorage;

	var Util = {
		isPreloading: false,
		prevKey: '',
		stack: {},
		toInt: function (obj) {
			return parseInt(obj);
		},
		getTime: function () {
			return new Date * 1;
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
		getLocalKey: function (src) {
			var url = Util.getRealUrl(src);
			var key = 'ipjax:' + url.replace(window.location.origin, '');
			//if (ignoreParam) {
			//	return key.split('?')[0];
			//}
			return key;
		},
		// 清除所有的cache
		removeAllCache: function () {
			if (!$.support.storage)
				return;
			for (var name in localStorage) {
				if ((name.split(':') || [''])[0] === 'ipjax') {
					delete localStorage[name];
				}
			}
		},
		// 获取cache
		getCache: function (src, time, flag) {
			var key = Util.getLocalKey(src), item, tval, ctime;
			time = Util.toInt(time);
			if (key in Util.stack) {
				item = Util.stack[key], ctime = Util.getTime();
				if ((item.time + time * 1000) > ctime) {
					return item;
				} else {
					delete Util.stack[key];
				}
			} else if (flag && $.support.storage) { // 从localStorage里查询
				item = localStorage.getItem(key);
				if (item) {
					item = JSON.parse(item);
					tval = Util.toInt(item.time);
					if ((tval + time * 1000) > Util.getTime()) {
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
			var time = Util.getTime(), key = Util.getLocalKey(src);
			Util.stack[key] = {
				data: data,
				title: title,
				time: time
			};
			if (flag && $.support.storage) {
				localStorage.setItem(key, JSON.stringify(Util.stack[key]));
			}
		},
		// 清除cache
		removeCache: function (src) {
			src = Util.getRealUrl(src || location.href);
			var key = Util.getLocalKey(src);
			delete Util.stack[key];
			if ($.support.storage) {
				localStorage.removeItem(key);
			}
		}
	};
	var preloadTimer;
	// ipjax
	var ipjaxFn = function (selector, container, options) {
		options = $.extend({
			selector: selector,
			container: container
		}, ipjax.defaultOptions, options);
		if (!options.container || !options.selector) {
			throw new Error('selector & container options must be set');
		}
		if (options.delay) {
			$('body').delegate(options.selector, 'mouseenter', function (event) {
				var $this = $(this), href = $this.attr('href');

				function mouseover() {
					// 过滤
					if (typeof options.filter === 'function') {
						if (options.filter.call(this, href, this) === true) {
							return true;
						}
					}
					if (href === location.href) {
						return true;
					}
					if (href.indexOf('http') === 0 && href.indexOf(location.origin) === -1) {
						return true;
					}

					var extention = (href || '').toLowerCase().split('.');
					extention = extention[extention.length - 1];
					if ($.inArray(extention, ['png', 'jpg', 'gif', 'zip', 'rar', '7z', 'exe', 'doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx']) !== -1) {
						return true;
					}

					// 只是hash不同
					if (Util.getRealUrl(href) == Util.getRealUrl(location.href)) {
						var hash = Util.getUrlHash(href);
						if (hash) {
							location.hash = hash;
						}
						return true;
					}
					event.preventDefault();
					options = $.extend(true, options, {
						url: href,
						element: $this,
						title: '',
						push: true,
						eventType: event.type
					});
					// 发起请求
					Util.isPreloading = true;
					ipjax(options);
				};
				preloadTimer = setTimeout(mouseover, options.delay);
			});
			$('body').delegate(options.selector, 'mouseleave', function () {
				ipjax.cancel();
			});
		}
		$('body').delegate(options.selector, 'click', function (event) {
			if (event.which > 1 || event.metaKey) {
				return true;
			}
			var $this = $(this), href = $this.attr('href');
			// 过滤
			if (typeof options.filter === 'function') {
				if (options.filter.call(this, href, this) === true) {
					return true;
				}
			}
			if (href === location.href) {
				return true;
			}
			if (href.indexOf('http') === 0 && href.indexOf(location.origin) === -1) {
				return true;
			}

			var extention = (href || '').toLowerCase().split('.');
			extention = extention[extention.length - 1];
			if ($.inArray(extention, ['png', 'jpg', 'gif', 'zip', 'rar', '7z', 'exe', 'doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx']) !== -1) {
				return true;
			}

			// 只是hash不同
			if (Util.getRealUrl(href) == Util.getRealUrl(location.href)) {
				var hash = Util.getUrlHash(href);
				if (hash) {
					location.hash = hash;
					options.callback && options.callback.call(this, {
						type: 'hash'
					});
				}
				return true;
			}
			event.preventDefault();
			options = $.extend(true, options, {
				url: href,
				element: this,
				title: '',
				push: true,
				eventType: event.type
			});
			// 发起请求
			ipjax(options);
		});
	};

	// 发送请求
	var ipjax = function (options) {
		options = $.extend({}, ipjax.defaultOptions, options);
		var cache, container = $(options.container);
		options.oldUrl = options.url;
		options.url = Util.getRealUrl(options.url);
		if ($(options.element).length) {
			cache = Util.toInt($(options.element).attr('data-ipjax-cache'));
			if (cache) {
				options.cache = cache;
			}
		}
		if (options.cache === true) {
			options.cache = 24 * 3600;
		}
		options.cache = Util.toInt(options.cache);
		// 如果将缓存时间设为0，则将之前的缓存也清除
		if (options.cache === 0) {
			Util.removeAllCache();
		}
		// 展现函数
		if (!options.showFn) {
			options.showFn = function (data, fn, isCached) {
				//Delete data that is ignore with ipjax
				data = data.replace(/<(.*?)data-no-ipjax(.*?)>([\s\S]*?)<\/(.*?)>/g, '');
				ipjax.showFn(options.show, container, data, fn, isCached);
			};
		}
		if (options.type !== 'GET') {
			options.timeout = 0;
		}
		ipjax.options = options;
		ipjax.options.success = ipjax.success;
		if (options.cache) {
			if (!options.cacheIgnore || $.inArray(Util.getLocalKey(options.url).replace(/^ipjax:(.*?)$/, '$1'), options.cacheIgnore) === -1)
				if (cache = Util.getCache(options.url, options.cache, options.storage)) {
					if (options.eventType === 'click') {
						options.title = cache.title;
						ipjax.success(cache.data, true);
					}
					else if (Util.getLocalKey(options.url) !== Util.prevKey) {
						$(ipjax.options.container).trigger('ipjax.cached', [ipjax.options]);
						options.title = cache.title;
						ipjax.success(cache.data, true);
					}
					else {
						Util.isPreloading = false;
					}
					return true;
				}
		}
		if (ipjax.xhr && ipjax.xhr.readyState < 4) {
			ipjax.xhr.onreadystatechange = $.noop;
			ipjax.xhr.abort();
		}

		ipjax.xhr = $.ajax(ipjax.options);
	};


	// 默认选项
	ipjax.defaultOptions = {
		timeout: 10000,
		element: null,
		cache: 172800, // 缓存时间, 0为不缓存, 单位为秒
		cacheIgnore: false,
		storage: true, // 是否使用localstorage将数据保存到本地
		delay: 300, //mouseover延迟,0为不开启只用点击,单位ms
		url: '', // 链接地址
		push: true, // true is push, false is replace, null for do nothing
		show: 'fade', // 展示的动画
		title: '', // 标题
		titleSuffix: '',// 标题后缀
		type: 'GET',
		data: {
			ipjax: true
		},
		dataType: 'html',
		filter: null,
		callback: null, // 回调函数
		// for jquery
		beforeSend: function (xhr) {
			$(ipjax.options.container).trigger('ipjax.start', [xhr, ipjax.options]);
			xhr && xhr.setRequestHeader('X-IPJAX', true);
		},
		error: function (event, jqxhr) {
			ipjax.options.callback && ipjax.options.callback.call(ipjax.options.element, {
				type: 'error'
			});
			if (jqxhr !== 'cancel') {
				location.href = ipjax.options.url;
			}
			console.log(event);
		},
		complete: function (xhr) {
			$(ipjax.options.container).trigger('ipjax.end', [xhr, ipjax.options]);
		}
	};
	// 展现动画
	ipjax.showFx = {
		'_default': function (data, callback, isCached) {
			this.html(data);
			callback && callback.call(this, data, isCached);
		},
		fade: function (data, callback, isCached) {
			var $this = this;
			if (isCached) {
				$this.html(data);
				callback && callback.call($this, data, isCached);
			} else {
				this.fadeOut(500, function () {
					$this.html(data).fadeIn(500, function () {
						callback && callback.call($this, data, isCached);
					});
				});
			}
		}
	}
	// 展现函数
	ipjax.showFn = function (showType, container, data, fn, isCached) {
		var fx = null;
		if (typeof showType === 'function') {
			fx = showType;
		} else {
			if (!(showType in ipjax.showFx)) {
				showType = '_default';
			}
			fx = ipjax.showFx[showType];
		}
		fx && fx.call(container, data, function () {
			var hash = location.hash;
			if (hash != '') {
				location.href = hash;
				//for FF
				if (/Firefox/.test(navigator.userAgent)) {
					history.replaceState($.extend({}, ipjax.state, {
						url: null
					}), document.title);
				}
			} else {
				window.scrollTo(0, 0);
			}
			fn && fn.call(this, data, isCached);
		}, isCached);
	}
	// success callback
	ipjax.success = function (data, isCached) {
		// isCached default is success
		if (isCached !== true) {
			isCached = false;
		}
		var title = '';

		if (typeof data === 'object') {
			title = data.title || '';
		}
		else if (!data) {
			ipjax.options.callback && ipjax.options.callback.call(ipjax.options.element, {
				type: 'error'
			});
			location.href = ipjax.options.url;
			return false;
		}
		else {
			title = ipjax.options.title || '';
			var el;
			if (ipjax.options.element) {
				el = $(ipjax.options.element);
				title = el.attr('title') || el.text();
			}
			var matches = data.match(/<title>(.*?)<\/title>/);
			if (matches) {
				title = matches[1];
			}
			if (data.indexOf('<html') !== -1) {
				data = $(data).find(ipjax.options.container).html();
			}
		}
		if (title) {
			if (title.indexOf(ipjax.options.titleSuffix) == -1) {
				title += ipjax.options.titleSuffix;
			}
		}
		if (Util.isPreloading) {
			Util.isPreloading = false;
		}
		else {
			document.title = title;
			ipjax.state = {
				container: ipjax.options.container,
				timeout: ipjax.options.timeout,
				cache: ipjax.options.cache,
				storage: ipjax.options.storage,
				show: ipjax.options.show,
				title: title,
				url: ipjax.options.oldUrl
			};
			var query = $.param(ipjax.options.data);
			if (query != '') {
				ipjax.state.url = ipjax.options.url + (/\?/.test(ipjax.options.url) ? '&' : '?') + query;
			}
			if (ipjax.options.push) {
				if (!ipjax.active) {
					history.replaceState($.extend({}, ipjax.state, {
						url: null
					}), document.title);
					ipjax.active = true;
				}
				history.pushState(ipjax.state, document.title, ipjax.options.oldUrl);
			} else if (ipjax.options.push === false) {
				history.replaceState(ipjax.state, document.title, ipjax.options.oldUrl);
			}
			ipjax.options.showFn && ipjax.options.showFn(data, function () {
				ipjax.options.callback && ipjax.options.callback.call(ipjax.options.element, {
					type: isCached ? 'cache' : 'success'
				});
			}, isCached);
		}
		// 设置cache
		Util.prevKey = Util.getLocalKey(ipjax.options.url);
		if (ipjax.options.cache && !isCached) {
			Util.setCache(ipjax.options.url, data, title, ipjax.options.storage);
		}
	};

	ipjax.cancel = function () {
		preloadTimer && clearTimeout(preloadTimer);
		ipjax.xhr && ipjax.xhr.abort('cancel');
		if (Util.isPreloading) {
			$(ipjax.options.container).trigger('ipjax.cancel', [ipjax.options]);
			Util.isPreloading = false;
		}
	};

	// popstate event
	var popped = ('state' in window.history), initialURL = location.href;

	$(window).bind('popstate', function (event) {
		var initialPop = !popped && location.href == initialURL;
		popped = true;
		if (initialPop) return;
		var state = event.state;
		if (state && state.container) {
			if ($(state.container).length) {
				var data = {
					url: state.url || location.href,
					container: state.container,
					push: null,
					timeout: state.timeout,
					cache: state.cache,
					storage: state.storage,
					title: state.title,
					element: null,
					eventType: 'click'
				};
				ipjax(data);
			} else {
				window.location = location.href;
			}
		}
	});

	// not support
	if (!$.support.ipjax) {
		ipjaxFn = function () {
			return true;
		};
		ipjax = function (options) {
			if (options && options.url) {
				location.href = options.url;
			}
		};
	}
	// ipjax bind to $
	$.fn.ipjax = ipjaxFn;
	$.ipjax = ipjax;
	$.ipjax.util = Util;

	// extra
	if ($.inArray('state', $.event.props) < 0) {
		$.event.props.push('state');
	}
})($);
