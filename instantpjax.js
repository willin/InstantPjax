/* InstantPjax 1.0.0 | (C) 2015-2015 Willin Wang | https://github.com/willin/instantpjax */

/*global jQuery*/
(function ($) {
	'use strict';
	$.support.pjax = window.history && window.history.pushState && window.history.replaceState &&
			// pushState isn't reliable on iOS until 5.
		!navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]\D|WebApps\/.+CFNetwork)/);
	$.support.storage = !!window.localStorage;
	//ipjax
	var ipjax = function (options) {
		return options;
	};

	var enable = function () {
		$.ipjax = ipjax;
		$.ipjax.enable = $.noop;
		/*eslint no-use-before-define:0*/
		$.ipjax.disable = disable;
	};

	var disable = function () {
		$.ipjax = $.noop;//需要改
		$.ipjax.enable = enable;
		$.ipjax.disable = $.noop;
	};

	// $(window).bind('popstate')
	if ($.inArray('state', $.event.props) < 0) {
		$.event.props.push('state');
	}
	$.support.pjax ? enable() : disable();

})(jQuery);
