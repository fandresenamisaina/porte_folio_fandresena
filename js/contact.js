(function () {
    'use strict';

    var form = document.getElementById('contactForm');
    if (!form) return;

    var status = document.getElementById('formStatus');
    var btn = form.querySelector('button[type=submit]');
    var MAIL = 'fandresenamisaina@gmail.com';

    // EmailJS : colle ici tes 3 identifiants (voir l'étape 1)
    var EMAILJS = { publicKey: '', serviceId: '', templateId: '' };

    function say(msg, ok) {
        status.textContent = msg;
        status.className = 'form-status ' + (ok ? 'ok' : 'err');
    }

    // Enregistre le message chez Netlify (onglet Forms)
    function sendNetlify() {
        return fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(new FormData(form)).toString()
        }).then(function (r) { if (!r.ok) throw new Error('netlify'); });
    }

    // Envoie le message dans ton Gmail + l'accusé de réception au visiteur
    function sendEmailJS() {
        if (!EMAILJS.publicKey || !EMAILJS.serviceId || !EMAILJS.templateId) {
            return Promise.reject(new Error('emailjs non configuré'));
        }
        var d = new FormData(form);
        return fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: EMAILJS.serviceId,
                template_id: EMAILJS.templateId,
                user_id: EMAILJS.publicKey,
                template_params: {
                    nom: d.get('nom'),
                    email: d.get('email'),
                    objet: d.get('objet'),
                    message: d.get('message')
                }
            })
        }).then(function (r) { if (!r.ok) throw new Error('emailjs'); });
    }

    // Plan B : ouvre la messagerie avec le message déjà rempli
    function viaMail() {
        var d = new FormData(form);
        var body = 'Nom : ' + d.get('nom') + '\nEmail : ' + d.get('email') + '\n\n' + d.get('message');
        window.location.href = 'mailto:' + MAIL +
            '?subject=' + encodeURIComponent('[Portfolio] ' + d.get('objet')) +
            '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Champ piège : si un robot l'a rempli, on ne fait rien
        var trap = form.querySelector('[name=bot-field]');
        if (trap && trap.value) return;

        btn.disabled = true;
        say('Envoi en cours…', true);

        Promise.allSettled([sendNetlify(), sendEmailJS()]).then(function (res) {
            var netlifyOk = res[0].status === 'fulfilled';
            var mailOk = res[1].status === 'fulfilled';

            if (mailOk) {
                say('Merci ! Votre message a bien été envoyé. Un accusé de réception vient de vous être envoyé par email (pensez à vérifier vos spams).', true);
                form.reset();
            } else if (netlifyOk) {
                say('Merci ! Votre message a bien été envoyé.', true);
                form.reset();
            } else {
                say("L'envoi automatique est impossible. J'ouvre votre messagerie avec le message prêt à partir.", false);
                setTimeout(viaMail, 1200);
            }
            btn.disabled = false;
        });
    });
})();