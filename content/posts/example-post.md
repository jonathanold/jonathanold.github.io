+++
title = "Example post"
date = 2026-08-19
draft = true
summary = "A template. Copy this file, or run `hugo new posts/my-post.md`, and set draft = false when it is ready to go live."
+++

This file has `draft = true`, so it is not built and never appears on the site.
Keep it as a reference for what a post looks like.

Ordinary Markdown works: **bold**, *italic*, [links](https://example.com), lists,
block quotes, and footnotes.[^1]

[^1]: Footnotes render at the bottom of the post.

## A heading

Images live in `static/images/posts/` and are referenced from the site root. Use
the `fig` shortcode when you want a caption:

{{< fig src="/images/posts/example.png" alt="What the figure shows" caption="Caption text. Source: somewhere." width="88%" >}}

> A pull quote, if you want one.
