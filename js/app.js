// Spidy x Lavander App Controller

let currentCategory = 'all';
let currentStore = 'all';
let currentSort = 'featured';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderProducts();
  setupEventListeners();
  updateCategoryCounts();
}

function getFilteredProducts() {
  return PRODUCTS.filter(item => {
    // Category match
    let matchesCategory = false;
    if (currentCategory === 'all') {
      matchesCategory = true;
    } else if (currentCategory === 'under499') {
      matchesCategory = item.price <= 499;
    } else if (currentCategory === 'under999') {
      matchesCategory = item.price <= 999;
    } else {
      matchesCategory = item.category === currentCategory;
    }

    // Store match
    let matchesStore = (currentStore === 'all') || (item.store.toLowerCase() === currentStore.toLowerCase());

    // Search query match
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      matchesSearch = item.title.toLowerCase().includes(q) ||
                      item.description.toLowerCase().includes(q) ||
                      item.store.toLowerCase().includes(q) ||
                      item.categoryLabel.toLowerCase().includes(q);
    }

    return matchesCategory && matchesStore && matchesSearch;
  }).sort((a, b) => {
    if (currentSort === 'price-low') {
      return a.price - b.price;
    } else if (currentSort === 'price-high') {
      return b.price - a.price;
    } else if (currentSort === 'discount') {
      const discA = parseInt(a.discount) || 0;
      const discB = parseInt(b.discount) || 0;
      return discB - discA;
    } else if (currentSort === 'rating') {
      return b.rating - a.rating;
    }
    return 0; // Default featured order
  });
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  const countSpan = document.getElementById('product-count');
  const emptyState = document.getElementById('empty-state');

  const filtered = getFilteredProducts();

  if (countSpan) {
    countSpan.textContent = `${filtered.length} curated deals available`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  grid.innerHTML = filtered.map(item => {
    const storeInfo = STORE_CONFIG[item.store] || { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.1)', icon: '🛍️' };
    
    // Is link configured?
    const hasCustomLink = item.affiliateLink && item.affiliateLink !== 'YOUR_EARNKARO_LINK_HERE';
    const targetUrl = hasCustomLink 
      ? item.affiliateLink 
      : getFallbackStoreUrl(item);

    return `
      <article class="product-card glass rounded-2xl overflow-hidden flex flex-col justify-between group border border-slate-800/80 hover:border-purple-500/30">
        <!-- Top Media -->
        <div class="relative overflow-hidden aspect-[4/3] bg-slate-900/60">
          <img 
            src="${item.image}" 
            alt="${escapeHtml(item.title)}" 
            loading="lazy"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onerror="this.src='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'"
          />
          
          <!-- Badges overlay -->
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
            <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 shadow-sm">
              ${item.badge}
            </span>
          </div>

          <div class="absolute top-3 right-3 z-10">
            <span 
              class="px-2.5 py-1 text-xs font-bold rounded-full backdrop-blur-md border shadow-sm flex items-center gap-1"
              style="background-color: ${storeInfo.bg}; color: ${storeInfo.color}; border-color: ${storeInfo.color}40;"
            >
              <span>${storeInfo.icon}</span> ${item.store}
            </span>
          </div>

          <div class="absolute bottom-2 right-2 z-10">
            <span class="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/90 text-white backdrop-blur-sm shadow">
              ${item.discount}
            </span>
          </div>
        </div>

        <!-- Body -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs uppercase tracking-wider text-purple-400 font-semibold">
                ${item.categoryLabel}
              </span>
              <span class="text-slate-600">•</span>
              <span class="text-xs text-amber-400 flex items-center gap-1 font-medium">
                ★ ${item.rating} <span class="text-slate-400 text-[11px]">(${item.reviews})</span>
              </span>
            </div>

            <h3 class="font-bold text-slate-100 text-base leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors mb-2">
              ${escapeHtml(item.title)}
            </h3>

            <p class="text-xs text-slate-400 line-clamp-2 mb-4">
              ${escapeHtml(item.description)}
            </p>
          </div>

          <!-- Price & Action -->
          <div class="pt-3 border-t border-slate-800/80">
            <div class="flex items-baseline justify-between mb-3">
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-extrabold text-white heading-font">
                  ₹${item.price}
                </span>
                <span class="text-xs text-slate-500 line-through">
                  ₹${item.originalPrice}
                </span>
              </div>
              <span class="text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                Save ₹${item.originalPrice - item.price}
              </span>
            </div>

            <!-- Buttons -->
            <div class="flex gap-2">
              <a 
                href="${targetUrl}" 
                target="_blank" 
                rel="noopener sponsored nofollow"
                onclick="handleDealClick(event, '${item.id}')"
                class="btn-deal flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-center text-white bg-gradient-to-r from-red-500 via-purple-600 to-indigo-600 hover:from-red-600 hover:to-purple-700 shadow-md shadow-purple-950/40 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>👉 Grab Deal on ${item.store}</span>
              </a>

              <button 
                onclick="shareProduct('${item.id}', '${escapeHtml(item.title)}', ${item.price}, '${item.store}')"
                title="Share this deal"
                class="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-purple-500/40 hover:bg-slate-800 transition-all flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function getFallbackStoreUrl(item) {
  // If user hasn't added their EarnKaro link yet, send to the store search query
  const query = encodeURIComponent(item.title);
  if (item.store === 'Myntra') return `https://www.myntra.com/${query}`;
  if (item.store === 'Ajio') return `https://www.ajio.com/search/?text=${query}`;
  if (item.store === 'Flipkart') return `https://www.flipkart.com/search?q=${query}`;
  if (item.store === 'boAt') return `https://www.boat-lifestyle.com/search?q=${query}`;
  return 'https://earnkaro.com';
}

function handleDealClick(e, productId) {
  const item = PRODUCTS.find(p => p.id === productId);
  if (item && item.affiliateLink === 'YOUR_EARNKARO_LINK_HERE') {
    // Notify user to update their EarnKaro link
    showToast(`Opening ${item.store}! Replace with your EarnKaro link in js/products.js`, 'info');
  }
}

function shareProduct(id, title, price, store) {
  const shareText = `Check out this steal deal: ${title} at just ₹${price} on ${store}! Found on https://spidyxlavander.in`;
  
  if (navigator.share) {
    navigator.share({
      title: title,
      text: shareText,
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      showToast('Deal link copied to clipboard! Share on WhatsApp 🚀', 'success');
    });
  }
}

function setupEventListeners() {
  // Category tabs
  const categoryButtons = document.querySelectorAll('[data-category]');
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b => {
        b.classList.remove('bg-purple-600', 'text-white', 'shadow-lg', 'shadow-purple-900/40');
        b.classList.add('bg-slate-900/60', 'text-slate-400', 'border-slate-800');
      });

      btn.classList.add('bg-purple-600', 'text-white', 'shadow-lg', 'shadow-purple-900/40');
      btn.classList.remove('bg-slate-900/60', 'text-slate-400', 'border-slate-800');

      currentCategory = btn.getAttribute('data-category');
      renderProducts();
    });
  });

  // Store filter
  const storeSelect = document.getElementById('store-filter');
  if (storeSelect) {
    storeSelect.addEventListener('change', (e) => {
      currentStore = e.target.value;
      renderProducts();
    });
  }

  // Sort select
  const sortSelect = document.getElementById('sort-filter');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  // Live search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Reset filters
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentCategory = 'all';
      currentStore = 'all';
      currentSort = 'featured';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      if (storeSelect) storeSelect.value = 'all';
      if (sortSelect) sortSelect.value = 'featured';

      categoryButtons.forEach(b => {
        if (b.getAttribute('data-category') === 'all') {
          b.classList.add('bg-purple-600', 'text-white');
          b.classList.remove('bg-slate-900/60', 'text-slate-400');
        } else {
          b.classList.remove('bg-purple-600', 'text-white');
          b.classList.add('bg-slate-900/60', 'text-slate-400');
        }
      });

      renderProducts();
    });
  }
}

function updateCategoryCounts() {
  const counts = {
    all: PRODUCTS.length,
    spidy: PRODUCTS.filter(p => p.category === 'spidy').length,
    lavender: PRODUCTS.filter(p => p.category === 'lavender').length,
    audio: PRODUCTS.filter(p => p.category === 'audio').length,
    decor: PRODUCTS.filter(p => p.category === 'decor').length,
    gifts: PRODUCTS.filter(p => p.category === 'gifts').length,
    under499: PRODUCTS.filter(p => p.price <= 499).length
  };

  Object.keys(counts).forEach(key => {
    const el = document.getElementById(`count-${key}`);
    if (el) el.textContent = counts[key];
  });
}

// Modal handling
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

// Toast notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.add('translate-y-24', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}
