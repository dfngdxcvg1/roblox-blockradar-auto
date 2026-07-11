function createAdSlot(kind = "leaderboard") {
  const slot = document.createElement("aside");
  slot.className = `ad-slot ${kind}`;
  slot.setAttribute("aria-label", "Advertisement");
  slot.textContent = "Advertisement";
  return slot;
}

function insertAfter(target, node) {
  if (target?.parentNode) {
    target.parentNode.insertBefore(node, target.nextSibling);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main");
  if (!main || document.querySelector(".ad-slot")) return;

  const hero = document.querySelector(".hero, .page-title, .detail-hero");
  insertAfter(hero, createAdSlot("leaderboard"));

  const feature = document.querySelector(".editorial-feature, .article-grid, .detail-grid, .page-grid");
  if (feature) {
    insertAfter(feature, createAdSlot("in-content"));
  }

  const detailGrid = document.querySelector(".detail-grid");
  if (detailGrid) {
    const card = createAdSlot("card-ad");
    const wrapper = document.createElement("article");
    wrapper.className = "detail-card";
    wrapper.appendChild(card);
    detailGrid.insertBefore(wrapper, detailGrid.children[3] || null);
  }
});
