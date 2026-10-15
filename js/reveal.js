(function () {
    'use strict';

    // Le script d'origine a ajouté la classe .reveal : on reprend la main
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.remove('reveal'); });

    // Sélecteur -> type d'animation
    var MAP = [
        ['.hero .photo', 'zoom'],
        ['.hero .kicker', 'left'],
        ['.hero h1', 'blur'],
        ['.hero .btns .btn', 'pop'],
        ['.term', 'right'],
        ['section .tag', 'left'],
        ['section h2', 'blur'],
        ['h3.sub', 'left'],
        ['.about p', 'up'],
        ['.pills .badge', 'pop'],
        ['.card', 'flip'],
        ['.note', 'up'],
        ['.tl', 'left'],
        ['.step', 'up'],
        ['.contact p', 'up'],
        ['.links .btn', 'pop']
    ];

    // Titre d'accroche : apparition mot par mot
    var lead = document.querySelector('.hero-lead');
    if (lead) {
        var words = lead.textContent.trim().split(/\s+/);
        lead.textContent = '';
        words.forEach(function (w, i) {
            var s = document.createElement('span');
            s.className = 'w';
            s.style.setProperty('--i', i);
            s.textContent = w;
            lead.appendChild(s);
            if (i < words.length - 1) lead.appendChild(document.createTextNode(' '));
        });
        lead.setAttribute('data-fx', 'words');
    }

    // Décalage progressif entre éléments d'un même groupe (ligne de cartes, badges...)
    var groups = new Map(), items = [];
    MAP.forEach(function (m) {
        document.querySelectorAll(m[0]).forEach(function (el) {
            if (el.hasAttribute('data-fx')) return;
            var g = el.closest('.row, .pills, .btns, .links') || el.parentNode;
            var n = groups.get(g) || 0;
            groups.set(g, n + 1);
            el.setAttribute('data-fx', m[1]);
            el.style.setProperty('--d', Math.min(n, 6) * 0.1 + 's');
            items.push(el);
        });
    });
    if (lead) items.push(lead);

    function show(el) {
        el.classList.add('fx-show');
        // Une fois l'animation finie, on rend la main au CSS normal (survols, etc.)
        setTimeout(function () {
            el.removeAttribute('data-fx');
            el.classList.remove('fx-show');
            el.style.removeProperty('--d');
        }, 3000);
    }

    if (!('IntersectionObserver' in window)) { items.forEach(show); return; }
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { io.unobserve(e.target); show(e.target); }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
})();