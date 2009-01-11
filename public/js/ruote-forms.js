
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

  function toArray (a) {
    var aa = [];
    if (a.length) { for (var i = 0; i < a.length; i++) { aa.push(a[i]); } }
    else { for (var i in a) { aa.push(a[i]); } }
    return aa;
  }

  function dwrite () {
    var s = '';
    document.write('. ' + toArray(arguments).join(', ') + '<br/>');
  }

  function hclone (h) {
    var n = {};
    for (var k in h) { n[k] = h[k]; }
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
  // edition

  function moveUp () {
    var ps = this.previousSibling;
    if ( ! ps) return;
    this.parentNode.insertBefore(this, ps);
  }
  function moveDown () {
    var ns = this.nextSibling;
    if ( ! ns) return;
    var nns = ns.nextSibling;
    if (nns) this.parentNode.insertBefore(this, nns);
    else this.parentNode.appendChild(this);
  }

  function cut () {
    this.parentNode.removeChild(this);
    return this;
  }

  //
  // toObject()

  // like the ruby inject, but 'return target' is implied
  //
  function inject (target, func) {
    for (var i in this) {
      var e = this[i];
      if ((typeof e) == 'function') continue;
      func(target, this[i]);
    }
    return target;
  }

  function childrenOfClass (container, className) {
    var a = [];
    for (var i in container.childNodes) {
      var n = container.childNodes[i];
      if (n.nodeType != 1) continue;
      if (n.className != className) continue;
      a.push(n);
    }
    a.inject = inject;
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
      return childrenOfClass(this, 'rform_item').inject([], function(a, i) {
        var v = i.toObject();
        if (v != EmptyItem) a.push(v);
      });
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
      return (new Number(this.firstChild.value)).valueOf();
    }
    if (type == 'boolean') {
      // TODO
      return false;
    }
    if (type == 'new') {
      return EmptyItem;
    }
    alert("unknown type '" + type + "'");
  }

  function rcreate (container, tag, attributes, content) {
    var e = create(container, tag, attributes, content);
    e.toObject = toObject;
    e.moveUp = moveUp;
    e.moveDown = moveDown;
    e.cut = cut;
    return e;
  }

  //
  // render()

  function EmptyItem () {} // a kind of 'marker'

  function addItemButtons (elt) {
    var e = create(elt, 'div', { 'class': 'rform_buttons', });
    create(e, 'img', {
      'src': 'images/btn-moveup.gif',
      'onclick': 'this.parentNode.parentNode.moveUp();'
    });
    create(e, 'img', {
      'src': 'images/btn-movedown.gif',
      'onclick': 'this.parentNode.parentNode.moveDown();'
    });
    create(e, 'img', {
      'src': 'images/btn-cut.gif',
      'onclick': 'this.parentNode.parentNode.cut();'
    });
  }

  function addArrayButtons (elt) {
    var e = create(elt, 'div', { 'class': 'rform_buttons', });
    create(e, 'img', {
      'src': 'images/btn-add.gif',
    });
    e.onclick = function () {
      var target = this.parentNode.parentNode.firstChild;
      var i = render_item(target, EmptyItem, {});
      i.parentNode.insertBefore(i, i.previousSibling);
    };
  }

  function render_item (elt, data, options) {
    var ei = rcreate(elt, 'div', { 'class': 'rform_item' });
    render(ei, data, options);
    addItemButtons(ei);
    return ei;
  }

  function render_array (elt, data, options) {
    var e = rcreate(elt, 'div', { 'class': 'rform_array' });
    for (var i = 0; i < data.length; i++) { render_item(e, data[i], options); }
    addArrayButtons(e);
    return e;
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
    return e;
  }

  function render_boolean (elt, data, options) {
    // TODO : radio
  }

  function render_new (elt, options) {
    return rcreate(elt, 'div', { 'class': 'rform_new' }, 'string number boolean array hash');
  }

  function render_number (elt, data, options) {
    options = hclone(options);
    options['class'] = 'rform_number';
    return render_string(elt, data.toString(), options);
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
    return e;
  }

  function render (elt, data, options) {
    if (data == EmptyItem) return render_new(elt, options);
    var t = data['__class'] || (typeof data);
    if (t == 'object') {
      var l = data.length; 
      if (l || l == 0) t = 'array';
    }
    var f = eval('render_' + t);
    return f.call(null, elt, data, options);
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
