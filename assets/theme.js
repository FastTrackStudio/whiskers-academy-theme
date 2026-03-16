/**
 * Whiskers Academy — theme.js
 * Handles: sticky header, mobile nav, FAQ accordion, buy box gallery,
 *          sticky CTA visibility, scroll reveals, Meta Pixel events,
 *          character card drag-scroll, preorder accordion
 */

(function () {
    'use strict';

    /* ─── Helpers ─────────────────────────────────── */
    const qs = (sel, ctx = document) => ctx.querySelector(sel);
    const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    /* ─── 1. Sticky Header ────────────────────────── */
    const header = qs('.site-header');
    if (header) {
        const onScroll = () =>
            header.classList.toggle('is-scrolled', window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ─── 2. Mobile Nav ───────────────────────────── */
    const hamburger = qs('.hamburger');
    const mobileNav = qs('.mobile-nav');
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            const open = hamburger.classList.toggle('is-open');
            mobileNav.classList.toggle('is-open', open);
            document.body.style.overflow = open ? 'hidden' : '';
            hamburger.setAttribute('aria-expanded', open);
        });

        qsa('.mobile-nav .site-nav__link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('is-open');
                mobileNav.classList.remove('is-open');
                document.body.style.overflow = '';
                hamburger.setAttribute('aria-expanded', false);
            });
        });
    }

    /* ─── 3. FAQ Accordion ────────────────────────── */
    qsa('.faq-item').forEach(item => {
        const trigger = qs('.faq-item__trigger', item);
        if (!trigger) return;
        trigger.addEventListener('click', () => {
            const isOpen = item.classList.toggle('is-open');
            trigger.setAttribute('aria-expanded', isOpen);
        });
    });

    /* ─── 4. Pre-order Accordion ──────────────────── */
    qsa('.preorder-accordion__trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const body = qs('.preorder-accordion__body',
                trigger.closest('.preorder-accordion'));
            if (!body) return;
            const open = trigger.classList.toggle('is-open');
            body.classList.toggle('is-open', open);
            trigger.setAttribute('aria-expanded', open);
        });
    });

    /* ─── 5. Buy Box Gallery ──────────────────────────────── */
    const galleryMain = qs('#mainGalleryImg');
    const thumbs = qsa('.gallery-thumb');
    let activeThumbIndex = 0;

    function setActiveThumb(idx) {
        activeThumbIndex = idx;
        thumbs.forEach(t => t.classList.remove('is-active'));
        if (thumbs[idx]) thumbs[idx].classList.add('is-active');
    }

    function swapMainImage(src, idx) {
        if (!galleryMain || !src) return;
        galleryMain.style.opacity = '0';
        setTimeout(() => {
            galleryMain.src = src;
            galleryMain.style.opacity = '1';
        }, 180);
        setActiveThumb(idx);
    }

    if (galleryMain && thumbs.length) {
        thumbs.forEach((thumb, i) => {
            thumb.addEventListener('click', () => swapMainImage(thumb.dataset.src, i));
        });
    }

    /* ─── 6. Image Lightbox ──────────────────────────────── */
    const lightbox = qs('#galleryLightbox');
    const lightboxImg = qs('#lightboxImg');
    const allSrcs = thumbs.map(t => t.dataset.src).filter(Boolean);
    let lightboxIndex = 0;

    function openLightbox(idx) {
        if (!lightbox || !lightboxImg || !allSrcs.length) return;
        lightboxIndex = idx;
        lightboxImg.style.opacity = '0';
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
        lightboxImg.src = allSrcs[lightboxIndex];
        lightboxImg.onload = () => { lightboxImg.style.opacity = '1'; };
        // if already cached, fire immediately
        if (lightboxImg.complete) lightboxImg.style.opacity = '1';
        updateArrows();
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.hidden = true;
        document.body.style.overflow = '';
    }

    function stepLightbox(dir) {
        lightboxIndex = (lightboxIndex + dir + allSrcs.length) % allSrcs.length;
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = allSrcs[lightboxIndex];
            lightboxImg.style.opacity = '1';
            // sync thumbnail highlight
            setActiveThumb(lightboxIndex);
            if (galleryMain) {
                galleryMain.src = allSrcs[lightboxIndex];
            }
        }, 180);
        updateArrows();
    }

    function updateArrows() {
        const prevBtn = qs('[data-lightbox-prev]');
        const nextBtn = qs('[data-lightbox-next]');
        if (prevBtn) prevBtn.style.display = allSrcs.length <= 1 ? 'none' : '';
        if (nextBtn) nextBtn.style.display = allSrcs.length <= 1 ? 'none' : '';
    }

    if (lightbox) {
        // Open on main image click
        const openTrigger = qs('[data-lightbox-open]');
        if (openTrigger) {
            openTrigger.addEventListener('click', () => openLightbox(activeThumbIndex));
        }

        // Close buttons / backdrop
        qsa('[data-lightbox-close]').forEach(el =>
            el.addEventListener('click', closeLightbox)
        );

        // Prev / next arrows
        const prevBtn = qs('[data-lightbox-prev]');
        const nextBtn = qs('[data-lightbox-next]');
        if (prevBtn) prevBtn.addEventListener('click', () => stepLightbox(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => stepLightbox(1));

        // Keyboard navigation
        document.addEventListener('keydown', e => {
            if (lightbox.hidden) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft')  stepLightbox(-1);
            if (e.key === 'ArrowRight') stepLightbox(1);
        });
    }

    /* ─── 7. Sticky CTA (mobile) ──────────────────── */
    const stickyCTA = qs('#StickyCTA');
    const heroBuyBtn = qs('.hero__actions .btn--primary');
    if (stickyCTA && heroBuyBtn) {
        const observer = new IntersectionObserver(
            ([entry]) => {
                stickyCTA.classList.toggle('is-visible', !entry.isIntersecting);
                stickyCTA.setAttribute('aria-hidden', entry.isIntersecting);
            },
            { threshold: 0, rootMargin: '0px 0px -60px 0px' }
        );
        observer.observe(heroBuyBtn);
    }

    /* ─── 7. Scroll Reveal ────────────────────────── */
    const revealElements = qsa('[data-reveal]');
    if (revealElements.length && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        revealElements.forEach(el => revealObserver.observe(el));
    }

    /* ─── 8. Character Strip — Drag to Scroll ─────── */
    const strip = qs('.characters-strip');
    if (strip) {
        let isDown = false, startX, scrollLeft;

        strip.addEventListener('mousedown', e => {
            isDown = true;
            strip.style.cursor = 'grabbing';
            startX = e.pageX - strip.offsetLeft;
            scrollLeft = strip.scrollLeft;
        });
        strip.addEventListener('mouseleave', () => {
            isDown = false;
            strip.style.cursor = 'grab';
        });
        strip.addEventListener('mouseup', () => {
            isDown = false;
            strip.style.cursor = 'grab';
        });
        strip.addEventListener('mousemove', e => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - strip.offsetLeft;
            const walk = (x - startX) * 1.5;
            strip.scrollLeft = scrollLeft - walk;
        });
    }

    /* ─── 9. Meta Pixel — Add to Cart / Checkout ──── */
    function firePixel(event, data = {}) {
        if (typeof fbq === 'undefined') return;
        fbq('track', event, data);
    }

    // Add to Cart
    const addToCartBtn = qs('.buybox__add-btn, .btn--add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            firePixel('AddToCart', {
                content_name: 'Whiskers Academy Card Game',
                content_type: 'product',
                value: 29.99,
                currency: 'USD'
            });
        });
    }

    // Watch Trailer — optional engagement event
    const trailerBtn = qs('.btn--trailer');
    if (trailerBtn) {
        trailerBtn.addEventListener('click', () => {
            firePixel('ViewContent', {
                content_name: 'Whiskers Academy Trailer',
                content_type: 'video'
            });
        });
    }

    /* ─── 10. Smooth scroll for anchor links ──────── */
    qsa('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = qs(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = (header ? header.offsetHeight : 0) + 16;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - offset,
                behavior: 'smooth'
            });
        });
    });

    /* ─── 11. Email form — validate then allow native POST to Shopify */
    const emailForm = qs('.email-form');
    if (emailForm) {
        emailForm.addEventListener('submit', e => {
            const input = qs('.email-form__input', emailForm);
            const btn   = qs('.email-form__btn', emailForm);
            // Client-side validation only — do NOT prevent default on success
            if (!input || !input.value.includes('@')) {
                e.preventDefault();
                input.focus();
                input.style.borderColor = '#E07A5F';
                return;
            }
            // Fire pixel before the page navigates away
            firePixel('Lead', { content_name: 'Email Capture', status: 'submitted' });
            // Visual feedback while the browser posts the form
            btn.textContent = '🎓 Saving…';
            btn.disabled = true;
            // Form submits naturally → Shopify creates the customer record
        });
    }

    /* ─── 12. Shopify — Direct to Checkout ─────────── */
    // Single-product store: skip cart, go straight to checkout
    const shopifyAddBtn = qs('[data-add-to-cart]');
    if (shopifyAddBtn) {
        shopifyAddBtn.addEventListener('click', async e => {
            e.preventDefault();
            const variantId = shopifyAddBtn.dataset.variantId;
            if (!variantId) return;

            shopifyAddBtn.textContent = 'Going to checkout…';
            shopifyAddBtn.disabled = true;

            try {
                const res = await fetch('/cart/add.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: variantId, quantity: 1 })
                });
                if (res.ok) {
                    firePixel('AddToCart', {
                        content_name: 'Whiskers Academy Card Game',
                        value: 29.99,
                        currency: 'USD'
                    });
                    firePixel('InitiateCheckout', { value: 29.99, currency: 'USD' });
                    window.location.href = '/checkout';
                } else {
                    shopifyAddBtn.textContent = 'Error — Try Again';
                    shopifyAddBtn.disabled = false;
                }
            } catch {
                shopifyAddBtn.textContent = 'Pre-Order Now';
                shopifyAddBtn.disabled = false;
            }
        });
    }

})();
