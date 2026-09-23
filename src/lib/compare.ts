/**
 * The image page's compare (spec 006; moved here at spec 018, T1604c):
 * overlay the frames and reveal the range input. The overlay is one box
 * where the static page stacks two frames, so it must land before the
 * page settles: the initial astro:page-load fires on window's load,
 * after every image, and collapsing the stack there moved everything
 * below the figure ~555px (T1603c). So the layout's script runs it at
 * its module's evaluation (after the parse, before DOMContentLoaded),
 * beside the appearance hooks, and in astro:before-swap on the new
 * document for a page the router swaps in; a figure already overlaid is
 * skipped, so the first load binds its range once. The image page's own
 * script cannot do the second: the router runs a new page's scripts
 * after the swap's update callback is done (router.js), so a first
 * swap into a compare page would be overlaid after the view
 * transition's new snapshot, the router's scroll and the first layout.
 */
export const enhanceCompare = (scope: Document) => {
  for (const figure of scope.querySelectorAll<HTMLElement>('.compare')) {
    const range = figure.querySelector<HTMLInputElement>('.compare-range');
    if (!range || 'js' in figure.dataset) continue;
    figure.dataset.js = '';
    range.hidden = false;
    const apply = () => figure.style.setProperty('--split', range.value);
    range.addEventListener('input', apply);
    apply();
  }
};
