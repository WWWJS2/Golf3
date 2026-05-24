(() => {
  const doc = document.documentElement;
  const body = document.body;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasLenis = typeof window.Lenis !== 'undefined';
  let lenis = null;

  if (hasLenis) {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  const clampText = (n) => String(Math.round(n)).padStart(2, '0');

  function runPreloader() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;
    if (!hasGSAP) { preloader.style.display = 'none'; body.classList.remove('is-loading'); return; }
    const counter = { value: 0 };
    gsap.set('.site-nav', { autoAlpha: 0, y: -24 });
    gsap.set('.hero .line-mask > span', { yPercent: 112 });
    gsap.set('.hero__copy, .hero__cta', { autoAlpha: 0, y: 28 });
    gsap.set('.preloader__track span', { scaleX: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(counter, {
      value: 100,
      duration: 1.1,
      ease: 'power2.inOut',
      onUpdate: () => {
        const el = document.querySelector('.preloader__count');
        if (el) el.textContent = clampText(counter.value);
      }
    }, 0)
    .to('.preloader__track span', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0)
    .to('.preloader__title span', { yPercent: -120, duration: .75, ease: 'expo.inOut' }, '>-0.05')
    .to(preloader, { clipPath: 'inset(0% 0% 100% 0%)', duration: .95, ease: 'expo.inOut' }, '<0.1')
    .set(preloader, { display: 'none' })
    .call(() => body.classList.remove('is-loading'))
    .to('.site-nav', { autoAlpha: 1, y: 0, duration: .75 }, '-=.35')
    .to('.hero .line-mask > span', { yPercent: 0, duration: 1.05, stagger: .08 }, '-=.55')
    .to('.hero__copy, .hero__cta', { autoAlpha: 1, y: 0, duration: .75, stagger: .08 }, '-=.7');
  }

  function initMenu() {
    const menu = document.querySelector('.mega-menu');
    const open = document.querySelector('.menu-toggle');
    const close = document.querySelector('.mega-menu__close');
    const links = menu ? menu.querySelectorAll('a') : [];
    const setState = (state) => {
      if (!menu || !open) return;
      menu.classList.toggle('is-open', state);
      body.classList.toggle('menu-open', state);
      menu.setAttribute('aria-hidden', state ? 'false' : 'true');
      open.setAttribute('aria-expanded', state ? 'true' : 'false');
      if (lenis) state ? lenis.stop() : lenis.start();
    };
    open && open.addEventListener('click', () => setState(true));
    close && close.addEventListener('click', () => setState(false));
    links.forEach(link => link.addEventListener('click', () => setState(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setState(false); });
  }

  function buttonFlair() {
    document.querySelectorAll('[data-block="button"]').forEach((button) => {
      const flair = button.querySelector('.button__flair');
      if (!flair || !hasGSAP) return;
      const xSet = gsap.quickSetter(flair, 'xPercent');
      const ySet = gsap.quickSetter(flair, 'yPercent');
      const xy = (e) => {
        const r = button.getBoundingClientRect();
        return {
          x: gsap.utils.clamp(0, 100, gsap.utils.mapRange(0, r.width, 0, 100, e.clientX - r.left)),
          y: gsap.utils.clamp(0, 100, gsap.utils.mapRange(0, r.height, 0, 100, e.clientY - r.top))
        };
      };
      button.addEventListener('mouseenter', (e) => {
        const p = xy(e); xSet(p.x); ySet(p.y);
        gsap.to(flair, { scale: 1, duration: .42, ease: 'power2.out' });
      });
      button.addEventListener('mousemove', (e) => {
        const p = xy(e); gsap.to(flair, { xPercent: p.x, yPercent: p.y, duration: .35, ease: 'power2' });
      });
      button.addEventListener('mouseleave', () => gsap.to(flair, { scale: 0, duration: .32, ease: 'power2.out' }));
    });
  }

  function cursor() {
    const cursor = document.querySelector('.custom-cursor');
    if (!cursor || matchMedia('(pointer: coarse)').matches || !hasGSAP) return;
    const xTo = gsap.quickTo(cursor, 'x', { duration: .28, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: .28, ease: 'power3' });
    window.addEventListener('mousemove', (e) => {
      cursor.classList.add('is-active'); xTo(e.clientX); yTo(e.clientY);
    });
    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => { cursor.dataset.label = el.dataset.cursor; cursor.classList.add('has-label'); });
      el.addEventListener('mouseleave', () => { cursor.dataset.label = ''; cursor.classList.remove('has-label'); });
    });
  }

  function scrollAnimations() {
    if (!hasGSAP || typeof ScrollTrigger === 'undefined') return;
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        y: 45, autoAlpha: 0, duration: .9, ease: 'power3.out'
      });
    });
    gsap.utils.toArray('.line-mask > span').forEach((el) => {
      if (el.closest('.hero')) return;
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        yPercent: 110, duration: .9, ease: 'power4.out'
      });
    });
    gsap.utils.toArray('.parallax-img').forEach((img) => {
      gsap.to(img, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    gsap.to('.gallery-strip', {
      x: () => {
        const strip = document.querySelector('.gallery-strip');
        if (!strip || window.innerWidth < 760) return 0;
        return Math.min(0, window.innerWidth - strip.scrollWidth - 80);
      },
      ease: 'none',
      scrollTrigger: { trigger: '.gallery', start: 'top top', end: '+=140%', scrub: true, pin: true, invalidateOnRefresh: true }
    });
    ScrollTrigger.create({
      trigger: '.intro', start: 'top top', end: 'bottom top',
      onEnter: () => document.querySelector('.site-nav')?.classList.add('on-light'),
      onLeaveBack: () => document.querySelector('.site-nav')?.classList.remove('on-light')
    });
    ScrollTrigger.create({
      trigger: '.process', start: 'top top', end: 'bottom top',
      onEnter: () => document.querySelector('.site-nav')?.classList.remove('on-light'),
      onLeaveBack: () => document.querySelector('.site-nav')?.classList.add('on-light')
    });
    ScrollTrigger.create({
      trigger: '.stats', start: 'top top', end: 'bottom top',
      onEnter: () => document.querySelector('.site-nav')?.classList.add('on-light'),
      onLeaveBack: () => document.querySelector('.site-nav')?.classList.remove('on-light')
    });
    gsap.utils.toArray('.counter').forEach((el) => {
      const target = Number(el.dataset.target || 0);
      const obj = { value: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => gsap.to(obj, {
          value: target, duration: 1.8, ease: 'power2.out',
          onUpdate: () => el.textContent = Math.round(obj.value) + (target === 360 ? '°' : '+')
        })
      });
    });
  }

  function timeline() {
    const data = [
      ['Market Intelligence & Positioning', 'We map the Saudi golf landscape, identify high-value channels, and define brand positioning for retail, club, resort, and online growth.'],
      ['Launch Infrastructure', 'Distribution routes, launch inventory, partner pipelines, and retail education systems are prepared before market activation.'],
      ['Retail and Course Expansion', 'We expand into premium retail, clubs, academies, resorts, and destination experiences with consistent brand standards.'],
      ['Localized E-Commerce Scale', 'Digital storefronts, product storytelling, performance campaigns, and fulfillment logic become a growth engine.'],
      ['Category Leadership', 'The brand becomes visible, available, and trusted across Saudi Arabia’s premium golf ecosystem.']
    ];
    const years = Array.from(document.querySelectorAll('.year'));
    const title = document.querySelector('.timeline-card h3');
    const copy = document.querySelector('.timeline-card p');
    const rule = document.querySelector('.timeline__rule');
    let active = 0;
    const render = (i) => {
      active = (i + data.length) % data.length;
      years.forEach((y, idx) => y.classList.toggle('is-active', idx === active));
      if (title && copy) {
        if (hasGSAP) {
          gsap.to([title, copy], { autoAlpha: 0, y: 18, duration: .18, onComplete: () => {
            title.textContent = data[active][0]; copy.textContent = data[active][1];
            gsap.to([title, copy], { autoAlpha: 1, y: 0, duration: .35, stagger: .06 });
          }});
        } else { title.textContent = data[active][0]; copy.textContent = data[active][1]; }
      }
      if (rule) rule.style.setProperty('--progress', ((active) / (data.length - 1) * 100) + '%');
    };
    years.forEach((btn, i) => btn.addEventListener('click', () => render(i)));
    document.querySelector('.timeline-next')?.addEventListener('click', () => render(active + 1));
    document.querySelector('.timeline-prev')?.addEventListener('click', () => render(active - 1));
  }

  function processAccordion() {
    const steps = Array.from(document.querySelectorAll('.step'));
    const serviceItems = Array.from(document.querySelectorAll('.service-list li'));
    steps.forEach((step, index) => {
      step.querySelector('button')?.addEventListener('click', () => {
        steps.forEach(s => s.classList.remove('is-open'));
        step.classList.add('is-open');
        serviceItems.forEach((s, i) => s.classList.toggle('active', i === Math.min(index, serviceItems.length - 1)));
      });
    });
    serviceItems.forEach((item, i) => item.addEventListener('mouseenter', () => {
      serviceItems.forEach(s => s.classList.remove('active'));
      item.classList.add('active');
    }));
  }

  function solutionsHover() {
    const visual = document.querySelector('.solutions__visual img');
    if (!visual) return;
    document.querySelectorAll('.solution-item').forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const src = item.dataset.image;
        if (!src || visual.getAttribute('src') === src) return;
        if (hasGSAP) {
          gsap.to(visual, { autoAlpha: 0, scale: 1.03, duration: .22, onComplete: () => {
            visual.src = src;
            gsap.fromTo(visual, { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1, duration: .45, ease: 'power2.out' });
          }});
        } else { visual.src = src; }
      });
    });
  }

  function pageTransitions() {
    if (!hasGSAP) return;
    document.querySelectorAll('a[href]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
        e.preventDefault();
        const tl = gsap.timeline({ defaults: { ease: 'expo.inOut', duration: .55 }, onStart: () => {
          document.querySelector('.page-transition').style.visibility = 'visible';
        }, onComplete: () => { window.location.href = href; } });
        tl.to('.transition-top', { clipPath: 'inset(0 0 0% 0)' }, 0)
          .to('.transition-bottom', { clipPath: 'inset(0% 0 0 0)' }, 0);
      });
    });
  }

  window.addEventListener('load', () => {
    initMenu();
    buttonFlair();
    cursor();
    timeline();
    processAccordion();
    solutionsHover();
    pageTransitions();
    runPreloader();
    scrollAnimations();
    setTimeout(() => { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); }, 400);
  });
})();
