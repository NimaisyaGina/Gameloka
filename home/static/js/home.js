/**
 * Gameloka Global UI Script (Null-safe Navigation & Smooth Scroll)
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                const isOpen = mobileMenu.classList.toggle('open');
                mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                mobileMenuBtn.textContent = isOpen ? '✕ TUTUP' : '☰ MENU';
            });

            mobileMenu.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('open');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    mobileMenuBtn.textContent = '☰ MENU';
                });
            });
        }

        // Smooth scroll for valid in-page anchors only
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (!href || href === '#') {
                    e.preventDefault();
                    return;
                }
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    });
})();
