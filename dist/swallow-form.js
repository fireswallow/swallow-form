/**
 * Created by swallow on 2017/4/17.
 */
if (typeof jQuery === 'undefined') {
    throw new Error('该插件需要jQuery');
}


/**
 * 将元素下的form表单序列化为对象
 * 例:$(".form).unmarshalForm(), $(".div).unmarshalForm(), $("input").unmarshalForm()
 */
+(function ($) {
    'use strict';

    function UnmarshalForm($element, options) {
        this.unmarshal = function () {
            var content = null;
            var $eleArray = [];
            var selector = "[name]:input";
            if (!options.unmarshalFile) {
                selector += ":not(:file)";
            }
            if (!options.unmarshalDisabled) {
                selector += ":enabled";
            }
            if (options.before($element)) {
                content = {};
                if ($element.is(selector)) {
                    $eleArray.push($element);
                }
                $eleArray.push($element.find(selector));
                unmarshalValue($eleArray, options, content);
            }
            if (options.arrayJoin !== undefined && options.arrayJoin !== null) {
                $.each(content, function (key, ele) {
                    if ($.isArray(ele)) {
                        content[key] = ele.join(options.arrayJoin);
                    }
                })
            }
            options.complete($element, content);
            return content;
        }
    }


    UnmarshalForm.DEFAULT_OPTIONS = {
        /**
         * 是否序列化文件域
         * true:序列化, false:不序列化
         */
        unmarshalFile: false,

        /**
         * 是否序列化禁用表單
         * true:序列化, false:不序列化
         */
        unmarshalDisabled: false,

        /**
         * 当该值不为undefined && null时,对于数组类型的值,用该连接符号连接起来,
         */
        arrayJoin: undefined,

        /**
         * 是否将空字符串''转换为null,对输入值有效,对单选,复选,下拉无效
         */
        emptyToNull: true,

        /**
         * 当组件未被序列化时(radio,checkbox未选中):
         * {
         *      "no": "不序列化该值,即序列化后的内容不存在该键",
         *      "empty": "radio序列化为'',checkbox序列化为空数组[]",
         *      其他值: "将用该值去代替"
         * }
         */
        noUnmarshal: null,

        /**
         * 執行序列化前執行的回調行數
         * @param $element 綁定要序列化的組件($form.serializeForm(), 則$element為$form)
         * @returns {boolean} true:執行後續序列化操作, false:不執行序列化,返回null
         */
        before: function ($element) {
            return true;
        },

        /**
         * 每个元素序列化前的回调函数,序列化每一个input都会调用,不是通过name来区分的
         * @param $target 要序列化的元素
         * @returns {boolean} true:序列化该元素, false:不序列化该元素,不会调用postHandle()方法
         */
        preHandle: function ($target) {
            return true;
        },

        /**
         * 每个元素序列化后执行的回调函数,序列化每一个input都会调用,不是通过name来区分的
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

    /**
     * 序列化值
     * @param $eleArray jQuery对象数组
     * @param options 设置选项
     * @param content 序列化内容
     */
    function unmarshalValue($eleArray, options, content) {
        $.each($eleArray, function (i, $ele) {
            $ele.each(function (j, target) {
                var $target = $(target);
                if ($target.is(":radio")) {
                    unmarshalRadio($target, options, content);
                } else if ($target.is(":checkbox")) {
                    unmarshalCheckbox($target, options, content);
                } else if ($target.is("select")) {
                    unmarshalSelect($target, options, content);
                } else {
                    unmarshalText($target, options, content);
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
    function unmarshalRadio($target, options, content) {
        var key = $target.attr("name");
        if (!Object.prototype.hasOwnProperty.call(content, key)) {
            if (options.noUnmarshal === "empty") {
                content[key] = "";
            } else if (options.noUnmarshal !== "no") {
                content[key] = options.noUnmarshal;
            }
        }
        if ($target.is(":checked")) {
            if (!options.preHandle($target)) {
                return;
            }
            content[key] = options.postHandle($target, $target.val());
        }
    }

    /**
     * 序列化checkbox
     * @param $target 要序列化的组件
     * @param options 设置选项
     * @param content 序列化内容
     */
    function unmarshalCheckbox($target, options, content) {
        var key = $target.attr("name");
        if (!Object.prototype.hasOwnProperty.call(content, key)) {
            if (options.noUnmarshal === "empty") {
                content[key] = [];
            } else if (options.noUnmarshal !== "no") {
                content[key] = options.noUnmarshal;
            }
        }
        if ($target.is(":checked")) {
            if (!options.preHandle($target)) {
                return;
            }
            if (!$.isArray(content[key])) {
                content[key] = [];
            }
            content[key].push(options.postHandle($target, $target.val()));
        }
    }

    /**
     * 序列化select
     * @param $target 要序列化的组件
     * @param options 设置选项
     * @param content 序列化内容
     */
    function unmarshalSelect($target, options, content) {
        var key = $target.attr("name");
        content[key] = options.postHandle($target, $target.val());
    }

    /**
     * 序列化text
     * @param $target 要序列化的组件
     * @param options 设置选项
     * @param content 序列化内容
     */
    function unmarshalText($target, options, content) {
        var key = $target.attr("name");
        var value = $target.val();
        if (options.emptyToNull && value === "") {
            value = null;
        }
        if (!Object.prototype.hasOwnProperty.call(content, key)) {
            if (options.preHandle($target)) {
                content[key] = options.postHandle($target, value);
            }
            return;
        }

        if (!$.isArray(content[key])) {
            content[key] = [].concat(content[key]);
        }
        content[key].push(options.postHandle($target, value))
    }

    $.fn.unmarshalForm = function (options) {
        return (new UnmarshalForm(this, $.extend({}, UnmarshalForm.DEFAULT_OPTIONS, options))).unmarshal();
    };

    $.fn.unmarshalForm.Constructor = UnmarshalForm;

    /**
     * 解决冲突
     */
    var old = $.fn.unmarshalForm;
    $.fn.noConflict = function () {
        $.fn.unmarshalForm = old;
        return this;
    };
})(jQuery);

/**
 * 将数据回显于form表单
 */
+(function ($) {
    'use strict';

    function MarshalForm($element, options, data) {
        this.marshal = function () {
            var $eleArray = [];
            if (options.before($element, data)) {
                marshalValue($element, options, data);
            }
            options.complete($element);
        }
    }

    MarshalForm.DEFAULT_OPTIONS = {

        /**
         * 如果不为undefined && null,对于checkbox,multiple select,如果对应的值不为数组, 用该分割符去分割
         *
         */
        separator: null,

        before: function ($element, data) {
            return true;
        },

        preHandle: function ($target, key, value) {
            return true;
        },

        postHandle: function ($target) {
        },

        complete: function ($element) {
        }
    };

    function marshalValue($element, options, data) {
        var selector = ":input[name]";
        $.each(data, function (key, value) {
            $element.find(":input[name='" + key + "']").each(function (index, ele) {
                var $ele = $(ele);
                if ($ele.is(":radio")) {
                    marshalCheck($ele, options, key, value);
                } else if ($ele.is(":checkbox")) {
                    if (value !== undefined && value !== null) {
                        if (options.separator !== undefined && options.separator !== null) {
                            if (!$.isArray(value)) {
                                value = value.split(options.separator);
                            }
                        }
                    } else {
                        var temp = value;
                        value = [];
                        value.push(temp);
                    }
                    value = [].concat(value);
                    $.each(value, function (i, v) {
                        marshalCheck($ele, options, key, v);
                    })
                } else if ($ele.is("select")) {
                    marshalSelect($ele, options, key, value);
                } else {
                    if (value !== undefined && value !== null) {
                        if (options.separator !== undefined && options.separator !== null) {
                            if (!$.isArray(value)) {
                                value = value.split(options.separator);
                            }
                        }
                    } else {
                        var temp = value;
                        value = [];
                        value.push(temp);
                    }
                    value = [].concat(value);
                    unmarshalText($ele, options, key, value[index]);
                }
            });
        });
    }

    function marshalCheck($target, options, key, value) {
        if ($target.val() === value) {
            if (options.preHandle($target, key, value)) {
                $target.prop("checked", "checked");
                options.postHandle($target);
            }
        }
    }

    function marshalSelect($target, options, key, value) {
        if ($target.is("[multiple]")) {
            if (options.separator !== undefined && options.separator !== null) {
                if (!$.isArray(value)) {
                    value = value.split(options.separator);
                }
            }
        }

        if (options.preHandle($target, key, value)) {
            value = [].concat(value);
            $.each(value, function (index, v) {
                $target.find("option[value='" + v + "']").prop("selected", "selected");
            });
            options.postHandle($target);
        }
    }

    function unmarshalText($target, options, key, value) {
        if (options.preHandle($target, key, value)) {
            $target.val(value);
            options.postHandle($target);
        }
    }

    $.fn.marshalForm = function (data, options) {
        return (new MarshalForm(this, $.extend({}, MarshalForm.DEFAULT_OPTIONS, options), data)).marshal();
    };

    $.fn.marshalForm.Constructor = MarshalForm;

    /**
     * 解决冲突
     */
    var old = $.fn.marshalForm;
    $.fn.noConflict = function () {
        $.fn.marshalForm = old;
        return this;
    };
})(jQuery);
