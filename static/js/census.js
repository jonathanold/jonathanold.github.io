/* India Census Explorer.
 *
 * The whole catalogue -- 40,214 rows -- is fetched once as a compact JSON
 * (see scripts/build_census_data.py for the encoding) and filtered in the
 * page.  There is no server, so nothing here can go to sleep.
 */
(function () {
  "use strict";

  var DATA_URL = "/data/census.json";
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

  // Topic filters are conjunctive: pick two topics and a row must match both,
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

    { id: "keywords", label: "Keywords",
      // `filters` holds combinations like "PCA, SC"; the control offers the
      // individual keywords and matches any row whose combination includes one.
      values: function () {
        var seen = new Set();
        D.dicts.filters.forEach(function (f) {
          if (f) f.split(", ").forEach(function (k) { seen.add(k); });
        });
        return Array.from(seen).sort().map(function (k) { return { value: k, label: k }; });
      },
      test: function (i, picked) {
        var parts = D.filterParts[D.filters[i]];
        for (var p = 0; p < parts.length; p++) if (picked.has(parts[p])) return true;
        return false;
      } },

    { id: "topics1", label: "Topics (1 word)",
      values: function () { return D.dicts.topics1.map(function (t) { return { value: t, label: t }; }); },
      test: function (i, picked) { return everyTermInTitle(i, picked); } },

    { id: "topics2", label: "Topics (2 words)",
      values: function () { return D.dicts.topics2.map(function (t) { return { value: t, label: t }; }); },
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
      filters: r.filters,
      // "PCA, SC" -> ["PCA","SC"], once per dictionary entry rather than per row
      filterParts: raw.dicts.filters.map(function (f) { return f ? f.split(", ") : []; })
    };
  }

  /* ------------------------------------------------------------ controls */

  function picked(id) {
    var sel = el("cx-f-" + id);
    var out = new Set();
    for (var i = 0; i < sel.selectedOptions.length; i++) out.add(sel.selectedOptions[i].value);
    return out;
  }

  function fill(f) {
    var sel = el("cx-f-" + f.id);
    var keep = picked(f.id);
    sel.innerHTML = "";
    f.values({ series: picked("series") }).forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = o.value;
      opt.textContent = o.label;
      if (keep.has(o.value)) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function refreshDependent() { fill(FILTERS[1]); }   // sub-tables follow series

  function buildFilters() {
    var wrap = el("cx-filters");
    wrap.innerHTML = "";
    FILTERS.forEach(function (f) {
      var box = document.createElement("label");
      box.className = "cx-filter";
      var caption = document.createElement("span");
      caption.textContent = f.label;
      var sel = document.createElement("select");
      sel.multiple = true;
      sel.size = 5;
      sel.id = "cx-f-" + f.id;
      sel.addEventListener("change", function () {
        if (f.id === "series") refreshDependent();
        run();
      });
      box.appendChild(caption);
      box.appendChild(sel);
      wrap.appendChild(box);
    });
    FILTERS.forEach(function (f) { fill(f); });
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
      FILTERS.forEach(function (f) { el("cx-f-" + f.id).selectedIndex = -1; });
      refreshDependent();
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
