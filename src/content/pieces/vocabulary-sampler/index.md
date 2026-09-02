---
title: The vocabulary sampler
publishDate: 2026-09-01
categories: [landscape, street]
description: >-
  Every block treatment, both forms, every attribute — the mechanical
  reference for the spec-003 vocabulary. A fixture, not a piece.
cover: ./land-a.jpg
draft: false
---

This fixture exercises the whole closed vocabulary in order. Each
section shows a treatment's leaf form, its captioned container form,
and its attributes. The images are generated placeholders labeled with
their aspect ratios.

## Single

The shorthand — plain markdown, no caption:

![A 3:2 placeholder](./land-a.jpg)

The directive form, identical width:

::single{src="./land-b.jpg" alt="A 3:2 placeholder"}

And captioned:

:::single{src="./land-c.jpg" alt="A 3:2 placeholder"}
A caption with _inline markdown_ — the container body.
:::

## Inset

::inset{src="./square.jpg" alt="A square placeholder"}

:::inset{src="./square.jpg" alt="A square placeholder"}
Narrower than the text, centered. For detail shots.
:::

## Wide

::wide{src="./land-a.jpg" alt="A 3:2 placeholder"}

:::wide{src="./land-b.jpg" alt="A 3:2 placeholder"}
The centered breakout — wider than the prose, short of the viewport.
:::

Half-bleed, left and right:

::wide{src="./land-c.jpg" alt="A 3:2 placeholder" bleed="left"}

::wide{src="./land-a.jpg" alt="A 3:2 placeholder" bleed="right"}

## Fullbleed

::fullbleed{src="./land-a.jpg" alt="A 3:2 placeholder"}

:::fullbleed{src="./land-b.jpg" alt="A 3:2 placeholder"}
Viewport edge to edge; the caption returns to the column.
:::

## Tall

::tall{src="./port-b.jpg" alt="A 2:3 placeholder"}

:::tall{src="./port-a.jpg" alt="A 2:3 placeholder"}
Capped at viewport height — the vertical counterpart to fullbleed.
:::

## Diptych

Default — equal widths, mixed orientations centered on the midline:

::diptych{left="./land-a.jpg" right="./port-a.jpg" leftAlt="Landscape" rightAlt="Portrait"}

Captioned:

:::diptych{left="./land-b.jpg" right="./land-c.jpg" leftAlt="Left frame" rightAlt="Right frame"}
Two matched frames, each on its own mat.
:::

Equal heights — widths follow the aspect ratios:

::diptych{left="./land-a.jpg" right="./port-b.jpg" leftAlt="Landscape" rightAlt="Portrait" match="height"}

Weighted, left then right:

::diptych{left="./land-b.jpg" right="./port-45.jpg" leftAlt="Dominant" rightAlt="Companion" weight="left"}

::diptych{left="./port-45.jpg" right="./land-c.jpg" leftAlt="Companion" rightAlt="Dominant" weight="right"}

Width variants — the pair breaks out to the content width, then the
viewport (mats drop at fullbleed; edge-to-edge is the point):

::diptych{left="./land-a.jpg" right="./land-b.jpg" leftAlt="Left" rightAlt="Right" width="wide"}

::diptych{left="./land-c.jpg" right="./port-a.jpg" leftAlt="Left" rightAlt="Portrait" width="fullbleed"}

## Triptych

Horizontal–vertical–horizontal on the midline:

::triptych{left="./land-a.jpg" center="./port-a.jpg" right="./land-b.jpg" leftAlt="H" centerAlt="V" rightAlt="H"}

Equal heights:

::triptych{left="./land-c.jpg" center="./port-b.jpg" right="./square.jpg" leftAlt="H" centerAlt="V" rightAlt="S" match="height"}

Triptych at the content width, then the viewport:

::triptych{left="./land-a.jpg" center="./port-b.jpg" right="./land-c.jpg" leftAlt="H" centerAlt="V" rightAlt="H" width="wide"}

::triptych{left="./land-b.jpg" center="./port-a.jpg" right="./land-a.jpg" leftAlt="H" centerAlt="V" rightAlt="H" width="fullbleed"}

## Grid

:::grid
![One](./land-a.jpg)
![Two](./port-45.jpg)
![Three](./square.jpg)
![Four](./land-b.jpg)

A four-image cluster with a caption spanning the grid.
:::

## Strip

A single panorama:

:::strip
![A 3:1 panorama placeholder](./pano.jpg)

The band scrolls sideways; the pano keeps its height.
:::

A filmstrip:

:::strip
![One](./land-a.jpg)
![Two](./port-a.jpg)
![Three](./land-b.jpg)
![Four](./square.jpg)
![Five](./land-c.jpg)
:::

## Aside

:::aside{src="./port-45.jpg" alt="A 4:5 placeholder" side="left"}
The prose wraps around the floated figure. This paragraph needs enough
words to actually wrap: the aside is for commentary tied to one image,
where the text should flow past the frame rather than sit locked
beside it. A second sentence gives the wrap room to show itself.
:::

:::aside{src="./port-45.jpg" alt="A 4:5 placeholder" side="right"}
The same treatment mirrored. Floats clear before the next block.
:::

## Row

:::row{src="./port-a.jpg" alt="A 2:3 placeholder" side="left"}
The row keeps image and prose in separate columns — no wrap. Longer
text sits beside the frame, top-aligned, and the pair collapses to a
stack on phones.
:::

:::row{src="./land-a.jpg" alt="A 3:2 placeholder" side="right"}
Mirrored, image on the right.
:::
