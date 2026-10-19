(function () {
    'use strict';
    var root = document.documentElement;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var saved = null;
    try { saved = localStorage.getItem('fx'); } catch (e) { }
    var on = saved ? saved === 'on' : !reduce;

    function apply() {
        root.classList.toggle('fx-on', on);
        root.classList.toggle('fx-off', !on);
    }
    apply();

    // 1. Pluie de code (légère, en pause quand l'onglet est caché ou les FX coupés)
    var cv = document.createElement('canvas');
    cv.id = 'matrix';
    cv.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(cv, document.body.firstChild);
    var ctx = cv.getContext('2d');
    var SIZE = 16, drops = [], timer = null;
    var CHARS = '01{}[]<>/;$#ABCDEF';

    function resize() {
        cv.width = window.innerWidth;
        cv.height = window.innerHeight;
        drops = [];
        for (var i = 0; i < Math.ceil(cv.width / SIZE); i++) {
            drops.push(Math.floor(Math.random() * cv.height / SIZE));
        }
    }
    function draw() {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,.12)';
        ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#4FD8A0';
        ctx.font = SIZE + 'px "JetBrains Mono", monospace';
        for (var i = 0; i < drops.length; i++) {
            var ch = CHARS.charAt(Math.floor(Math.random() * CHARS.length));
            ctx.fillText(ch, i * SIZE, drops[i] * SIZE);
            if (drops[i] * SIZE > cv.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    function matrix() {
        var run = on && !document.hidden;
        if (run && !timer) timer = setInterval(draw, 60);
        if (!run && timer) { clearInterval(timer); timer = null; }
    }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', matrix);

    // 2. Glitch périodique sur le mot en vert du titre
    var em = document.querySelector('.hero h1 em');
    if (em) {
        em.classList.add('glitch');
        em.setAttribute('data-text', em.textContent);
        setInterval(function () {
            if (!on) return;
            em.classList.add('go');
            setTimeout(function () { em.classList.remove('go'); }, 450);
        }, 4500);
    }

    // 3. Halo qui suit la souris (ou le doigt) sur les cartes
    document.querySelectorAll('.card').forEach(function (c) {
        c.classList.add('tilt');
        function move(x, y) {
            var r = c.getBoundingClientRect();
            c.style.setProperty('--mx', (x - r.left) + 'px');
            c.style.setProperty('--my', (y - r.top) + 'px');
        }
        c.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); });
        c.addEventListener('touchstart', function (e) {
            c.classList.add('touch-on');
            move(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        c.addEventListener('touchmove', function (e) {
            move(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        c.addEventListener('touchend', function () { c.classList.remove('touch-on'); });
    });

    // 4. Bouton FX (activer / couper les animations)
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fx-toggle';
    function label() {
        btn.textContent = 'FX : ' + (on ? 'on' : 'off');
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.setAttribute('aria-label', on ? 'Couper les animations' : 'Activer les animations');
    }
    btn.addEventListener('click', function () {
        on = !on;
        try { localStorage.setItem('fx', on ? 'on' : 'off'); } catch (e) { }
        apply(); label(); matrix();
    });
    label();
    document.body.appendChild(btn);
    matrix();

    // 5. Code Konami : ↑ ↑ ↓ ↓ ← → ← → B A
    var SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var pos = 0;
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var o = document.getElementById('granted');
            if (o) o.remove();
            return;
        }
        var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        pos = (k === SEQ[pos]) ? pos + 1 : (k === SEQ[0] ? 1 : 0);
        if (pos === SEQ.length) {
            pos = 0;
            if (document.getElementById('granted')) return;
            var d = document.createElement('div');
            d.id = 'granted';
            d.setAttribute('role', 'dialog');
            d.innerHTML = '<div>&gt; ACCESS GRANTED<br><small>Bien joué, hacker. Échap pour fermer.</small></div>';
            d.addEventListener('click', function () { d.remove(); });
            document.body.appendChild(d);
        }
    });
})();