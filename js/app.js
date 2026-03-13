/* ============================================
   APP - Lógica Principal
   ============================================ */

(function() {
    'use strict';

    // ---- Configuration ----
    const CONFIG = {
        // Mensagem da carta - ERIC: edite aqui a mensagem para a Kéren!
        letterMessage: `Minha Kéren,

Hoje é o seu dia, e eu não poderia deixar de te dizer o quanto você é especial.

Você é a mulher mais forte, mais linda e mais incrível que eu conheço. Cada dia ao seu lado é um presente que eu agradeço.

Você ilumina minha vida como ninguém. Seu sorriso é o meu amanhecer, e seu abraço é o meu lugar seguro.

Obrigado por ser quem você é. Por me fazer querer ser uma pessoa melhor a cada dia.

Que esse novo ano te traga tudo que você merece — e você merece o mundo inteiro! 🌍

Feliz aniversário, meu amor! 🎂💕`,

        typewriterSpeed: 35, // ms por caractere
        loaderDuration: 2500, // ms do loading
    };


    // ---- DOM Elements ----
    const elements = {
        loader: document.getElementById('loader'),
        startScreen: document.getElementById('start-screen'),
        startParticles: document.getElementById('start-particles'),
        btnStart: document.getElementById('btn-start'),
        app: document.getElementById('app'),
        particlesCanvas: document.getElementById('particles-canvas'),
        galleryContainer: document.getElementById('gallery-container'),
        galleryTrack: document.getElementById('gallery-track'),
        galleryDots: document.getElementById('gallery-dots'),
        galleryPrev: document.getElementById('gallery-prev'),
        galleryNext: document.getElementById('gallery-next'),
        letterEnvelope: document.getElementById('letter-envelope'),
        letterPaper: document.getElementById('letter-paper'),
        letterBody: document.getElementById('letter-body'),
        letterSignature: document.getElementById('letter-signature'),
        confettiCanvas: document.getElementById('confetti-canvas'),
        musicVisualizer: document.getElementById('music-visualizer'),
    };


    // ---- Systems ----
    let particleSystem = null;
    let confettiSystem = null;
    let gallery = null;
    let scrollObserver = null;
    let typewriterStarted = false;
    let confettiTriggered = false;


    // ---- Loading Flow ----
    function startLoading() {
        setTimeout(() => {
            elements.loader.classList.add('fade-out');
            setTimeout(() => {
                elements.loader.classList.add('hidden');
                showStartScreen();
            }, 800);
        }, CONFIG.loaderDuration);
    }


    // ---- Start Screen ----
    function showStartScreen() {
        elements.startScreen.classList.remove('hidden');
        createStartParticles(elements.startParticles);
    }

    function handleStart() {
        elements.startScreen.classList.add('fade-out');
        setTimeout(() => {
            elements.startScreen.classList.add('hidden');
            showApp();
        }, 1200);
    }


    // ---- Main App ----
    function showApp() {
        elements.app.classList.remove('hidden');

        // Init particle system
        particleSystem = new ParticleSystem(elements.particlesCanvas);
        particleSystem.init(50);
        particleSystem.start();

        // Init gallery
        gallery = new Gallery(
            elements.galleryContainer,
            elements.galleryTrack,
            elements.galleryDots,
            elements.galleryPrev,
            elements.galleryNext
        );
        // Initial position after DOM is ready
        requestAnimationFrame(() => gallery.goTo(0));

        // Init confetti (ready but not triggered)
        confettiSystem = new ConfettiSystem(elements.confettiCanvas);

        // Init scroll animations
        scrollObserver = initScrollAnimations();

        // Setup section observers
        setupSectionObservers();

        // Smooth entrance
        elements.app.style.opacity = '0';
        elements.app.style.transition = 'opacity 1s ease';
        requestAnimationFrame(() => {
            elements.app.style.opacity = '1';
        });
    }


    // ---- Section Observers ----
    function setupSectionObservers() {
        const letterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !typewriterStarted) {
                    // Don't auto-start typewriter, wait for envelope click
                }
            });
        }, { threshold: 0.3 });

        const birthdayObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !confettiTriggered) {
                    confettiTriggered = true;
                    confettiSystem.resize();
                    setTimeout(() => confettiSystem.burst(150), 500);
                    // Second wave
                    setTimeout(() => confettiSystem.burst(80), 2000);
                    // Third wave
                    setTimeout(() => confettiSystem.burst(50), 4000);
                }
            });
        }, { threshold: 0.4 });

        const letterSection = document.getElementById('letter');
        const birthdaySection = document.getElementById('birthday');

        if (letterSection) letterObserver.observe(letterSection);
        if (birthdaySection) birthdayObserver.observe(birthdaySection);
    }


    // ---- Letter / Envelope ----
    function handleEnvelopeClick() {
        elements.letterEnvelope.classList.add('hidden');
        elements.letterPaper.classList.remove('hidden');

        if (!typewriterStarted) {
            typewriterStarted = true;
            typewriterEffect(CONFIG.letterMessage, elements.letterBody, CONFIG.typewriterSpeed, () => {
                // Show signature after typing is done
                elements.letterSignature.classList.remove('hidden');
            });
        }
    }


    // ---- Typewriter Effect ----
    function typewriterEffect(text, element, speed, callback) {
        element.innerHTML = '';
        const cursor = document.createElement('span');
        cursor.classList.add('typewriter-cursor');

        let i = 0;
        element.appendChild(cursor);

        function type() {
            if (i < text.length) {
                const char = text.charAt(i);
                if (char === '\n') {
                    element.insertBefore(document.createElement('br'), cursor);
                } else {
                    const textNode = document.createTextNode(char);
                    element.insertBefore(textNode, cursor);
                }
                i++;

                // Variable speed for natural feel
                let nextSpeed = speed;
                if (char === '.' || char === '!' || char === '?') {
                    nextSpeed = speed * 8;
                } else if (char === ',') {
                    nextSpeed = speed * 4;
                } else if (char === '\n') {
                    nextSpeed = speed * 6;
                }

                setTimeout(type, nextSpeed);
            } else {
                // Remove cursor after a delay
                setTimeout(() => {
                    cursor.remove();
                    if (callback) callback();
                }, 1500);
            }
        }

        type();
    }


    // ---- Event Listeners ----
    elements.btnStart.addEventListener('click', handleStart);
    elements.letterEnvelope.addEventListener('click', handleEnvelopeClick);


    // ---- Init ----
    startLoading();

})();
