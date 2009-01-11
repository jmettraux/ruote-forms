
/*
 *  ruote-forms
 *  (c) 2008-2009 OpenWFE.org
 *
 *  Ruote (OpenWFEru) is freely distributable under the terms 
 *  of a BSD-style license.
 *  For details, see the OpenWFEru web site: http://openwferu.rubyforge.org
 *
 *  Made in Japan
 *
 *  John Mettraux
 */

var RuoteForms = function() {

  // TODO : undo stack (stack values, like in fluo-tred)

  //
  // misc

  function dwrite () {
    var s = "";
    for (var i = 0; i < arguments.length; i++) { s = s + arguments[i] + ", "; }
    document.write(". " + s + '<br/>');
  }

  function clone (o) {
    var n = {};
    for (var k in o) { n[k] = o[k]; }
    return n;
  }

  function byId (id) {
    return ((typeof id) == 'string') ? document.getElementById(id) : id;
  }

  function create (container, tag, attributes, content) {
    if ( ! attributes) attributes = {};
    var e = document.createElement(tag);
    if (content) e.innerHTML = content;
    for (var k in attributes) e.setAttribute(k, attributes[k]);
    if (container) container.appendChild(e);
    return e;
  }

  //
  // toObject()

  function childrenOfClass (container, className) {
    var a = [];
    for (var i in container.childNodes) {
      var n = container.childNodes[i];
      if (n.nodeType != 1) continue;
      if (n.className != className) continue;
      a.push(n);
    }
    return a;
    //return container.childNodes.filter(function (n) {
    //  return n.nodeType == 1 && n.className == className;
    //});
  }
  function childOfClass (container, className) {
    return childrenOfClass(container, className)[0];
  }
  function rformChild (container) {
    for (var i in container.childNodes) {
      var n = container.childNodes[i];
      if (n.nodeType != 1) continue;
      if (n.className.match(/rform\_/)) return n;
    }
    return null;
  }

  function toObject () {
    var type = this.className.match(/rform\_([^ ]*)/)[1];
    if (type == 'array') {
      var a = childrenOfClass(this, 'rform_item').map(function(i) {
        return i.toObject();
      });
      return a;
    }
    if (type == 'item' || type == 'key' || type == 'value') {
      var c = rformChild(this);
      return c ? c.toObject() : null;
    }
    if (type == 'hash') {
      var h = {};
      childrenOfClass(this, 'rform_entry').map(function(e) {
        var entry = e.toObject();
        h[entry[0]] = entry[1];
      });
      return h;
    }
    if (type == 'entry') {
      return [
        childOfClass(this, 'rform_key').toObject(),
        childOfClass(this, 'rform_value').toObject()
      ];
    }
    if (type == 'string') {
      return this.firstChild.value;
    }
    if (type == 'number') {
      return new Number(this.firstChild.value);
    }
    if (type == 'boolean') {
      // TODO
      return false;
    }
    alert("unknown type '" + type + "'");
  }

  function rcreate (container, tag, attributes, content) {
    var e = create(container, tag, attributes, content);
    e.toObject = toObject;
    return e;
  }

  //
  // render()

  function render_array (elt, data, options) {
    var e = rcreate(elt, 'div', { 'class': 'rform_array' });
    for (var i = 0; i < data.length; i++) {
      var ei = rcreate(e, 'div', { 'class': 'rform_item' });
      render(ei, data[i], options);
    }
  }

  function render_object (elt, data, options) {
    var e = rcreate(elt, 'div', { 'class': 'rform_hash' });
    for (var k in data) {
      var ee = rcreate(e, 'div', { 'class': 'rform_entry' });
      var ek = rcreate(ee, 'div', { 'class': 'rform_key' });
      var ev = rcreate(ee, 'div', { 'class': 'rform_value' });
      create(ee, 'div', { 'style': 'clear: both;' });
      render(ek, k, options);
      ek.appendChild(document.createTextNode(':'));
      render(ev, data[k], options);
    }
  }

  function render_boolean (elt, data, options) {
    // TODO : radio
  }

  function render_number (elt, data, options) {
    options = clone(options);
    options['class'] = 'rform_number';
    render_string(elt, data.toString(), options);
  }

  function render_string (elt, data, options) {
    var klass = options['class'] || 'rform_string';
    var e = rcreate(elt, 'span', { 'class': klass });
    if (options['read-only'])
      e.innerHTML = data;
    else if (data.match(/\n/))
      create(e, 'textarea', { 'type': 'text' }, data);
    else
      create(e, 'input', { 'type': 'text', 'value': data });
  }

  function render (elt, data, options) {
    var t = data['__class'] || (typeof data);
    if (t == 'object') {
      var l = data.length; 
      if (l || l == 0) t = 'array';
    }
    var f = eval('render_' + t);
    f.call(null, elt, data, options);
  }

  function renderForm (container, data, options) {
    container = byId(container);
    if ( ! options) options = {};
    container.originalData = data;
    render(container, data, options);
  }

  return {
    renderForm: renderForm
  };
}();

