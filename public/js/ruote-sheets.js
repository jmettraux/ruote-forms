/*
 * Copyright (c) 2007-2009, John Mettraux, jmettraux@gmail.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Made in Japan.
 */

var RuoteSheets = function() {

  function findElt (i) {
    if ((typeof i) == 'string') return document.getElementById(i);
    else return i;
  }

  function cellOnFocus (evt) {
    var e = evt || window.event;
    var sheet = fromElt.parentNode.parentNode;
    sheet.currentCell = e.target;
    alert(sheet.currentCell.getAttribute('class'));
  }

  function cellOnKeyUp (evt) {
    var e = evt || window.event;
    var c = e.charCode || e.keyCode;
    // up 38
    // down 40
    //alert("" + c + " / " + e.ctrlKey + " - " + e.altKey + " - " + e.shiftKey);
    if (c == 38 || c == 40) move(e, c);
    if (isCellEmpty(e.target) && (c == 37 || c == 39)) move(e, c);
    return (c != 13);
  }

  function isCellEmpty (elt) {

    return (elt.value == '');
  }

  function move (e, c) {

    var rc = determineRowCol(e.target);
    var row = rc[0]; var col = rc[1];

    if (c == 38) row--;
    else if (c == 40) row++;
    else if (c == 37) col--;
    else if (c == 39) col++;

    var cell = findCell(e.target.parentNode.parentNode, row, col);

    if (cell != null) {
      cell.focus();
      cell.parentNode.parentNode.currentCell = cell;
    }
  }

  function determineRowCol (elt) {
    var cc = elt.getAttribute('class').split(' ');
    return [ cc[1].split('_')[1], cc[2].split('_')[1] ];
  }

  function findCell (sheet, y, x) {
    var row = null;
    for (var i = 0; i < sheet.childNodes.length; i++) {
      var r = sheet.childNodes[i];
      if (r.nodeType != 1) continue;
      if (r.getAttribute('class').match(" row_" + y)) {
        row = r;
        break;
      }
    }
    if (row == null) return null;
    for (var i = 0; i < row.childNodes.length; i++) {
      var c = row.childNodes[i];
      if (c.nodeType != 1) continue;
      if (c.getAttribute('class').match(" column_" + x)) return c;
    }
    return null;
  }

  function computeColumns (data) {
    var cols = 0;
    for (var y = 0; y < data.length; y++) {
      var row = data[y];
      if (row.length > cols) cols = row.length;
    }
    return cols;
  }

  function render (container, data) {

    container = findElt(container);

    var rows = data.length;
    var cols = computeColumns(data);

    for (var y = 0; y < rows; y++) {

      var rdata = data[y];
      var row = document.createElement('div');
      row.setAttribute('class', 'ruse_row row_' + y);
      container.appendChild(row);

      for (var x = 0; x < cols; x++) {
        var input = document.createElement('input');
        input.setAttribute('class', 'ruse_cell row_' + y +' column_' + x);
        input.setAttribute('type', 'text');
        input.onkeyup = cellOnKeyUp;
        input.onfocus = cellOnFocus;
        input.value = rdata[x];
        row.appendChild(input);
      }
    }
  }
  
  function renderEmpty (container, rows, cols) {

    container = findElt(container);

    var data = [];
    for (var y = 0; y < rows; y++) {
      var row = [];
      for (var x = 0; x < cols; x++) row.push('');
      data.push(row);
    }
    render(container, data);
  }

  function iterate (sheet, func) {
    sheet = findElt(sheet);
    var y = 0;
    for (var yy = 0; yy < sheet.childNodes.length; yy++) {
      var e = sheet.childNodes[yy];
      if (e.nodeType != 1) continue;
      if ( ! e.getAttribute('class').match(/^ruse_row/)) continue;
      var x = 0;
      func.call(null, 'row', x, y, e);
      for (var xx = 0; xx < e.childNodes.length; xx++) {
        var ee = e.childNodes[xx];
        if (ee.nodeType != 1) continue;
        if ( ! ee.getAttribute('class').match(/^ruse_cell/)) continue;
        func.call(null, 'cell', x, y, ee);
        x++;
      }
      y++;
    }
  }

  function reclass (sheet) {

    iterate(sheet, function (t, x, y, e) {
      if (t == 'cell')
        e.setAttribute('class', 'ruse_cell row_' + y + ' column_' + x);
    });
  }

  function toArray (sheet) {

    var a = [];
    var row = null;

    iterate(sheet, function (t, x, y, e) {
      if (t == 'row') { row = []; a.push(row); }
      else { row.push(e.value); }
    });

    return a;
  }

  function addRow (sheet) {

    sheet = findElt(sheet);
    var cell = sheet.currentCell || findCell(sheet, 0, 0);

    // TODO : continue me
  }

  return {
    render: render,
    renderEmpty: renderEmpty,
    addRow: addRow,
    toArray: toArray
  };
}();

