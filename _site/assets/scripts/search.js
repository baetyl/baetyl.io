/**
 * @file themes/default/public/scripts/search.js 搜索页功能
 * @author chenqiang(chenqiang03@baidu.com)
 */

/* eslint-disable no-undef,no-var,fecs-use-for-of,fecs-use-method-definition,fecs-use-property-shorthand */
;(function (window, $, Pagination) {

    var utils = {

        /**
         * 根据提供的字段名获取url参数
         *
         * @param {string} name 给定的字段名
         * @return {string} 参数数据
         */
        getUrlParam(name) {
            var result = '';
            var reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
            var matches = window.location.search.substr(1).match(reg);

            if (matches) {
                result = decodeURIComponent(matches[2]);
            }

            return result;
        },

        /**
         * 设置url参数
         *
         * @param {string} name 需要设置的字段名
         * @param {string} val 字段值
         * @return {string} 处理后的url
         */
        setUrlParams(name, val) {
            if (!val) {
                return;
            }

            var result = '';
            var location = window.location;
            var reg = new RegExp(name + '=([^&]*)(&|$)');
            var matches = location.search.match(reg);
            val = encodeURIComponent(val);

            if (matches) {
                result = matches.input.replace(
                    name + '=' + decodeURIComponent(matches[1]),
                    name + '=' + val
                );
            }
            else {
                var search = location.search;
                var prefix = search.indexOf('?') > -1 ? '&' : '?';
                result = search + prefix + name + '=' + val;
            }

            return location.origin + location.pathname + result;
        },

        setQuery(query) {
            var url = window.location.href;

            for (var key in query) {
                if (Object.hasOwnProperty.call(query, key)) {
                    url = this.setUrlParams(key, query[key]);
                }
            }

            return url;
        }
    };

    $(document).ready(function () {
        $('#pagination').pagination({
            items: window.__PAGINATION.totalCount,
            itemsOnPage: window.__PAGINATION.pageSize || parseInt(utils.getUrlParam('pageSize'), 10),
            currentPage: window.__PAGINATION.pageNo || parseInt(utils.getUrlParam('pageNo'), 10),
            cssStyle: '',
            useAnchors: false,
            prevText: '&lt;',
            nextText: '&gt;',
            onPageClick: function (pageNo) {
                var url = utils.setQuery({pageNo: pageNo});

                window.location.href = url;
            }
        });
    });

})(this, jQuery, pagination);
