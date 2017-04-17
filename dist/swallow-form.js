/**
 * Created by swallow on 2017/4/17.
 */
if (typeof jQuery === 'undefined') {
    throw new Error('该插件需要jQuery');
}

+(function ($) {
    'use strict';

    function SerializeForm($element, options) {

    }

    SerializeForm.DEFAULT_OPTIONS = {
        /**
         * 是否序列化button,submit,reset
         * true:序列化, false:不序列化
         */
        serialButton: false,

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
         * 執行序列化前執行的回調行數
         * @param $element 綁定要序列化的組件($form.serializeForm(), 則$element為$form)
         * @returns {boolean} true:執行後續序列化操作, false:不執行序列化
         */
        before: function ($element) {
            return true;
        },

        /**
         * 每个元素序列化前的回调函数
         * @param $target 要序列化的元素
         * @returns {boolean} true:序列化该元素, false:不序列化该元素
         */
        preHandle: function ($target) {
            return true;
        },

        /**
         * 每个元素序列化后执行的回调函数
         * @param $target 要序列化的元素
         * @param content 该元素序列化后的内容
         * @returns {*} 返回的内容为序列化的最终内容
         */
        postHandle: function ($target, content) {
            return content;
        },

        /**
         * 序列化后的回调函数
         * @param $element 綁定要序列化的組件($form.serializeForm(), 則$element為$form)
         * @param content 该元素序列化后的内容
         * @returns {*} 返回的内容为序列化的最终内容
         */
        complete: function ($element, content) {
            return content;
        }

    };

    $.fn.serializeForm = function (options) {
        $.extend({}, SerializeForm.DEFAULT_OPTIONS, options);//TODO

    };

    /**
     * 解决冲突
     */
    var old = $.fn.serializeForm;
    $.fn.noConflict = function () {
        $.fn.serializeForm = old;
        return this;
    };
})(jQuery);