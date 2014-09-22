module TT.DB {
    export class DataBind {

        private static datasource;
        public static ApplyBind(target: JQuery, datasource) {
            DataBind.datasource = datasource;
            DataBind.bindContext(target);
        }

        public static ApplyRender() {
            var context = new Context();
            context.$root = context.$self = DataBind.datasource, context.$parent = null, context.$element = $("body");
            DataBind.render(context);
        }

        public static bindContext(target: JQuery) {
            target.each((index, element) => {
                var $this = $(element),
                    bind = $this.data("bind"),
                    bind_object = bind && eval("(function(){return {" + bind + "}})()");
                $.each(bind_object || {}, (directive: string, bind_method) => {
                    var evaluator = this.createEvaluator(bind_method);
                    $this.data(directive, evaluator);
                    $this.data("break", BeforeMethods[directive] && BeforeMethods[directive].apply(DataBind.datasource, [$this, evaluator]));
                });

                $.each($this.children(), (index, child) => {
                    DataBind.bindContext($(child));
                });
            });
        }

        private static createEvaluator(bind_method) {
            var functionBody = "with($context){with($data||{}){  return " + bind_method + "; }}";
            return new Function("$context", "$data", functionBody);
        }

        public static render(context: Context) {
            $.each(context.$element, (index, element) => {
                var $this = $(element);
                $.each($this.data(), (directive, evaluator) => {
                    if (directive === "bind") { return true; }
                    Methods[directive] && Methods[directive].apply(context, [$this, evaluator]);
                });
                if ($this.data("break")) { return true; }
                $.each($this.children(), (index, child) => {
                    var value = DataBind.createEvaluator("$self")(context, context["$self"]);
                    var newContext = new Context();
                    newContext.$root = context["$root"];
                    newContext.$parent = context["$self"];
                    newContext.$self = value;
                    newContext.$element = $(child);
                    DataBind.render(newContext);
                })
            });
        }
    }

    export class BeforeMethods {

        public static foreach(element: JQuery, evaluator: ($context) => {}) {
            element.data("template", element.html());
            element.empty();
            return true;
        }

        public static click(element: JQuery, evaluator: ($context) => Function) {
            var value = evaluator(this);
            element.on("click", value.bind(element));
        }
    }

    export class Methods {
        public static text(element: JQuery, evaluator: ($context, $data) => string) {
            var value = evaluator(this, this["$self"]);
            element.text(value);
        }

        public static click(element: JQuery, evaluator: ($context, $data) => {}) {
            element.data("context", this);
        }

        public static foreach(element: JQuery, evaluator: ($context, $data) => {}) {
            var that = this;
            var value = evaluator(this, this["$self"]);
            element.empty();
            $.each(value, (index, obj) => {
                var ele = $(element.data("template")).appendTo(element);
                var context = new Context();
                context.$root = this["$root"];
                context.$parent = this["$self"];
                context.$self = obj;
                context.$element = ele;
                DataBind.bindContext(ele);
                DataBind.render(context);
            })
        }

        public static visible(element: JQuery, evaluator: ($context, $data) => {}) {
            var value = evaluator(this, this["$self"]);
            value ? element.show() : element.hide();
        }

        public static enable(element: JQuery, evaluator: ($context, $data) => {}) {
            var value = evaluator(this, this["$self"]);
            value ? element.attr('disabled', 'disabled') : element.removeAttr('disabled');
        }
    }

    export class Context {
        public $self;
        public $parent;
        public $root;
        public $element;
    }
}
