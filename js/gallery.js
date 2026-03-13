/* ============================================
   GALLERY - Carrossel de Fotos Touch-Friendly
   ============================================ */

class Gallery {
    constructor(container, track, dotsContainer, prevBtn, nextBtn) {
        this.container = container;
        this.track = track;
        this.dotsContainer = dotsContainer;
        this.prevBtn = prevBtn;
        this.nextBtn = nextBtn;
        this.currentIndex = 0;
        this.cards = [];
        this.isDragging = false;
        this.startX = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.animationID = null;

        this.init();
    }

    init() {
        this.loadPhotos();
        this.setupEvents();
    }

    loadPhotos() {
        // Configuração das fotos - legendas editáveis
        const photos = [
            { src: 'fotos/foto1.jpg', caption: 'Nosso começo 💕' },
            { src: 'fotos/foto2.jpg', caption: 'Momentos especiais ✨' },
            { src: 'fotos/foto3.jpg', caption: 'Aventuras juntos 🌎' },
            { src: 'fotos/foto4.jpg', caption: 'Risadas e amor 😄' },
            { src: 'fotos/foto5.jpg', caption: 'Sempre juntos 💑' },
            { src: 'fotos/foto6.jpg', caption: 'Meu amor 💕' },
            { src: 'fotos/foto7.jpg', caption: 'Nós dois 🥰' },
            { src: 'fotos/foto8.jpg', caption: 'Para sempre ♾️' },
            { src: 'fotos/foto9.jpg', caption: 'Te amo 💕' },
        ];

        this.track.innerHTML = '';
        // Add padding for centering first/last card
        const paddingStart = document.createElement('div');
        paddingStart.style.flex = '0 0 calc(50vw - 140px)';
        this.track.appendChild(paddingStart);

        photos.forEach((photo, index) => {
            const card = document.createElement('div');
            card.classList.add('gallery-card');
            card.dataset.index = index;

            const img = document.createElement('img');
            img.src = photo.src;
            img.alt = photo.caption;
            img.loading = 'lazy';
            // Placeholder gradient while loading
            img.style.background = 'linear-gradient(135deg, #2d1b69, #e8a87c)';
            img.onerror = function() {
                // If photo doesn't exist, show a beautiful placeholder
                this.style.display = 'none';
                card.style.background = `linear-gradient(135deg, 
                    hsl(${index * 36}, 40%, 25%), 
                    hsl(${index * 36 + 30}, 50%, 35%))`;
                const placeholderText = document.createElement('div');
                placeholderText.style.cssText = `
                    position: absolute; top: 50%; left: 50%; 
                    transform: translate(-50%, -50%);
                    font-size: 48px; opacity: 0.5;
                `;
                placeholderText.textContent = '📷';
                card.appendChild(placeholderText);
            };

            const overlay = document.createElement('div');
            overlay.classList.add('gallery-card-overlay');

            const caption = document.createElement('p');
            caption.classList.add('gallery-card-caption');
            caption.textContent = photo.caption;

            overlay.appendChild(caption);
            card.appendChild(img);
            card.appendChild(overlay);
            this.track.appendChild(card);
        });

        const paddingEnd = document.createElement('div');
        paddingEnd.style.flex = '0 0 calc(50vw - 140px)';
        this.track.appendChild(paddingEnd);

        this.cards = this.track.querySelectorAll('.gallery-card');
        this.createDots();
        this.updateActiveCard();
    }

    createDots() {
        this.dotsContainer.innerHTML = '';
        this.cards.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('gallery-dot');
            dot.setAttribute('aria-label', `Foto ${index + 1}`);
            dot.addEventListener('click', () => this.goTo(index));
            this.dotsContainer.appendChild(dot);
        });
    }

    setupEvents() {
        // Touch events
        this.track.addEventListener('touchstart', (e) => this.touchStart(e), { passive: true });
        this.track.addEventListener('touchmove', (e) => this.touchMove(e), { passive: false });
        this.track.addEventListener('touchend', () => this.touchEnd());

        // Mouse events
        this.track.addEventListener('mousedown', (e) => this.touchStart(e));
        this.track.addEventListener('mousemove', (e) => this.touchMove(e));
        this.track.addEventListener('mouseup', () => this.touchEnd());
        this.track.addEventListener('mouseleave', () => {
            if (this.isDragging) this.touchEnd();
        });

        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());

        // Auto-advance timer
        this.startAutoAdvance();
    }

    getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    touchStart(e) {
        this.isDragging = true;
        this.startX = this.getPositionX(e);
        this.stopAutoAdvance();
        cancelAnimationFrame(this.animationID);
    }

    touchMove(e) {
        if (!this.isDragging) return;
        const currentX = this.getPositionX(e);
        const diff = currentX - this.startX;

        if (Math.abs(diff) > 10) {
            e.preventDefault();
        }

        this.currentTranslate = this.prevTranslate + diff;
        this.setTrackPosition();
    }

    touchEnd() {
        this.isDragging = false;
        const movedBy = this.currentTranslate - this.prevTranslate;

        if (Math.abs(movedBy) > 60) {
            if (movedBy < 0) {
                this.next();
            } else {
                this.prev();
            }
        } else {
            this.goTo(this.currentIndex);
        }

        this.startAutoAdvance();
    }

    setTrackPosition() {
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
        this.track.style.transition = 'none';
    }

    getCardOffset(index) {
        if (!this.cards[index]) return 0;
        const card = this.cards[index];
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const containerCenter = this.container.offsetWidth / 2;
        return -(cardCenter - containerCenter);
    }

    goTo(index) {
        this.currentIndex = Math.max(0, Math.min(index, this.cards.length - 1));
        this.currentTranslate = this.getCardOffset(this.currentIndex);
        this.prevTranslate = this.currentTranslate;
        this.track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
        this.updateActiveCard();
    }

    next() {
        if (this.currentIndex < this.cards.length - 1) {
            this.goTo(this.currentIndex + 1);
        } else {
            this.goTo(0); // Loop
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.goTo(this.currentIndex - 1);
        } else {
            this.goTo(this.cards.length - 1); // Loop
        }
    }

    updateActiveCard() {
        this.cards.forEach((card, i) => {
            card.classList.toggle('active', i === this.currentIndex);
        });

        const dots = this.dotsContainer.querySelectorAll('.gallery-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }

    startAutoAdvance() {
        this.stopAutoAdvance();
        this.autoTimer = setInterval(() => this.next(), 4000);
    }

    stopAutoAdvance() {
        if (this.autoTimer) {
            clearInterval(this.autoTimer);
            this.autoTimer = null;
        }
    }
}

window.Gallery = Gallery;
