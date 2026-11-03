(() => {
  const PRODUCT = {
    id: 'neon-stack-lamp',
    name: 'Lampe NEON STACK',
    variant: 'Liasse à lévitation · LED chaude',
    price: 79,
    compareAt: 99,
    image: 'assets/img/photo-2.jpg',
  };
  const PROMO_END = new Date('2026-11-19T00:00:00+01:00');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const eur = (n) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  /* Loader */
  const loader = $('#loader');
  const hideLoader = () => setTimeout(() => loader.classList.add('is-done'), 400);
  let loaded = false;
  const done = () => { if (!loaded) { loaded = true; hideLoader(); } };
  window.addEventListener('lamp:ready', done);
  if (window.__lampReady) done();
  setTimeout(done, 3500);

  /* Compte à rebours */
  const cd = $('#countdown');
  const pad = (n) => String(n).padStart(2, '0');
  function tick() {
    let s = Math.max(0, Math.floor((PROMO_END - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); s %= 60;
    cd.textContent = `${d}j ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
  }
  tick(); setInterval(tick, 1000);

  /* Menu mobile */
  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#nav a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', false);
  }));

  /* Bouton allumer / éteindre */
  const power = $('#powerBtn');
  power.addEventListener('click', () => {
    if (!window.Lamp) return;
    const on = window.Lamp.toggle();
    power.setAttribute('aria-pressed', on);
    power.querySelector('span').textContent = on ? 'Allumée' : 'Éteinte';
  });

  /* Quantité */
  const qtyInput = $('#qty');
  $$('[data-qty]').forEach((b) => b.addEventListener('click', () => {
    qtyInput.value = Math.min(10, Math.max(1, (+qtyInput.value || 1) + +b.dataset.qty));
  }));

  /* Panier (localStorage — remplacé par le panier Shopify à l'intégration) */
  const KEY = 'neonstack_cart';
  let qtyInCart = 0;
  try { qtyInCart = +localStorage.getItem(KEY) || 0; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, qtyInCart); } catch (e) {} };

  const body = document.body;
  const count = $('#cartCount');
  function render() {
    count.textContent = qtyInCart;
    $('#cartTotal').textContent = eur(qtyInCart * PRODUCT.price);
    $('#shipMsg').hidden = qtyInCart === 0;
    $('#checkout').disabled = qtyInCart === 0;
    $('#cartBody').innerHTML = qtyInCart === 0
      ? '<p class="drawer__empty">Ton panier est vide.<br>Le butin t\'attend.</p>'
      : `<div class="line">
          <img src="${PRODUCT.image}" alt="">
          <div>
            <h3>${PRODUCT.name}</h3>
            <div class="qty" role="group" aria-label="Quantité">
              <button data-line="-1" aria-label="Moins">−</button><span>${qtyInCart}</span><button data-line="1" aria-label="Plus">+</button>
            </div>
            <button class="line__remove" data-line="0">Retirer</button>
          </div>
          <div class="line__price">${eur(qtyInCart * PRODUCT.price)}<s>${eur(qtyInCart * PRODUCT.compareAt)}</s></div>
        </div>`;
  }
  $('#cartBody').addEventListener('click', (e) => {
    const b = e.target.closest('[data-line]');
    if (!b) return;
    const d = +b.dataset.line;
    qtyInCart = d === 0 ? 0 : Math.min(10, Math.max(0, qtyInCart + d));
    save(); render();
  });

  const openCart = () => { body.classList.add('cart-open'); $('#drawer').setAttribute('aria-hidden', false); };
  const closeCart = () => { body.classList.remove('cart-open'); $('#drawer').setAttribute('aria-hidden', true); };
  $('#cartOpen').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  $('#overlay').addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCart(); closeLightbox(); } });

  const toast = $('#toast');
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function add(n) {
    qtyInCart = Math.min(10, qtyInCart + n);
    save(); render();
    count.classList.remove('bump'); void count.offsetWidth; count.classList.add('bump');
    showToast('+ ' + n + ' liasse' + (n > 1 ? 's' : '') + ' dans le panier 💸');
    setTimeout(openCart, 350);
  }
  $('#addToCart').addEventListener('click', () => add(+qtyInput.value || 1));
  $('#stickyAdd').addEventListener('click', () => add(1));
  $('#checkout').addEventListener('click', () => showToast('Paiement Shopify branché à l\'intégration'));
  render();

  /* Barre d'achat mobile : visible quand le bouton principal sort de l'écran */
  const sticky = $('#stickyBuy');
  new IntersectionObserver(([e]) => {
    sticky.classList.toggle('is-visible', !e.isIntersecting && e.boundingClientRect.top < 0);
  }).observe($('#addToCart'));

  /* Galerie / lightbox */
  const lb = $('#lightbox');
  function closeLightbox() { lb.classList.remove('is-open'); }
  $$('.gallery__item').forEach((b) => b.addEventListener('click', () => {
    lb.querySelector('img').src = b.dataset.src;
    lb.querySelector('img').alt = b.querySelector('img').alt;
    lb.classList.add('is-open');
  }));
  lb.addEventListener('click', closeLightbox);

  /* Apparitions au scroll */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el); });
})();
