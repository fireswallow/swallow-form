/**
 * Created by swallow on 2017/4/17.
 */
if (typeof jQuery === 'undefined') {
    throw new Error('该插件需要jQuery');
}

+(function ($) {
    'use strict';

    function MarshallForm($element, options) {
        this.marshall = function ($element, options) {
            var content = {};
            var $eleArray = [];
            var selector = "[name]:input";
            if (!options.serialFile) {
                selector += ":not(:file)";
            }
            if (!options.serialDisabled) {
                selector += ":enabled";
            }
            if (options.before($element)) {
                if ($element.is(selector)) {
                    $eleArray.push($element);
                }
                $eleArray.push($element.find(selector));
            }
            options.complete($element, content);
            return content;
        }
    }

    /**
     * 序列化值
     * @param $eleArray jQuery对象数组
     * @param options 设置选项
     * @param content 序列化内容
     */
    function marshallValue($eleArray, options, content) {
        $.each($eleArray, function (index, $ele) {
            $ele.each(function (index, target) {
                var $target = $(target);
                if ($target.is(":radio")) {
                    marshallRadio($target, options, content);
                }
            });
        });
    }

    /**
     * 序列化radio
     * @param $target 要序列化的组件
     * @param options 设置选项
     * @param content 序列化内容
     */
    function marshallRadio($target, options, content) {
        var key = $target.attr("name");
        if (!Object.prototype.hasOwnProperty.call(content, key)) {
            if (options.noMarshall !== MarshallForm.DEFAULT_OPTIONS.NO_MARSHALL) {
                content[key] = options.noMarshall;
            }
        }
        if ($target.is(":checked")) {
            if (!options.preHandle($target)) {
                delete content[key];
                return;
            }
            content[key] = options.postHandle($target, $target.val());
        }
    }

    MarshallForm.DEFAULT_OPTIONS = {
        NO_MARSHALL: {},

        /**
         * 是否序列化文件域
         * true:序列化, false:不序列化
         */
        serialFile: false,

        /**
         * 是否序列化禁用表單
         * true:序列化, false:不序列化
         */
        serialDisabled: false,

        /**
         * 当该值不为undefined && null时,对于数组类型的值,用该连接符号连接起来,
         */
        arrayJoin: undefined,

        /**
         * 当组件未被序列化时(radio,checkbox,select未选中):
         * 如果该值为内置的对象: 该组件不会加入到序列化的内容中,即不存在对应的键名,否则(即重新定义):序列化为该值
         */
        noMarshall: this.NO_MARSHALL,

        /**
         * 執行序列化前執行的回調行數
         * @param $element 綁定要序列化的組件($form.serializeForm(), 則$element為$form)
         * @returns {boolean} true:執行後續序列化操作, false:不執行序列化,返回空对象{}
         */
        before: function ($element) {
            return true;
        },

        /**
         * 每个元素序列化前的回调函数
         * @param $target 要序列化的元素
         * @returns {boolean} true:序列化该元素, false:不序列化该元素,不会调用postHandle()方法
         */
        preHandle: function ($target) {
            return true;
        },

        /**
         * 每个元素序列化后执行的回调函数
         * @param $target 要序列化的元素
         * @param value 该元素序列化后的值
         * @returns {*} 返回的内容为序列化的最终值
         */
        postHandle: function ($target, value) {
            return value;
        },

        /**
         * 序列化后的回调函数
         * @param $element 綁定要序列化的組件($form.serializeForm(), 則$element為$form)
         * @param content 该元素序列化后的内容,修改该内容,可能影响到返回的内容
         */
        complete: function ($element, content) {
        }

    };

    $.fn.marshallForm = function (options) {
        var options = $.extend({}, MarshallForm.DEFAULT_OPTIONS, options);

    };

    /**
     * 解决冲突
     */
    var old = $.fn.marshallForm;
    $.fn.noConflict = function () {
        $.fn.marshallForm = old;
        return this;
    };
})(jQuery);