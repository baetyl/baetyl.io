/**
 * @file themes/default/public/scripts/common.js 通用js
 * @author chenqiang(chenqiang03@baidu.com)
 */

;(function (window, $) {

    var searchMod = {
        container: $('#searchForm'),

        init: function () {
            const ctx = this;

            window.isMobile = this.isMobile;
            if (this.isMobile()) {
                $('.search-icon').click(function (e) {
                    $('.search-wrapper').toggle();
                    $('.content-wrapper').toggle();
                });
                $('.search-close-icon').click(function (e) {
                    $('.search-wrapper').toggle();
                    $('.content-wrapper').toggle();
                });
            }
            else {
                const trigger = this.container.find('.search-icon');
                ctx.container.click(function (e) {
                    ctx.container.toggleClass('active');
                });
            }

            $('.menu-icon').click(function (e) {
                $(this).toggleClass('active');
                $('.nav').toggleClass('active');
            });

            $('.locale-btn').click(function (e) {
                let pathname = window.location.pathname;
                if (pathname.indexOf('/en') === 0) {
                    pathname = pathname.replace(/\/en(.*)/, '/zh$1');
                }
                else {
                    pathname = pathname.replace(/\/zh(.*)/, '/en$1');
                }

                if (pathname.indexOf('/about-en') === 0) {
                    pathname = pathname.replace(/\/about-en/, '/about-zh');
                }
                else if (pathname.indexOf('/about-zh') === 0) {
                    pathname = pathname.replace(/\/about-zh/, '/about-en');
                }
                window.location.href = window.location.origin + pathname;
            });
        },

        isMobile: function () {
            const deviceAgent = navigator.userAgent;
            return deviceAgent && deviceAgent.toLowerCase().match(/(iphone|ipod|ipad|android|symbianos|windows phone|mobile|blackberry|iemobile|mqqbrowser|juc|fennec|wosbrowser|browserng|webos)/);
        },

        initLanguage: function () {
            let pathname = window.location.pathname;
            if (pathname === '/') {
                if (navigator.language === 'zh-CN') {
                    window.location.href = `${window.location.origin}/zh/`;
                }
                else {
                    window.location.href = `${window.location.origin}/en/`;
                }
            }
        }
    };

    $(document).ready(function () {
        searchMod.initLanguage();
        searchMod.init();
    });

})(this, jQuery);
