patterns = function (_) {


    // similar to _.defaults but returns a new obj instead of modifying the
    // original
    var defaults = function(obj, def) {
        var newObj = {}
        _.each(obj, function(v, k) {
            newObj[k] = v;
        });

        _.each(def, function(v, k) {
            if (!(k in newObj)) {
                newObj[k] = v;
            }
        });

        return newObj;
    }

    // sets the childs prototype and _super
    var inherits = function(child, parent) {
        child.prototype = defaults(child.prototype, parent.prototype);
        child.prototype._super = parent.prototype;
    }

    // adds all of the properties in the parent to the child
    // if they dont exist in the child
    var mixin = function(child, parent) {
        for (property in parent) {
            if (parent.hasOwnProperty(property) && !child.hasOwnProperty(property)) {
                child[property] = parent[property];
            }
        }
    }

    // gets a property from an object and if it doesnt exist throws and error.
    var required = function(options, name) {
        if (!(name in options)) {
            throw new Error(name + " is a required argument");
        } else {
            return options[name];
        }
    }

    // Creates a class
    // options = {
    //     parentClass: the super class, parents constructor is not called by default
    //     cons: the constructor, default noop
    //     methods: { // default is empty
    //         name: method stored in prototype
    //     },
    //     classProperties: { // default is empty
    //         name: object these are stored in the constructor for the class
    //     }
    // }
    var Class = function() {
        function Class(options) {
            var opt = defaults(options, {
                cons: function () {},
                methods: {},
                classProperties: {},
                parentClass: Object
            })

            /// Setup the constructor
            var constructor = opt.cons;

            /// Setup the parent class
            inherits(constructor, opt.parentClass);

            /// Setup methods
            _.each(opt.methods, function(prop, name) {
                constructor.prototype[name] = prop;
            });

            /// Setup class properties
            if (_.isFunction(opt.classProperties)) {
                opt.classProperties = options.classProperties(constructor);
            }
            _.each(opt.classProperties, function(prop, name) {
                constructor[name] = prop;
            });

            return constructor;
        }
        return Class;
    }();

    return {
        inherits: inherits,
        mixin: mixin,
        Class: Class,
        required: required,
        defaults: defaults
    };
}(_);