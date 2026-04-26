// /c:/Users/User/Documents/vscode programs/kyan-program/HTML, CSS, JAVASCRIPT/script.js
// Interactive UI behaviors (vanilla JS). Safe no-deps, guards for missing elements.

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        initMenuToggle();
        initSmoothScroll();
        initAccordion();
        initModal();
        initCarousel();
        initFormValidation();
        initThemeToggle();
        initBackToTop();
    });

    // Mobile menu toggle: #menu-btn toggles #nav
    function initMenuToggle() {
        const btn = document.getElementById('menu-btn');
        const nav = document.getElementById('nav');
        if (!btn || !nav) return;
        btn.addEventListener('click', () => {
            const open = nav.classList.toggle('open');
            btn.setAttribute('aria-expanded', String(open));
        });
    }

    // Smooth scrolling for internal links
    function initSmoothScroll() {
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a[href^="#"]');
            if (!a) return;
            const href = a.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // update focus for accessibility
            target.tabIndex = -1;
            target.focus({ preventScroll: true });
        });
    }

    // Simple accordion: .accordion .accordion-header and .accordion-panel
    function initAccordion() {
        const headers = document.querySelectorAll('.accordion .accordion-header');
        headers.forEach((h) => {
            h.setAttribute('role', 'button');
            h.setAttribute('tabindex', '0');
            h.setAttribute('aria-expanded', 'false');
            h.addEventListener('click', toggle);
            h.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle.call(h, e);
                }
            });
        });

        function toggle() {
            const header = this;
            const panel = header.nextElementSibling;
            if (!panel) return;
            const expanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', String(!expanded));
            header.classList.toggle('active', !expanded);
            if (!expanded) {
                panel.style.maxHeight = panel.scrollHeight + 'px';
            } else {
                panel.style.maxHeight = null;
            }
        }
    }

    // Modal pattern: elements with data-modal-target attribute open, [data-modal-close] close
    function initModal() {
        document.addEventListener('click', (e) => {
            const openBtn = e.target.closest('[data-modal-target]');
            if (openBtn) {
                const sel = openBtn.getAttribute('data-modal-target');
                const modal = document.querySelector(sel);
                if (modal) openModal(modal);
                return;
            }
            const closeBtn = e.target.closest('[data-modal-close]');
            if (closeBtn) {
                const modal = closeBtn.closest('.modal');
                if (modal) closeModal(modal);
                return;
            }
            // close when clicking overlay
            if (e.target.classList && e.target.classList.contains('modal')) {
                closeModal(e.target);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.open').forEach(closeModal);
            }
        });

        function openModal(modal) {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            // focus first focusable element
            const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();
            document.body.style.overflow = 'hidden';
        }

        function closeModal(modal) {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    // Lightweight carousel/slider for .carousel elements
    function initCarousel() {
        document.querySelectorAll('.carousel').forEach((carousel) => {
            const track = carousel.querySelector('.carousel-track');
            const slides = track ? Array.from(track.children) : [];
            const btnNext = carousel.querySelector('.carousel-next');
            const btnPrev = carousel.querySelector('.carousel-prev');
            if (!track || slides.length === 0) return;

            let idx = 0;
            let interval = null;
            const autoplayMs = parseInt(carousel.getAttribute('data-autoplay')) || 4000;

            function show(i) {
                idx = (i + slides.length) % slides.length;
                const offset = -idx * 100;
                track.style.transform = `translateX(${offset}%)`;
                carousel.querySelectorAll('.carousel-dot').forEach((d, di) => {
                    d.classList.toggle('active', di === idx);
                });
            }

            btnNext && btnNext.addEventListener('click', () => show(idx + 1));
            btnPrev && btnPrev.addEventListener('click', () => show(idx - 1));

            // optional dots
            const dotsContainer = carousel.querySelector('.carousel-dots');
            if (dotsContainer) {
                slides.forEach((_, i) => {
                    const dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                    dot.addEventListener('click', () => show(i));
                    dotsContainer.appendChild(dot);
                });
            }

            function start() {
                if (interval) clearInterval(interval);
                interval = setInterval(() => show(idx + 1), autoplayMs);
            }
            function stop() {
                if (interval) clearInterval(interval);
                interval = null;
            }

            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);

            // init
            show(0);
            if (autoplayMs > 0) start();
        });
    }

    // Simple client-side form validation + success message for form#contact-form
    function initFormValidation() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const elements = Array.from(form.elements).filter((el) => el.willValidate);
            let valid = true;
            elements.forEach((el) => {
                if (!el.checkValidity()) {
                    valid = false;
                    el.classList.add('invalid');
                    // show default browser tooltip by focusing briefly
                    el.focus();
                } else {
                    el.classList.remove('invalid');
                }
            });
            if (!valid) return;
            // fake submit: show inline message
            const msg = form.querySelector('.form-message') || createMessageNode(form);
            msg.textContent = 'Message sent. Thank you!';
            msg.className = 'form-message success';
            form.reset();
            setTimeout(() => (msg.textContent = ''), 4000);
        });

        function createMessageNode(form) {
            const p = document.createElement('p');
            p.className = 'form-message';
            form.appendChild(p);
            return p;
        }
    }

    // Theme toggle: #theme-toggle toggles dark mode (class 'dark' on <html>)
    function initThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        const key = 'site-theme';
        const prefer = localStorage.getItem(key) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(prefer);

        btn.addEventListener('click', () => {
            const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            setTheme(next);
            localStorage.setItem(key, next);
        });

        function setTheme(t) {
            document.documentElement.classList.toggle('dark', t === 'dark');
            btn.setAttribute('aria-pressed', String(t === 'dark'));
        }
    }

    // Back-to-top button with id #back-to-top
    function initBackToTop() {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;
        const showPx = parseInt(btn.getAttribute('data-show-px')) || 300;
        window.addEventListener('scroll', () => {
            btn.style.display = window.scrollY > showPx ? 'block' : 'none';
        });
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();