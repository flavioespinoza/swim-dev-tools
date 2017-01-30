var xtag = require('xtag');
var diffDOM = require('diff-dom');

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

module.exports = function(tagName, def) {
    // creates an xtag from a definition file
    // use a singleton store, so that the state can be scraped, or restored, etc
    var store = require('store');
    var uniqueTagName;
    var methods = def.methods || {};
    methods.template =  _.template(def.template);

    xtag.register(tagName, {
        lifecycle: {
            created: function() {
                this.guid = guid();
                uniqueTagName = tagName + '-' + this.guid;
                if(store) store[uniqueTagName] = store[uniqueTagName] || {};
                if(def.defaults) store[uniqueTagName] = def.defaults;
                if(def.created) def.created.apply(this, arguments);
            },
            inserted: function () {
                this.innerHTML = this.template(store[uniqueTagName]);
                if(def.inserted) def.inserted.apply(this, arguments);
            },
            attributeChanged: function (attrName, oldValue, newValue) {
                var dd = new diffDOM();
                store[uniqueTagName][attrName] = newValue;

                var elementB = $(this.template(store[uniqueTagName]))[0];
                var elementA = this.children[0];
                
                var diff = dd.diff(elementA, elementB);
                dd.apply(elementA, diff);

                if(def.attributeChanged) def.attributeChanged.apply(this, arguments);
            }
        },
        methods : methods,
        accessors: def.accessors
    });
}