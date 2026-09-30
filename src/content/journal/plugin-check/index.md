---
title: Plugin check
publishDate: 2026-10-04
categories: [landscape]
description: A draft fixture for checking the Obsidian plugin — every block, placeholder images copied from the fog piece. Never published (draft).
cover: ./land-a.jpg
draft: true
---

A plain markdown image, previewed natively by Obsidian:

![The trail](./land-a.jpg)

Leaf forms — the plugin shows the image:

::single{src="./land-b.jpg" alt="Single"}

::wide{src="./land-c.jpg" alt="Wide"}

::tall{src="./port-a.jpg" alt="Tall"}

::inset{src="./square.jpg" alt="Inset"}

::fullbleed{src="./pano.jpg" alt="Fullbleed"}

::diptych{left="./land-c.jpg" right="./port-b.jpg" leftAlt="Left" rightAlt="Right"}

::triptych{left="./land-a.jpg" center="./square.jpg" right="./port-a.jpg" leftAlt="Left" centerAlt="Centre" rightAlt="Right"}

Container forms — raw text in Live Preview, a caption on the site:

:::wide{src="./land-b.jpg" alt="Wide with a caption"}
The caption under the frame.
:::

The three blocks that take stages — the plugin shows the stages' images with their labels:

:::compare{mode="filmstrip"}
![Camera](./_land-b.jpg) The RAW file straight out of camera — no edits, no adjustments.
![Tones](./_land-b.tones.jpg) Shadows lifted on the ridge, the fog's highlights held.
![Finished](./land-b.jpg) A touch of warmth over the whole frame.
:::

:::side
![Camera](./_land-b.jpg) Straight out of the camera.
![Finished](./land-b.jpg) The print.
:::

:::slider
![Camera](./_land-b.jpg) Straight out of the camera.
![Finished](./land-b.jpg) The print.
:::

Raw by design in the plugin (`grid`, `strip`, `aside`, `row`, `held`):

:::grid
![One](./land-a.jpg)
![Two](./land-b.jpg)
![Three](./land-c.jpg)

The grid's caption.
:::

:::held{src="./land-b.jpg" alt="Held" side="right"}
Prose beside a held frame.

More prose.
:::
