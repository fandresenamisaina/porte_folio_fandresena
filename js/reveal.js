(function () {
    'use strict';

    // Pas d'animation si le visiteur demande moins de mouvement : tout reste visible
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var root = document.documentElement;

    // Sélecteur -> type d'animation (le premier qui correspond gagne)
    var MAP = [
        ['.hero .portrait-wrap', 'slide'],
        ['.hero .kick', 'left'],
        ['.hero h1', 'blur'],
        ['.hero .btns .btn', 'pop'],
        ['.term', 'right'],
        ['.status', 'up'],
        ['.stat', 'up'],
        ['.eyebrow', 'left'],
        ['section h2', 'blur'],
        ['.group-title', 'left'],
        ['.about-l p', 'up'],
        ['.stage-box', 'up'],
        ['.contact-l > p', 'up'],
        ['.contact-r', 'up'],
        ['.legend', 'up'],
        ['.card', 'flip'],
        ['.give', 'up'],
        ['.step', 'up'],
        ['.contact .row', 'up']
    ];

    // Groupes : le décalage progressif se fait au sein d'un même conteneur
    var GROUPS = '.row2, .btns, .grid, .stats-in, .about-r, .path-l, .path-r, .stage-r, .rows, .proj-group';

    // Texte d'accroche : apparition mot par mot, sans perdre le texte en gras
    var lead = document.querySelector('.hero-lead');
    var wordCount = 0;
    if (lead) {
        var walker = document.createTreeWalker(lead, NodeFilter.SHOW_TEXT);
        var nodes = [], n;
        while ((n = walker.nextNode())) nodes.push(n);
        nodes.forEach(function (node) {
            var parts = node.nodeValue.split(/(\s+)/);
            var frag = document.createDocumentFragment();
            parts.forEach(function (p) {
                if (!p) return;
                if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
                var s = document.createElement('span');
                s.className = 'w';
                s.style.setProperty('--i', wordCount++);
                s.textContent = p;
                frag.appendChild(s);
            });
            node.parentNode.replaceChild(frag, node);
        });
        lead.setAttribute('data-fx', 'words');
    }

    var counters = new Map(), items = [];
    MAP.forEach(function (m) {
        document.querySelectorAll(m[0]).forEach(function (el) {
            if (el.hasAttribute('data-fx')) return;
            var g = el.closest(GROUPS) || el.parentNode;
            var k = counters.get(g) || 0;
            counters.set(g, k + 1);
            el.setAttribute('data-fx', m[1]);
            el.style.setProperty('--d', Math.min(k, 6) * 0.09 + 's');
            items.push(el);
        });
    });
    if (lead) items.push(lead);

    function show(el) {
        el.classList.add('fx-show');
        if (el === lead) return;
        // Après l'animation, on rend la main au CSS normal (survols, etc.)
        var d = parseFloat(el.style.getPropertyValue('--d')) || 0;
        setTimeout(function () {
            el.removeAttribute('data-fx');
            el.classList.remove('fx-show');
            el.style.removeProperty('--d');
        }, 900 + d * 1000);
    }

    if (!('IntersectionObserver' in window)) {
        items.forEach(function (el) { el.classList.add('fx-show'); });
        return;
    }

    // On active le masquage seulement quand tout est prêt
    root.classList.add('js-reveal');

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { io.unobserve(e.target); show(e.target); }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
})();