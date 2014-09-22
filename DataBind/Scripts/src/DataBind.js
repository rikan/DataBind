var TT;
(function (TT) {
    (function (DB) {
        var DataBind = (function () {
            function DataBind() {
            }
            DataBind.ApplyBind = function (target, datasource) {
                DataBind.datasource = datasource;
                DataBind.bindContext(target);
            };

            DataBind.ApplyRender = function () {
                var context = new Context();
                context.$root = context.$self = DataBind.datasource, context.$parent = null, context.$element = $("body");
                DataBind.render(context);
            };

            DataBind.bindContext = function (target) {
                var _this = this;
                target.each(function (index, element) {
                    var $this = $(element), bind = $this.data("bind"), bind_object = bind && eval("(function(){return {" + bind + "}})()");
                    $.each(bind_object || {}, function (directive, bind_method) {
                        var evaluator = _this.createEvaluator(bind_method);
                        $this.data(directive, evaluator);
                        $this.data("break", BeforeMethods[directive] && BeforeMethods[directive].apply(DataBind.datasource, [$this, evaluator]));
                    });

                    $.each($this.children(), function (index, child) {
                        DataBind.bindContext($(child));
                    });
                });
            };

            DataBind.createEvaluator = function (bind_method) {
                var functionBody = "with($context){with($data||{}){  return " + bind_method + "; }}";
                return new Function("$context", "$data", functionBody);
            };

            DataBind.render = function (context) {
                $.each(context.$element, function (index, element) {
                    var $this = $(element);
                    $.each($this.data(), function (directive, evaluator) {
                        if (directive === "bind") {
                            return true;
                        }
                        Methods[directive] && Methods[directive].apply(context, [$this, evaluator]);
                    });
                    if ($this.data("break")) {
                        return true;
                    }
                    $.each($this.children(), function (index, child) {
                        var value = DataBind.createEvaluator("$self")(context, context["$self"]);
                        var newContext = new Context();
                        newContext.$root = context["$root"];
                        newContext.$parent = context["$self"];
                        newContext.$self = value;
                        newContext.$element = $(child);
                        DataBind.render(newContext);
                    });
                });
            };
            return DataBind;
        })();
        DB.DataBind = DataBind;

        var BeforeMethods = (function () {
            function BeforeMethods() {
            }
            BeforeMethods.foreach = function (element, evaluator) {
                element.data("template", element.html());
                element.empty();
                return true;
            };

            BeforeMethods.click = function (element, evaluator) {
                var value = evaluator(this);
                element.on("click", value.bind(element));
            };
            return BeforeMethods;
        })();
        DB.BeforeMethods = BeforeMethods;

        var Methods = (function () {
            function Methods() {
            }
            Methods.text = function (element, evaluator) {
                var value = evaluator(this, this["$self"]);
                element.text(value);
            };

            Methods.click = function (element, evaluator) {
                element.data("context", this);
            };

            Methods.foreach = function (element, evaluator) {
                var _this = this;
                var that = this;
                var value = evaluator(this, this["$self"]);
                element.empty();
                $.each(value, function (index, obj) {
                    var ele = $(element.data("template")).appendTo(element);
                    var context = new Context();
                    context.$root = _this["$root"];
                    context.$parent = _this["$self"];
                    context.$self = obj;
                    context.$element = ele;
                    DataBind.bindContext(ele);
                    DataBind.render(context);
                });
            };

            Methods.visible = function (element, evaluator) {
                var value = evaluator(this, this["$self"]);
                value ? element.show() : element.hide();
            };

            Methods.enable = function (element, evaluator) {
                var value = evaluator(this, this["$self"]);
                value ? element.attr('disabled', 'disabled') : element.removeAttr('disabled');
            };
            return Methods;
        })();
        DB.Methods = Methods;

        var Context = (function () {
            function Context() {
            }
            return Context;
        })();
        DB.Context = Context;
    })(TT.DB || (TT.DB = {}));
    var DB = TT.DB;
})(TT || (TT = {}));
//# sourceMappingURL=DataBind.js.map
