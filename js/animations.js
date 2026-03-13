/* ============================================
   ANIMATIONS - Partículas, Confetes, Parallax
   ============================================ */

// ---- Particle System (Intro Section) ----
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.running = false;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 2.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.5 + 0.1,
            hue: Math.random() > 0.5 ? 25 : 280, // rose or purple
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.005
        };
    }

    init(count = 60) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    start() {
        this.running = true;
        this.animate();
    }

    stop() {
        this.running = false;
    }

    animate() {
        if (!this.running) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += p.pulseSpeed;
            const dynamicOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

            // Wrap around
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw glow
            this.ctx.beginPath();
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
            gradient.addColorStop(0, `hsla(${p.hue}, 60%, 70%, ${dynamicOpacity})`);
            gradient.addColorStop(1, `hsla(${p.hue}, 60%, 70%, 0)`);
            this.ctx.fillStyle = gradient;
            this.ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw core
            this.ctx.beginPath();
            this.ctx.fillStyle = `hsla(${p.hue}, 70%, 80%, ${dynamicOpacity * 1.5})`;
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Connect nearby particles with lines
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const lineOpacity = (1 - dist / 120) * 0.08;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(232, 168, 124, ${lineOpacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}


// ---- Confetti System (Birthday Section) ----
class ConfettiSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.confetti = [];
        this.running = false;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.canvas.parentElement?.clientWidth || window.innerWidth;
        this.canvas.height = this.canvas.parentElement?.clientHeight || window.innerHeight;
    }

    createConfetti() {
        const colors = [
            '#e8a87c', '#ffd700', '#d4a574', '#f0c4a8',
            '#ff69b4', '#ff1493', '#4a2d8a', '#2d1b69',
            '#ffffff', '#e6c547'
        ];
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * -this.canvas.height,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 1.5,
            speedX: (Math.random() - 0.5) * 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 8,
            opacity: Math.random() * 0.5 + 0.5,
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.1 + 0.02
        };
    }

    burst(count = 120) {
        for (let i = 0; i < count; i++) {
            this.confetti.push(this.createConfetti());
        }
        if (!this.running) {
            this.running = true;
            this.animate();
        }
    }

    animate() {
        if (!this.running) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.confetti = this.confetti.filter(c => c.y < this.canvas.height + 20);

        if (this.confetti.length === 0) {
            this.running = false;
            return;
        }

        this.confetti.forEach(c => {
            c.y += c.speedY;
            c.wobble += c.wobbleSpeed;
            c.x += c.speedX + Math.sin(c.wobble) * 0.5;
            c.rotation += c.rotationSpeed;
            c.speedY += 0.02; // gravity

            this.ctx.save();
            this.ctx.translate(c.x, c.y);
            this.ctx.rotate((c.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = c.opacity;
            this.ctx.fillStyle = c.color;

            if (c.shape === 'rect') {
                this.ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        });

        requestAnimationFrame(() => this.animate());
    }
}


// ---- Floating Particles for Start Screen ----
function createStartParticles(container) {
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.classList.add('floating-particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        particle.style.animationDelay = (Math.random() * 5) + 's';
        particle.style.width = (Math.random() * 4 + 2) + 'px';
        particle.style.height = particle.style.width;

        const hue = Math.random() > 0.5 ? 25 : 280;
        particle.style.background = `hsla(${hue}, 60%, 70%, 0.6)`;
        particle.style.boxShadow = `0 0 ${Math.random() * 8 + 4}px hsla(${hue}, 60%, 70%, 0.3)`;

        container.appendChild(particle);
    }
}


// ---- Scroll Animation Observer ----
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    return observer;
}


// Export for use in app.js
window.ParticleSystem = ParticleSystem;
window.ConfettiSystem = ConfettiSystem;
window.createStartParticles = createStartParticles;
window.initScrollAnimations = initScrollAnimations;
