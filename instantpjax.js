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
		isPreloading: false,
		timeoutTimer: false,
		getTime: function () {
			return new Date() * 1;
		},
		toInt: function (obj) {
			return parseInt(obj, 10) || 0;
		},
		/**
		 * 获取URL不带hash的部分,切去掉ipjax=true部分
		 * @param url
		 * @returns {string|*}
		 */
		getRealUrl: function (url) {
			url = (url || '').replace(/\#.*?$/, '');
			url = url.replace('?ipjax=true&', '?').replace('?ipjax=true', '').replace('&ipjax=true', '');
			return url;
		},
		/**
		 * 获取url的hash部分
		 * @param url
		 * @returns {XML|*|string|void}
		 */
		getUrlHash: function (url) {
			return url.replace(/^[^\#]*(?:\#(.*?))?$/, '$1');
		},
		/**
		 * 获取本地存储的key 可用 encodeURIComponent()
		 * @param src url || location.href
		 * @param ignoreParam options.ignoreparam
		 * @returns {*} key
		 */
		getLocalKey: function (src, ignoreParam) {
			var url = util.getRealUrl(src);
			var key = 'ipjax:' + url.replace(window.location.origin, '');
			if (ignoreParam) {
				return key.split('?')[0];
			}
			return key;
		},
		/**
		 * 清除所有的cache
		 */
		removeAllCache: function () {
			if (!$.support.storage)
				return;
			for (var name in localStorage) {
				if ((name.split(':') || [''])[0] === 'ipjax') {
					delete localStorage[name];
				}
			}
		},
		/**
		 * 获取cache
		 * @param src url || location.href
		 * @param time options.cache
		 * @param flag options.storage
		 * @returns {*}
		 */
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
		/**
		 * 设置cache
		 * @param src url || location.href
		 * @param data html or json data
		 * @param title page title
		 * @param flag options.storage
		 */
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
		/**
		 * 清除cache
		 * @param src url || location.href
		 */
		removeCache: function (src) {
			var key = util.getLocalKey(src);
			delete util.stack[key];
			if ($.support.storage) {
				localStorage.removeItem(key);
			}
		},
		findContainerFor: function (container) {
			container = $(container);

			if (!container.length) {
				throw 'no ipjax container for ' + container.selector;
			} else if (container.selector !== '' && container.context === document) {
				return container;
			} else if (container.attr('id')) {
				return $('#' + container.attr('id'));
			} else {
				throw 'cant get selector for ipjax container!';
			}
		},
		optionsFor: function (container, options) {
			// Both container and options
			if (container && options) {
				options.container = container;
			}
			// First argument is options Object
			else if ($.isPlainObject(container)) {
				options = container;
			}
			// Only container
			else {
				options = {container: container};
			}
			// Find and validate container
			if (options.container) {
				options.container = util.findContainerFor(options.container);
			}
			return options;
		},
		parseURL: function (url) {
			var a = document.createElement('a');
			a.href = url;
			return a;
		},
		locationReplace: function (url) {
			window.history.replaceState(null, '', ipjax.state.url);
			window.location.replace(url);
		}
	};

	//ipjax
	var ipjaxFn = function (selector, container, options) {
		var context = this;
		var opts = $.extend({}, util.optionsFor(container, options), $.ipjax.defaults);
		if (opts.delay) {
			this.on('mouseout', selector, function (event) {
				if (util.isPreloading) {
					ipjaxCancel(event, opts);
				}
			});
		}
		return this.on((opts.delay ? 'mouseover' : 'click') + '.ipjax', selector, function (event) {
			if (!opts.container) {
				opts.container = $(this).attr('data-ipjax') || context;
			}
			ipjaxHandle(event, opts);

		});
	};

	var ipjaxCancel = function (event, container, options) {
		options = util.optionsFor(container, options);
		util.isPreloading = false;
		console.log('canceled');
	};

	var ipjaxHandle = function (event, container, options) {
		options = util.optionsFor(container, options);

		var link = event.currentTarget;

		if (link.tagName.toUpperCase() !== 'A') {
			throw '$.fn.pjax or $.pjax.click requires an anchor element';
		}
		// Middle click, cmd click, and ctrl click should open
		// links in a new tab as normal.
		if (event.type !== 'mouseover' && ( event.which > 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey )) {
			return;
		}
		// Ignore cross origin links
		if (location.protocol !== link.protocol || location.hostname !== link.hostname) {
			return;
		}
		// Ignore case when a hash is being tacked on the current URL
		if (link.href.indexOf('#') > -1 && util.getRealUrl(link.href) == util.getRealUrl(location.href)) {
			return;
		}
		if (typeof options.filter === 'function') {
			if (options.filter.call(this, link.href, this) === true) {
				return;
			}
		}
		// Ignore event with default prevented
		if (event.isDefaultPrevented()) {
			return;
		}

		var defaults = {
			url: link.href,
			container: $(link).attr('data-pjax'),
			target: link,
			eventType: event.type
		};

		var opts = $.extend({}, defaults, options);
		var triggerEvent = $.Event('ipjax:trigger');
		$(link).trigger(triggerEvent, [opts]);

		if (!triggerEvent.isDefaultPrevented()) {
			ipjax(opts);
			event.preventDefault();
			$(link).trigger('ipjax:triggered', [opts]);
		}

	};

	var ipjax = function (options) {
		options = $.extend(true, {}, $.ajaxSettings, $.ipjax.defaults, options);
		if (!!options.eventType && options.eventType === 'mouseover') {
			util.isPreloading = true;
		}
		var target = options.target;
		var hash = util.getUrlHash(options.url);
		var context = options.context = util.findContainerFor(options.container);

		function fire(type, args, props) {
			if (!props) {
				props = {};
			}
			props.relatedTarget = target;
			var event = $.Event(type, props);
			context.trigger(event, args);
			return !event.isDefaultPrevented();
		};

		options.beforeSend = function (xhr, settings) {
			// No timeout for non-GET requests
			// Its not safe to request the resource again with a fallback method.
			if (settings.type !== 'GET') {
				settings.timeout = 0;
			}

			xhr.setRequestHeader('X-IPJAX', 'true');
			xhr.setRequestHeader('X-IPJAX-Container', context.selector);

			if (!fire('ipjax:beforeSend', [xhr, settings])) {
				return false;
			}

			if (settings.timeout > 0) {
				util.timeoutTimer = setTimeout(function () {
					if (fire('pjax:timeout', [xhr, options]))
						xhr.abort('timeout');
				}, settings.timeout);

				// Clear timeout setting so jquerys internal timeout isn't invoked
				settings.timeout = 0;
			}

			var url = util.parseURL(settings.url);
			if (hash) {
				url.hash = hash;
			}
			options.requestUrl = util.getRealUrl(url.href);
		};

		options.complete = function (xhr, textStatus) {
			if (util.timeoutTimer) {
				clearTimeout(util.timeoutTimer);
			}

			fire('ipjax:complete', [xhr, textStatus, options]);

			fire('ipjax:end', [xhr, options]);
		};

		options.error = function (xhr, textStatus, errorThrown) {
			var container = extractContainer('', xhr, options);

			var allowed = fire('ipjax:error', [xhr, textStatus, errorThrown, options]);
			if (options.type == 'GET' && textStatus !== 'abort' && allowed) {
				util.locationReplace(container.url);
			}
		};
		options.success = function (data, status, xhr) {
			var previousState = ipjax.state;

			var container = extractContainer(data, xhr, options);

			var url = util.parseURL(container.url);
			if (hash) {
				url.hash = hash
				container.url = url.href
			}

			// If there is a layout version mismatch, hard load the new url
			if (currentVersion && latestVersion && currentVersion !== latestVersion) {
				locationReplace(container.url)
				return
			}

			// If the new response is missing a body, hard load the page
			if (!container.contents) {
				locationReplace(container.url)
				return
			}

			pjax.state = {
				id: options.id || uniqueId(),
				url: container.url,
				title: container.title,
				container: context.selector,
				fragment: options.fragment,
				timeout: options.timeout
			}

			if (options.push || options.replace) {
				window.history.replaceState(pjax.state, container.title, container.url)
			}

			// Clear out any focused controls before inserting new page contents.
			try {
				document.activeElement.blur()
			} catch (e) {
			}

			if (container.title) document.title = container.title

			fire('pjax:beforeReplace', [container.contents, options], {
				state: pjax.state,
				previousState: previousState
			})
			context.html(container.contents)

			// FF bug: Won't autofocus fields that are inserted via JS.
			// This behavior is incorrect. So if theres no current focus, autofocus
			// the last field.
			//
			// http://www.w3.org/html/wg/drafts/html/master/forms.html
			var autofocusEl = context.find('input[autofocus], textarea[autofocus]').last()[0]
			if (autofocusEl && document.activeElement !== autofocusEl) {
				autofocusEl.focus();
			}

			executeScriptTags(container.scripts)

			var scrollTo = options.scrollTo

			// Ensure browser scrolls to the element referenced by the URL anchor
			if (hash) {
				var name = decodeURIComponent(hash.slice(1))
				var target = document.getElementById(name) || document.getElementsByName(name)[0]
				if (target) scrollTo = $(target).offset().top
			}

			if (typeof scrollTo == 'number') $(window).scrollTop(scrollTo)

			fire('pjax:success', [data, status, xhr, options])
		}


		// Initialize pjax.state for the initial page load. Assume we're
		// using the container and options of the link we're loading for the
		// back button to the initial page. This ensures good back button
		// behavior.
		if (!pjax.state) {
			pjax.state = {
				id: uniqueId(),
				url: window.location.href,
				title: document.title,
				container: context.selector,
				fragment: options.fragment,
				timeout: options.timeout
			}
			window.history.replaceState(pjax.state, document.title)
		}

		// Cancel the current request if we're already pjaxing
		abortXHR(pjax.xhr)

		pjax.options = options
		var xhr = pjax.xhr = $.ajax(options)

		if (xhr.readyState > 0) {
			if (options.push && !options.replace) {
				// Cache current container element before replacing it
				cachePush(pjax.state.id, cloneContents(context))

				window.history.pushState(null, "", options.requestUrl)
			}

			fire('pjax:start', [xhr, options]);
			fire('pjax:send', [xhr, options]);
		}

		console.log(options);
		return pjax.xhr;
	};

	var enable = function () {
		$.fn.ipjax = ipjaxFn;
		$.ipjax = ipjax;
		$.ipjax.enable = $.noop;
		$.ipjax.disable = disable;
	};

	var disable = function () {
		$.fn.ipjax = function () {
			return this;
		};
		$.ipjax = ipjax;
		$.ipjax.enable = enable;
		$.ipjax.disable = $.noop;
	};

	// $(window).bind('popstate')
	if ($.inArray('state', $.event.props) < 0) {
		$.event.props.push('state');
	}
	$.support.ipjax ? enable() : disable();
	$.ipjax.defaults = {
		timeout: 2000,
		push: true, // true push, false replace, null for do nothing
		cache: 24 * 3600 * 365, // Cache time, seconds, 0 for disable 缓存时间,0为不缓存,单位为s
		storage: true, // use localStorage
		delay: 0, // mouseover delay,0 for disable mouseover preload,延迟加载,0为取消鼠标移入预加载,单位为ms
		data: {
			ipjax: true
		},
		type: 'GET',
		dataType: 'html',
		filter: function () {

		}
	};
	$.ipjax.util = util;

})($);
