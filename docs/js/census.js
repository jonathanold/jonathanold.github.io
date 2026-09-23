/* India Census Explorer.
 *
 * The whole catalogue -- 40,214 rows -- is fetched once as a compact JSON
 * (see scripts/build_census_data.py for the encoding) and filtered in the
 * page.  There is no server, so nothing here can go to sleep.
 */
(function () {
  "use strict";

  // The layout hands over a content-hashed URL; the plain path is the fallback.
  var DATA_URL = window.CENSUS_DATA || "/data/census.json";
  var PAGE = 200;               // rows appended per scroll
  var el = function (id) { return document.getElementById(id); };

  var D = null;                 // decoded catalogue
  var matches = [];             // row indices passing the current filters
  var shown = 0;
  var sort = { key: "downloads", dir: -1 };

  // Which columns the table shows, and how to read each one from a row index.
  var COLUMNS = [
    { key: "title",     label: "Title",     cls: "cx-title",  get: function (i) { return D.title[i]; } },
    { key: "state",     label: "State",     cls: "cx-nowrap", get: function (i) { return D.dicts.state[D.state[i]]; } },
    { key: "year",      label: "Year",      cls: "cx-nowrap", get: function (i) { return D.dicts.year[D.year[i]]; } },
    { key: "table",     label: "Table",     cls: "cx-nowrap", get: function (i) { return D.dicts.table[D.table[i]]; } },
    { key: "filters",   label: "Filter",    cls: "cx-nowrap", get: function (i) { return D.dicts.filters[D.filters[i]]; } },
    { key: "downloads", label: "Downloads", cls: "cx-num",    get: function (i) { return D.downloads[i]; } }
  ];

  // The topic filter is conjunctive: pick two topics and a row must match both,
  // as the Streamlit version did by chaining filters.
  function everyTermInTitle(i, picked) {
    var title = D.lower[i], ok = true;
    picked.forEach(function (topic) {
      if (!ok) return;
      var words = topic.split(" ");
      for (var w = 0; w < words.length; w++) {
        if (title.indexOf(words[w]) === -1) { ok = false; return; }
      }
    });
    return ok;
  }

  // The filter controls, in sidebar order.  `values` lists the options and
  // `test` says whether a row matches a chosen option.
  var FILTERS = [
    { id: "series", label: "Series",
      values: function () {
        return D.dicts.series.map(function (s, i) {
          return { value: String(i), label: s + " – " + D.dicts.seriesTitles[i] };
        });
      },
      test: function (i, picked) { return picked.has(String(D.series[i])); } },

    { id: "table", label: "Sub-tables",
      // Narrows to the chosen series, the way the Streamlit sidebar did.
      values: function (state) {
        var series = state.series;
        var seen = new Set();
        for (var i = 0; i < D.n; i++) {
          if (series.size && !series.has(String(D.series[i]))) continue;
          seen.add(D.table[i]);
        }
        return D.dicts.table
          .map(function (t, i) { return { value: String(i), label: t }; })
          .filter(function (o) { return seen.has(Number(o.value)) && o.label !== ""; });
      },
      test: function (i, picked) { return picked.has(String(D.table[i])); } },

    { id: "state", label: "States / UT",
      values: function () {
        return D.dicts.state
          .map(function (s, i) { return { value: String(i), label: s }; })
          .filter(function (o) { return o.label !== ""; });
      },
      test: function (i, picked) { return picked.has(String(D.state[i])); } },

    { id: "year", label: "Census years",
      values: function () {
        // Newest first, with the two non-years last.
        var order = ["2011", "2001", "1991", "1981", "1971", "1961", "1951", "Other", "Unknown"];
        return D.dicts.year
          .map(function (y, i) { return { value: String(i), label: y }; })
          .sort(function (a, b) { return order.indexOf(a.label) - order.indexOf(b.label); });
      },
      test: function (i, picked) { return picked.has(String(D.year[i])); } },

    { id: "topics1", label: "Topics",
      values: function () { return D.dicts.topics1.map(function (t) { return { value: t, label: t }; }); },
      test: function (i, picked) { return everyTermInTitle(i, picked); } }
  ];

  /* ---------------------------------------------------------------- data */

  function decode(raw) {
    var r = raw.rows;
    var n = r.title.length;
    var i;

    // catalogDelta is a running difference; fileOffset is relative to the
    // catalogue id, and 0 means the entry has no downloadable file.
    var catalog = new Int32Array(n), running = 0;
    for (i = 0; i < n; i++) { running += r.catalogDelta[i]; catalog[i] = running; }

    var lower = new Array(n);
    for (i = 0; i < n; i++) lower[i] = r.title[i].toLowerCase();

    return {
      n: n,
      base: raw.catalog,
      dicts: raw.dicts,
      title: r.title,
      lower: lower,
      catalog: catalog,
      fileOffset: r.fileOffset,
      downloads: r.downloads,
      series: r.series,
      table: r.table,
      year: r.year,
      state: r.state,
      filters: r.filters
    };
  }

  /* ------------------------------------------------------------ controls */

  /* Each filter is a scrollable list of checkboxes: click to add, click again
     to drop, nothing to hold down, and the selection is always visible.  The
     chosen values live here rather than in the DOM, so that rebuilding a list
     -- the sub-tables do that whenever the series change -- does not lose
     them.  Lists longer than this get their own type-to-narrow box; there are
     297 sub-tables. */
  var SEARCHABLE_FROM = 12;
  var chosen = {};

  function picked(id) { return chosen[id]; }

  function fill(f) {
    var list = el("cx-o-" + f.id);
    var options = f.values({ series: chosen.series });
    var available = new Set(options.map(function (o) { return o.value; }));

    // Drop anything the reader had chosen that this list no longer offers.
    chosen[f.id].forEach(function (v) { if (!available.has(v)) chosen[f.id].delete(v); });

    list.innerHTML = "";
    options.forEach(function (o) {
      var row = document.createElement("label");
      row.className = "cx-opt";
      row.dataset.search = o.label.toLowerCase();

      var box = document.createElement("input");
      box.type = "checkbox";
      box.value = o.value;
      box.checked = chosen[f.id].has(o.value);
      box.addEventListener("change", function () {
        if (box.checked) chosen[f.id].add(o.value);
        else chosen[f.id].delete(o.value);
        if (f.id === "series") refreshDependent();
        mark(f);
        run();
      });

      var text = document.createElement("span");
      text.textContent = o.label;

      row.appendChild(box);
      row.appendChild(text);
      list.appendChild(row);
    });
    mark(f);
  }

  /* The "3 selected / clear" line above each list. */
  function mark(f) {
    var n = chosen[f.id].size;
    var note = el("cx-n-" + f.id);
    note.textContent = n ? n + " selected" : "";
    el("cx-c-" + f.id).hidden = n === 0;
    el("cx-g-" + f.id).classList.toggle("cx-active", n > 0);
  }

  function clearOne(f) {
    chosen[f.id].clear();
    if (f.id === "series") refreshDependent();
    fill(f);
    run();
  }

  function refreshDependent() { fill(FILTERS[1]); }   // sub-tables follow series

  function buildFilters() {
    var wrap = el("cx-filters");
    wrap.innerHTML = "";

    FILTERS.forEach(function (f) {
      chosen[f.id] = new Set();

      var group = document.createElement("fieldset");
      group.className = "cx-filter";
      group.id = "cx-g-" + f.id;

      var legend = document.createElement("legend");
      legend.textContent = f.label;
      group.appendChild(legend);

      var bar = document.createElement("div");
      bar.className = "cx-optbar";
      var note = document.createElement("span");
      note.className = "cx-selected";
      note.id = "cx-n-" + f.id;
      var clear = document.createElement("button");
      clear.type = "button";
      clear.className = "cx-clear";
      clear.id = "cx-c-" + f.id;
      clear.textContent = "clear";
      clear.hidden = true;
      clear.addEventListener("click", function () { clearOne(f); });
      bar.appendChild(note);
      bar.appendChild(clear);
      group.appendChild(bar);

      var list = document.createElement("div");
      list.className = "cx-options";
      list.id = "cx-o-" + f.id;
      group.appendChild(list);
      wrap.appendChild(group);
    });

    // The narrow-this-list boxes need the option counts, so they are added
    // once the lists have been filled.
    FILTERS.forEach(function (f) { fill(f); });
    FILTERS.forEach(function (f) {
      var list = el("cx-o-" + f.id);
      if (list.children.length < SEARCHABLE_FROM) return;
      var find = document.createElement("input");
      find.type = "search";
      find.className = "cx-find";
      find.placeholder = "Narrow this list\u2026";
      find.addEventListener("input", function () {
        var q = find.value.toLowerCase();
        Array.prototype.forEach.call(list.children, function (row) {
          row.hidden = q !== "" && row.dataset.search.indexOf(q) === -1;
        });
      });
      list.parentNode.insertBefore(find, list);
    });
  }

  /* ------------------------------------------------------------ filtering */

  function run() {
    var terms = el("cx-q").value.toLowerCase().split(/\s+/).filter(Boolean);
    var active = FILTERS
      .map(function (f) { return { f: f, picked: picked(f.id) }; })
      .filter(function (a) { return a.picked.size > 0; });

    var out = [];
    outer:
    for (var i = 0; i < D.n; i++) {
      for (var t = 0; t < terms.length; t++) {
        if (D.lower[i].indexOf(terms[t]) === -1) continue outer;
      }
      for (var a = 0; a < active.length; a++) {
        if (!active[a].f.test(i, active[a].picked)) continue outer;
      }
      out.push(i);
    }
    matches = out;
    applySort();
    render(true);
  }

  function applySort() {
    var col = COLUMNS.filter(function (c) { return c.key === sort.key; })[0];
    var dir = sort.dir;
    var numeric = col.key === "downloads";
    matches.sort(function (x, y) {
      var a = col.get(x), b = col.get(y);
      if (numeric) return (a - b) * dir;
      return a < b ? -dir : a > b ? dir : 0;
    });
  }

  /* -------------------------------------------------------------- render */

  function header() {
    var row = el("cx-headrow");
    row.innerHTML = "";
    COLUMNS.forEach(function (c) {
      var th = document.createElement("th");
      th.textContent = c.label;
      if (sort.key === c.key) {
        th.setAttribute("aria-sort", sort.dir === 1 ? "ascending" : "descending");
        var arrow = document.createElement("span");
        arrow.className = "cx-arrow";
        arrow.textContent = sort.dir === 1 ? "▲" : "▼";
        th.appendChild(arrow);
      }
      th.addEventListener("click", function () {
        if (sort.key === c.key) sort.dir = -sort.dir;
        else sort = { key: c.key, dir: c.key === "downloads" ? -1 : 1 };
        applySort();
        render(true);
      });
      row.appendChild(th);
    });
    // Link columns are not sortable, so they are added after the loop.
    ["Catalog", "File"].forEach(function (label) {
      var th = document.createElement("th");
      th.textContent = label;
      th.style.cursor = "default";
      row.appendChild(th);
    });
  }

  function link(href, text) {
    var a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  function fileUrl(i) {
    return D.base + D.catalog[i] + "/download/" + (D.catalog[i] + D.fileOffset[i]);
  }

  function render(reset) {
    if (reset) { el("cx-body").innerHTML = ""; shown = 0; }
    header();

    var frag = document.createDocumentFragment();
    var upto = Math.min(shown + PAGE, matches.length);
    for (var k = shown; k < upto; k++) {
      var i = matches[k];
      var tr = document.createElement("tr");
      COLUMNS.forEach(function (c) {
        var td = document.createElement("td");
        td.className = c.cls;
        var v = c.get(i);
        td.textContent = c.key === "downloads" ? v.toLocaleString("en-US") : v;
        if (c.key === "title") td.title = v;
        tr.appendChild(td);
      });

      var cat = document.createElement("td");
      cat.className = "cx-nowrap";
      cat.appendChild(link(D.base + D.catalog[i], "Page"));
      tr.appendChild(cat);

      var file = document.createElement("td");
      file.className = "cx-nowrap";
      if (D.fileOffset[i]) file.appendChild(link(fileUrl(i), "Download"));
      else file.textContent = "—";
      tr.appendChild(file);

      frag.appendChild(tr);
    }
    el("cx-body").appendChild(frag);
    shown = upto;

    el("cx-count").innerHTML =
      "Showing <b>" + shown.toLocaleString("en-US") + "</b> of <b>" +
      matches.length.toLocaleString("en-US") + "</b> matching entries" +
      (matches.length === D.n ? " (the whole catalogue)." : ".");

    var more = el("cx-more");
    more.hidden = shown >= matches.length;
    more.textContent = more.hidden ? "" : "Scroll for more…";
  }

  /* ----------------------------------------------------------------- csv */

  function csv() {
    var head = COLUMNS.map(function (c) { return c.label; }).concat(["Catalog", "File"]);
    var lines = [head.join(",")];
    for (var k = 0; k < matches.length; k++) {
      var i = matches[k];
      var cells = COLUMNS.map(function (c) { return c.get(i); });
      cells.push(D.base + D.catalog[i]);
      cells.push(D.fileOffset[i] ? fileUrl(i) : "");
      lines.push(cells.map(function (v) {
        v = String(v);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(","));
    }
    var blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "india-census-search.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ---------------------------------------------------------------- boot */

  function debounce(fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  function ready() {
    buildFilters();
    header();

    // Enter in the search box would otherwise submit the form and reload the
    // page, throwing away every filter the reader had set.
    el("cx-controls").addEventListener("submit", function (e) { e.preventDefault(); });

    el("cx-q").addEventListener("input", debounce(run, 150));
    el("cx-reset").addEventListener("click", function () {
      el("cx-q").value = "";
      FILTERS.forEach(function (f) { chosen[f.id].clear(); });
      Array.prototype.forEach.call(document.querySelectorAll(".cx-find"), function (i) {
        i.value = "";
      });
      FILTERS.forEach(function (f) { fill(f); });
      // A narrow-this-list box may have hidden rows before the reset.
      Array.prototype.forEach.call(document.querySelectorAll(".cx-opt"), function (r) {
        r.hidden = false;
      });
      run();
    });
    el("cx-csv").addEventListener("click", csv);

    window.addEventListener("scroll", function () {
      if (shown >= matches.length) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) render(false);
    }, { passive: true });

    el("cx-status").hidden = true;
    el("cx").hidden = false;
    run();
  }

  fetch(DATA_URL)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (raw) { D = decode(raw); ready(); })
    .catch(function (e) {
      el("cx-status").textContent =
        "Could not load the catalogue (" + e.message + "). Please reload the page.";
    });
})();
