(function () {
    'use strict';
    var root = document.documentElement;
    var GREEN = '#3ddc97';
    var GLYPHS = '01<>/{}$#%&*ABCDEF'.split('');

    // Etat : désactivé par défaut si l'utilisateur préfère moins de mouvement
    var on = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
        var saved = localStorage.getItem('fx');
        if (saved) on = saved === 'on';
    } catch (e) {}
    root.classList.toggle('fx-off', !on);

    // 1. Pluie de code (Matrix), légère et en pause quand l'onglet est caché
    var cv = document.createElement('canvas');
    cv.id = 'matrix';
    cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv);
    var cx = cv.getContext('2d'), fs = 16, drops = [];
    function size() {
        cv.width = innerWidth;
        cv.height = innerHeight;
        drops = [];
        for (var i = 0; i < Math.ceil(cv.width / fs); i++) drops.push(Math.random() * -40);
    }
    size();
    addEventListener('resize', size);
    setInterval(function () {
        if (!on || document.hidden) return;
        cx.fillStyle = 'rgba(22,29,39,.14)';
        cx.fillRect(0, 0, cv.width, cv.height);
        cx.fillStyle = GREEN;
        cx.font = fs + 'px "JetBrains Mono", monospace';
        for (var i = 0; i < drops.length; i++) {
            cx.fillText(GLYPHS[Math.random() * GLYPHS.length | 0], i * fs, drops[i] * fs);
            if (drops[i] * fs > cv.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }, 55);

    // 2. Terminal du hero : les commandes se tapent toutes seules
    var term = document.querySelector('.term');
    if (term && on) {
        var jobs = [];
        [].slice.call(term.children, 1).forEach(function (line) {
            var w = document.createTreeWalker(line, NodeFilter.SHOW_TEXT), n;
            while ((n = w.nextNode())) if (n.nodeValue.trim()) jobs.push({ n: n, t: n.nodeValue });
        });
        jobs.forEach(function (j) { j.n.nodeValue = ''; });
        var ji = 0, ci = 0, cur = null;
        (function step() {
            if (ji >= jobs.length) { if (cur) cur.classList.remove('typing'); return; }
            var j = jobs[ji], line = j.n.parentNode.closest('.term > div');
            if (line !== cur) { if (cur) cur.classList.remove('typing'); cur = line; cur.classList.add('typing'); }
            j.n.nodeValue = j.t.slice(0, ++ci);
            var out = /out|warn/.test(j.n.parentNode.className);
            if (ci >= j.t.length) { ji++; ci = 0; setTimeout(step, out ? 180 : 320); }
            else setTimeout(step, out ? 10 : 45);
        })();
    }

    // 3. Glitch périodique sur le mot en vert du titre
    var em = document.querySelector('.hero h1 em');
    if (em) {
        em.classList.add('glitch');
        em.setAttribute('data-text', em.textContent);
        setInterval(function () {
            if (!on) return;
            em.classList.add('go');
            setTimeout(function () { em.classList.remove('go'); }, 450);
        }, 3800);
    }

    // 4. Titres de section : effet de "déchiffrement" à l'apparition
    function scramble(el) {
        var t = el.getAttribute('data-t') || el.textContent, f = 0, N = 24;
        el.setAttribute('data-t', t);
        el.setAttribute('aria-label', t);
        var id = setInterval(function () {
            var k = Math.floor(t.length * f / N);
            el.textContent = t.slice(0, k) + t.slice(k).replace(/\S/g, function () {
                return GLYPHS[Math.random() * GLYPHS.length | 0];
            });
            if (++f > N) { clearInterval(id); el.textContent = t; }
        }, 30);
    }
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
            es.forEach(function (e) {
                if (e.isIntersecting) { io.unobserve(e.target); if (on) scramble(e.target); }
            });
        }, { threshold: 0.6 });
        document.querySelectorAll('section h2').forEach(function (h) { io.observe(h); });
    }

    // 5. Cartes : inclinaison 3D et halo qui suit la souris
    if (matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.card').forEach(function (c) {
            c.classList.add('tilt');
            c.addEventListener('mousemove', function (e) {
                if (!on) return;
                var r = c.getBoundingClientRect(),
                    x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
                c.style.transition = 'transform .08s';
                c.style.transform = 'perspective(700px) rotateX(' + ((.5 - y) * 8) + 'deg) rotateY(' + ((x - .5) * 8) + 'deg)';
                c.style.setProperty('--mx', x * 100 + '%');
                c.style.setProperty('--my', y * 100 + '%');
            });
            c.addEventListener('mouseleave', function () {
                c.style.transition = 'transform .4s';
                c.style.transform = '';
            });
        });
    }

    // 6. Bouton FX : activer / couper les animations
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fx-toggle';
    function label() {
        btn.textContent = 'FX ' + (on ? 'ON' : 'OFF');
        btn.setAttribute('aria-pressed', on);
        btn.setAttribute('aria-label', on ? 'Désactiver les animations' : 'Activer les animations');
    }
    label();
    btn.addEventListener('click', function () {
        on = !on;
        root.classList.toggle('fx-off', !on);
        if (!on) cx.clearRect(0, 0, cv.width, cv.height);
        try { localStorage.setItem('fx', on ? 'on' : 'off'); } catch (e) {}
        label();
    });
    document.body.appendChild(btn);

    // 7. Code Konami (↑↑↓↓←→←→ B A) : message "ACCESS GRANTED"
    var seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], pos = 0;
    addEventListener('keydown', function (e) {
        if (e.keyCode === 27) { var o = document.getElementById('granted'); if (o) o.remove(); }
        pos = e.keyCode === seq[pos] ? pos + 1 : (e.keyCode === seq[0] ? 1 : 0);
        if (pos < seq.length) return;
        pos = 0;
        if (document.getElementById('granted')) return;
        var d = document.createElement('div');
        d.id = 'granted';
        d.setAttribute('role', 'status');
        d.innerHTML = '<div>&gt; ACCESS GRANTED<br><small>Bien joué, hacker. Échap pour fermer.</small></div>';
        d.addEventListener('click', function () { d.remove(); });
        document.body.appendChild(d);
        setTimeout(function () { d.remove(); }, 4000);
    });
})();