"""Turn the India Census Archive parquet into a compact JSON the browser can hold.

The catalogue is 40,214 rows, but almost all of it repeats.  Three observations
get the payload from 6.9 MB to well under a megabyte over the wire:

  * Every catalogue link is CATALOG + <id>, and every download link is that same
    id plus /download/<file id>.  The trailing filename in the source data can
    go: censusindia.gov.in returns the file either way, and names it through
    Content-Disposition, so the browser still saves it under the right name.
  * Rows are written in catalogue-id order rather than by downloads.  Ids are
    handed out by series and state, so neighbouring rows have near-identical
    titles, and gzip pays far less for them.  The ids themselves then
    delta-encode to almost nothing, and the file id is stored as its offset
    from the catalogue id.  The app sorts by downloads on load.
  * Five columns have at most 39 distinct values, so they ship as indices into
    a dictionary.

Usage:  python scripts/build_census_data.py <parquet> <metadata.json> <out.json>
"""
import json
import re
import sys

import polars as pl

CATALOG = "https://censusindia.gov.in/nada/index.php/catalog/"
LINK_RE = re.compile(r"^" + re.escape(CATALOG) + r"(\d+)$")
FILE_RE = re.compile(r"^" + re.escape(CATALOG) + r"(\d+)/download/(\d+)(?:/.*)?$")

SERIES_TITLES = {
    "A": "General Population Tables",
    "B": "General Economic Tables",
    "C": "Social and Cultural Tables",
    "D": "Migration Tables",
    "DIS": "Disability Tables",
    "F": "Fertility Tables",
    "FH": "Female-headed Households Tables",
    "H": "Housing Tables",
    "HH": "Household Tables",
    "HL": "Household Amenities Tables",
    "I": "Other / Miscellaneous",
    "PCA": "Primary Census Abstract",
    "SC": "Scheduled Castes Tables",
    "ST": "Scheduled Tribes Tables",
    "Other": "Other / Miscellaneous",
}


def dictionary(values):
    """Distinct values, sorted, plus the index of each row's value."""
    order = sorted(set(values))
    index = {v: i for i, v in enumerate(order)}
    return order, [index[v] for v in values]


def main(src, meta_src, dest):
    df = pl.read_parquet(src).fill_null("")
    with open(meta_src) as fh:
        meta = json.load(fh)

    catalog_ids, file_ids = [], []
    for link, direct in zip(df["link"], df["direct_link"]):
        m = LINK_RE.match(link)
        if not m:
            raise SystemExit(f"unexpected catalog link: {link!r}")
        catalog_ids.append(int(m.group(1)))

        if not direct:                                   # 37 rows have no file
            file_ids.append(0)
            continue
        f = FILE_RE.match(direct)
        if not f:
            raise SystemExit(f"unexpected download link: {direct!r}")
        if f.group(1) != m.group(1):
            raise SystemExit(f"catalog id disagrees between columns: {link!r}")
        file_ids.append(int(f.group(2)))

    df = df.with_columns(
        catalog_id=pl.Series(catalog_ids), file_id=pl.Series(file_ids)
    ).sort("catalog_id")

    cat = list(df["catalog_id"])
    cat_delta = [cat[0]] + [cat[i] - cat[i - 1] for i in range(1, len(cat))]
    # 0 marks "no file"; a real offset is never 0, since the ids differ.
    file_offset = [f - c if f else 0 for c, f in zip(cat, df["file_id"])]

    series, series_ix = dictionary(df["table_series"])
    table, table_ix = dictionary(df["table_type"])
    year, year_ix = dictionary(df["census_year"])
    state, state_ix = dictionary(df["state"])
    filt, filt_ix = dictionary(df["filters"])

    out = {
        "catalog": CATALOG,
        "dicts": {
            "series": series,
            "seriesTitles": [SERIES_TITLES.get(s, "Unknown Series") for s in series],
            "table": table,
            "year": year,
            "state": state,
            "filters": filt,
            "topics1": meta["top_30_1word"],
            "topics2": meta["top_30_2word"],
        },
        "rows": {
            "title": list(df["title"]),
            "catalogDelta": cat_delta,
            "fileOffset": file_offset,
            "downloads": [int(d) for d in df["downloads"]],
            "series": series_ix,
            "table": table_ix,
            "year": year_ix,
            "state": state_ix,
            "filters": filt_ix,
        },
    }

    with open(dest, "w") as fh:
        json.dump(out, fh, separators=(",", ":"), ensure_ascii=False)
    print(f"{len(cat):,} rows -> {dest}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
