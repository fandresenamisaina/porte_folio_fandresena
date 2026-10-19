(function () {
    'use strict';
    var root = document.documentElement;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Menu mobile ----------
    var burger = document.getElementById('burger');
    var menu = document.getElementById('menu');
    function setMenu(open) {
        menu.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    }
    burger.addEventListener('click', function () {
        setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); }
    });
    var links = [].slice.call(menu.querySelectorAll('.nav-link'));
    links.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

    // ---------- Section active dans le menu ----------
    if ('IntersectionObserver' in window) {
        var map = {};
        links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
        function clearActive() {
            links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        }
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                clearActive();
                var a = map[e.target.id];
                if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'location'); }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        ['top'].concat(Object.keys(map)).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) spy.observe(el);
        });
    }

    // ---------- Thème clair / sombre ----------
    var themeBtn = document.getElementById('themeBtn');
    var themeLbl = document.getElementById('themeLbl');
    var meta = document.querySelector('meta[name="theme-color"]');
    function paintTheme() {
        var light = root.getAttribute('data-theme') === 'light';
        themeLbl.textContent = light ? 'Thème sombre' : 'Thème clair';
        themeBtn.setAttribute('aria-label', light ? 'Passer au thème sombre' : 'Passer au thème clair');
        themeBtn.setAttribute('title', light ? 'Thème sombre' : 'Thème clair');
        if (meta) meta.setAttribute('content', light ? '#F6F8FA' : '#0E141B');
    }
    themeBtn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) { }
        paintTheme();
    });
    paintTheme();

    // ---------- Filtre des projets (sans JavaScript, tout reste visible) ----------
    var tabs = document.getElementById('tabs');
    if (tabs) {
        tabs.hidden = false;
        var groups = [].slice.call(document.querySelectorAll('.proj-group'));
        var btns = [].slice.call(tabs.querySelectorAll('.tab'));
        btns.forEach(function (b) {
            b.addEventListener('click', function () {
                var f = b.getAttribute('data-filter');
                btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
                groups.forEach(function (g) { g.hidden = f !== 'all' && g.getAttribute('data-group') !== f; });
            });
        });
    }

    // ---------- Copier l'email ----------
    var copyBtn = document.getElementById('copyBtn');
    var copyLbl = document.getElementById('copyLbl');
    var copyTimer;
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            var mail = 'fandresenamisaina@gmail.com';
            function done() {
                copyLbl.textContent = 'Copié ✓';
                clearTimeout(copyTimer);
                copyTimer = setTimeout(function () { copyLbl.textContent = 'Copier'; }, 2000);
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(mail).then(done, function () { });
            }
        });
    }

    // ---------- Terminal : les commandes se tapent toutes seules ----------
    var term = document.getElementById('term');
    if (term && !reduce) {
        var jobs = [];
        [].slice.call(term.children).forEach(function (line) {
            var w = document.createTreeWalker(line, NodeFilter.SHOW_TEXT), n;
            while ((n = w.nextNode())) if (n.nodeValue.trim()) jobs.push({ n: n, t: n.nodeValue, out: line.classList.contains('out') });
        });
        jobs.forEach(function (j) { j.n.nodeValue = ''; });
        var ji = 0, ci = 0;
        (function step() {
            if (ji >= jobs.length) return;
            var j = jobs[ji];
            j.n.nodeValue = j.t.slice(0, ++ci);
            if (ci >= j.t.length) { ji++; ci = 0; setTimeout(step, j.out ? 160 : 300); }
            else setTimeout(step, j.out ? 8 : 40);
        })();
    }
})();