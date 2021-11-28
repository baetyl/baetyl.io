/**
 * @file theme/public/scripts/jquery.toc.js 页内目录插件
 * @author chenqiang(chenqiang03@baidu.com)
 */

;(function ($) {
    var isAnchorScrolling = false;
    var toggleHTML = [
        '<div id="toctitle" class="toctitle">',
            '<h2>%1</h2> ',
            '<span class="toctoggle">[<a id="toctogglelink" class="internal" href="#">%2</a>]</span>',
        '</div>'
    ].join('');
    var tocContainerHTML = [
        '<div id="toc-container" class="toc-container">',
            '<div class="toc-line"><i id="tocarrow" class="toc-arrow"></i></div>',
            '<table class="toc" id="toc"><tbody><tr><td>%1<ul>%2</ul></td></tr></tbody></table>',
        '</div>'
    ].join('');

    function createLevelHTML(anchorId, tocLevel, tocSection, tocNumber, tocText, tocInner) {
        var link = '<a href="#%1"><span class="tocnumber">%2</span> <span class="toctext" title="%3">%3</span></a>%4'
            .replace(/%1/g, anchorId)
            .replace(/%2/g, tocNumber)
            .replace(/%3/g, tocText)
            .replace(/%4/g, tocInner ? tocInner : '');
        return '<li class="toclevel-%1 tocsection-%2">%3</li>\n'
            .replace(/%1/g, tocLevel)
            .replace(/%2/g, tocSection)
            .replace(/%3/g, link);
    }

    /**
     * 获取给定容器最高等级的 depth 个标题标签
     *
     * @param {Object<jQuery.elem>} $root 容器对象
     * @param {number} depth 最大深度
     * @return {Array} 最高等级的标题
     */
    function checkMaxHead($root, depth) {
        depth = depth || 2;
        var index = 0;
        var heads = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

        for (; index <= heads.length - depth; index++) {
            if ($root.find(heads[index]).length > 0) {
                break;
            }
        }

        return heads.splice(index, depth);
    }

    function activeAnchor(anchor, config, hitAnchorOnly) {
        var targetNode = $(anchor.attr('href'));
        var curAnchorNode = anchor.parent('li');
        var anchorNodes = $('#toc li');
        var arrow = $('#tocarrow');

        anchorNodes.removeClass('active');
        curAnchorNode.addClass('active');

        if (targetNode.length && !hitAnchorOnly) {
            isAnchorScrolling = true;
            $('html,body').animate({
                scrollTop: targetNode.offset().top - config.hitSpace
            }, 'fast', function (e) {
                isAnchorScrolling = false;
            });
        }

        arrow.css('top', curAnchorNode.position().top);
    }

    function adjustSize(config) {
        var $root = $(window);
        var wrapper = $(config.renderIn);
        var offsetParent = wrapper.offsetParent();
        var headerHeight = offsetParent.offset().top;
        var footerHeight = $(document).height() - (offsetParent.offset().top + offsetParent.outerHeight());

        wrapper.css('top', config.topToWin - headerHeight);

        function update() {
            var docHeight = $(document).height();
            var rootHeight = $root.height();
            var scrollTop = $root.scrollTop();
            var bufferSpace = scrollTop + rootHeight > docHeight - footerHeight
                ? footerHeight - (docHeight - scrollTop - rootHeight)
                : 0;

            if (scrollTop > config.startScrollTop) {
                wrapper.css({
                    position: 'fixed',
                    top: config.topToWin - config.startScrollTop,
                    height: rootHeight
                        - (config.topToWin - headerHeight)
                        - config.bottomSpace
                        - bufferSpace
                        - (config.topToWin - config.startScrollTop)
                });
            }
            else {
                wrapper.css({
                    position: 'absolute',
                    top: config.topToWin - headerHeight,
                    height: rootHeight
                        - (config.topToWin - scrollTop)
                        - config.bottomSpace
                        - bufferSpace
                        - (config.topToWin - headerHeight)
                });
            }
        }

        update();
        $root.on('scroll resize', update);
    }

    function reverseActive(config) {
        var $root = $(window);
        var anchorItems = $('#toc li a[href]');
        var itemOffsetTops = [];
        anchorItems.each(function (index, element) {
            const id = $(element).attr('href');
            const target = $(id);

            itemOffsetTops.push({
                id: id,
                top: Math.floor(target.offset().top)
            });
        });

        itemOffsetTops.sort(function (a, b) {
            return a - b;
        });

        function hit() {
            var scrollTop = $root.scrollTop();
            var index = itemOffsetTops.length - 1;
            for (; index >= 0; index--) {
                var item = itemOffsetTops[index];

                if (scrollTop >= item.top - config.hitSpace) {
                    break;
                }
            }

            index = Math.max(0, index);

            var curAnchor = $('a[href="' + itemOffsetTops[index].id + '"]');
            if (curAnchor.length) {
                activeAnchor(curAnchor, config, true);
            }
        }

        hit();
        $root.on('scroll', function (e) {
            if (!isAnchorScrolling) {
                hit();
            }
        });
    }

    $.fn.toc = function (settings) {
        var config = {
            renderIn: 'self',
            anchorPrefix: 'tocAnchor-',
            showAlways: false,
            animated: true,
            topToWin: 80,
            hitSpace: 10,
            startScrollTop: 50,
            bottomSpace: 30,
            minItemsToShowToc: 2,
            saveShowStatus: true,
            contentsText: 'Contents',
            hideText: 'hide',
            showText: 'show',
            showCollapsed: false
        };

        if (settings) {
            $.extend(config, settings);
        }

        var tocHTML = '';
        var tocLevel = 1;
        var tocSection = 1;
        var itemNumber = 1;

        var tocContainer = $(this);

        var heads = checkMaxHead(tocContainer);
        var firstHead = heads[0];
        var secondHead = heads[1];

        tocContainer.find(firstHead).each(function () {
            var levelHTML = '';
            var innerSection = 0;
            var h1 = $(this);

            h1.nextUntil(firstHead).filter(secondHead).each(function () {
                ++innerSection;
                var anchorId = config.anchorPrefix + tocLevel + '-' + tocSection + '-' + innerSection;
                $(this).attr('id', anchorId);
                // $(this).before('<a style="visibility: hidden;position: absolute;transform: translateY(-30px);" id="' + $(this).text() + '">' + $(this).text() + '</a>');
                levelHTML += createLevelHTML(
                    anchorId,
                    tocLevel + 1,
                    tocSection + innerSection,
                    itemNumber + '.' + innerSection,
                    $(this).text()
                );
            });

            if (levelHTML) {
                levelHTML = '<ul>' + levelHTML + '</ul>\n';
            }

            var anchorId = config.anchorPrefix + tocLevel + '-' + tocSection;
            h1.attr('id', anchorId);
            // h1.before('<a id="' + h1.text() + '"></a>');
            tocHTML += createLevelHTML(
                anchorId,
                tocLevel,
                tocSection,
                itemNumber,
                h1.text(),
                levelHTML
            );
            tocSection += 1 + innerSection;
            ++itemNumber;
        });

        // for convenience itemNumber starts from 1
        // so we decrement it to obtain the index count
        var tocIndexCount = itemNumber - 1;

        var show = config.showAlways ? true : config.minItemsToShowToc <= tocIndexCount;

        // check if cookie plugin is present otherwise doesn't try to save
        /* eslint-disable */
        if (config.saveShowStatus && typeof $.cookie == 'undefined') {
        /* eslint-enable */
            config.saveShowStatus = false;
        }

        if (show && tocHTML) {
            var replacedToggleHTML = toggleHTML
                .replace('%1', config.contentsText)
                .replace('%2', config.hideText);
            var replacedTocContainer = tocContainerHTML
                .replace('%1', replacedToggleHTML)
                .replace('%2', tocHTML);

            // Renders in default or specificed path
            if (config.renderIn !== 'self') {
                $(config.renderIn).html(replacedTocContainer);
            }
            else {
                tocContainer.prepend(replacedTocContainer);
            }

            adjustSize(config);
            reverseActive(config);

            $('#toctogglelink').click(function () {
                var ul = $($('#toc ul')[0]);

                if (ul.is(':visible')) {
                    ul.hide();
                    $(this).text(config.showText);
                    if (config.saveShowStatus) {
                        $.cookie('toc-hide', '1', {expires: 365, path: '/'});
                    }
                    $('#toc').addClass('tochidden');
                }
                else {
                    ul.show();
                    $(this).text(config.hideText);
                    if (config.saveShowStatus) {
                        $.removeCookie('toc-hide', {path: '/'});
                    }
                    $('#toc').removeClass('tochidden');
                }

                return false;
            });

            if (config.animated) {
                $('#toc').on('click', 'li a[href]', function (e) {
                    e.preventDefault();

                    activeAnchor($(e.currentTarget), config);
                });
            }

            if (config.saveShowStatus && $.cookie('toc-hide')) {
                var ul = $($('#toc ul')[0]);

                ul.hide();
                $('#toctogglelink').text(config.showText);
                $('#toc').addClass('tochidden');
            }

            if (config.showCollapsed) {
                $('#toctogglelink').click();
            }
        }

        return this;
    };
})(jQuery);
