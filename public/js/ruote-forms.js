
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
  // rendering

  function render_array (elt, data, options) {
    var e = create(elt, 'div', { 'class': 'rform_array' });
    for (var i = 0; i < data.length; i++) {
      var ei = create(e, 'div', { 'class': 'rform_item' });
      render(ei, data[i], options);
    }
  }

  function render_object (elt, data, options) {
    var e = create(elt, 'div', { 'class': 'rform_hash' });
    for (var k in data) {
      var ee = create(e, 'div', { 'class': 'rform_entry' });
      var ek = create(ee, 'div', { 'class': 'rform_key' });
      var ev = create(ee, 'div', { 'class': 'rform_value' });
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
    // TODO
  }

  function render_string (elt, data, options) {
    var e = create(elt, 'span', { 'class': 'rform_string' });
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

