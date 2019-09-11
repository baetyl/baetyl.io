/**
 * @file themes/default/public/scripts/page.js 文档页通用js
 * @author chenqiang(chenqiang03@baidu.com)
 */

/* eslint-disable no-undef,no-var,fecs-use-method-definition */
;(function (window, $, hljs) {

    'use strict';

    function docOptimize() {
        var content = $('.content');

        if (content.length) {
            // Syntax highlighting
            hljs.initHighlightingOnLoad();

            content.find('table').addClass('table');

            // FitVids
            window.fitvids('.content');

            content.find('a').filter(function () {
                return this.hostname !== window.location.hostname;
            }).attr('target', '_blank');

            content.find('a').each(function () {
                if (this.hash) {
                    var linkUrl = this.origin + this.pathname;
                    var pageUrl = window.location.origin + window.location.pathname;
                    if (linkUrl === pageUrl) {
                        var id = this.hash.replace(/#(.*)/, '$1');
                        $(this).before('<a style="visibility: hidden;position: absolute;transform: translateY(-45px);" id="' + id + '"> </a>');
                    }
                }
            });
        }
    }

    var hasNav = $('#nav')[0];
    var navHeight = hasNav ? $('#nav').outerHeight() : 0;
    var contentOffsetTop = $('.content').offset().top;

    var menuMod = {
        container: $('.menu-wrapper'),

        activeClass: 'active',

        top: 20,

        fixedMenu: function () {
            var ctx = this;
            var isMobile = window.isMobile();
            updatePosition();

            var containerOffsetTop = this.container.offset().top;
            var containerWidth = this.container.outerWidth();
            var footerHeight = $('.footer').outerHeight();

            updateHeight();

            function updatePosition() {
                var scrollTop = $(window).scrollTop();

                if (scrollTop + navHeight > containerOffsetTop) {
                    !isMobile && ctx.container.css({
                        width: containerWidth,
                        position: 'fixed',
                        top: navHeight
                    });
                }
                else {
                    ctx.container.css({
                        width: '100%',
                        position: 'absolute',
                        top: ctx.top
                    });
                }
            }

            function updateHeight() {
                if (isMobile) {
                    return;
                }
                var docHeight = $(document).height();
                var scrollTop = $(window).scrollTop();
                var topHeightMinus = Math.max(navHeight, containerOffsetTop - scrollTop);
                var bottomRest = Math.min(footerHeight, docHeight - scrollTop - $(window).height());
                var bottomHeightMinus = Math.max(0, footerHeight - bottomRest);

                ctx.container.height('calc(100vh - ' + (topHeightMinus + bottomHeightMinus) + 'px)');
            }

            $(window).on('scroll', function (e) {
                updatePosition();
                updateHeight();
            });
        },

        init() {
            const ctx = this;

            this.container.length && this.fixedMenu();

            this.container.find('.category-title').click(function (e) {
                $(this).parent().toggleClass(ctx.activeClass);
            });

            this.container.find('.pages > .first-level > span').click(function (e) {
                $(this).parent().toggleClass(ctx.activeClass);
            });

            this.container.find('.pages > .first-level > ul > li > span').click(function (e) {
                $(this).parent().toggleClass(ctx.activeClass);
            });

            // 如果是移动端，默认不展开目录
            if (window.isMobile()) {
                if ($('#sub-menu-mobile > li').length) {
                    $('.page-doc .content').css('paddingTop', 110);
                }
            }
        }
    };

    var navMod = {
        container: $('#nav'),

        activeClass: 'active',

        fixedNav: function () {
            var ctx = this;

            var containerOffsetTop = this.container.offset().top;
            var containerWidth = this.container.outerWidth();

            updatePosition();

            function updatePosition() {
                var scrollTop = $(window).scrollTop();

                if (scrollTop > containerOffsetTop) {
                    ctx.container.css({
                        position: 'fixed',
                        top: 0
                    });
                }
                else {
                    ctx.container.css({
                        width: '100%',
                        position: 'relative',
                        top: ctx.top
                    });
                }
            }

            $(window).on('scroll', updatePosition);
        },

        init() {
            const ctx = this;
            const category = this.container.find('.category');

            hasNav && this.fixedNav();

            category.click(function (e) {
                category.removeClass(ctx.activeClass);
                $(this).toggleClass(ctx.activeClass);
            });
        }
    };

    var backTop = {
        container: $(document.body),

        scrollEdge: 200,

        bottom: 40,

        template: [
            '<div id="backTop" class="back-top">',
                '<i></i>',
            '</div>'
        ].join(''),

        init: function () {
            var ctx = this;
            var backTopBtn = $('#backTop');
            var footerHeight = $('.footer').outerHeight();

            if (!backTopBtn.length) {
                backTopBtn = this.buildBtn();
            }

            $(window).on('scroll', function (e) {
                backTopBtn.toggleClass('visible', $(window).scrollTop() > ctx.scrollEdge);

                if (
                    $(window).scrollTop() + $(window).height() > $(document).height() - footerHeight
                ) {
                    backTopBtn.css({
                        position: 'absolute',
                        bottom: ctx.bottom + footerHeight
                    });
                }
                else {
                    backTopBtn.css({
                        position: 'fixed',
                        bottom: ctx.bottom
                    });
                }
            });

            backTopBtn.on('click', function (e) {
                $('html,body').animate({scrollTop: 0}, 'fast');
            });
        },

        buildBtn: function () {
            var backTopBtn = $($.parseHTML(this.template)).appendTo(this.container);

            return backTopBtn;
        }
    };

    function buildTOC() {
        var main = $('#main');

        if (main.length) {
            main.toc({
                showAlways: true,
                renderIn: '#tocWrapper',
                contentsText: '',
                hideText: 'Collapse',
                showText: 'Expand',
                showCollapsed: false,
                topToWin: 10 + contentOffsetTop,
                hitSpace: 10 + navHeight,
                startScrollTop: contentOffsetTop - navHeight
            });
        }
    }

    $(document).ready(function () {
        docOptimize();
        menuMod.init();
        navMod.init();
        backTop.init();
        buildTOC();
    });

})(this, jQuery, hljs);
