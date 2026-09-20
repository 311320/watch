(() => {
  const story = document.querySelector('.story');
  const stage = document.querySelector('.stage');
  if (!story || !stage) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !window.gsap || !window.ScrollTrigger) {
    if (!reduced.matches) document.documentElement.classList.add('no-gsap');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const $ = (selector) => document.querySelector(selector);
  const earth = $('.earth');
  const orbit = $('.orbit');
  const path = $('.orbit-line');
  const craft = $('#craft');
  const pathLength = path.getTotalLength();
  const orbitTravel = { progress: 0 };

  function placeCraft() {
    const distance = pathLength * orbitTravel.progress;
    const point = path.getPointAtLength(distance);
    const next = path.getPointAtLength(Math.min(pathLength, distance + 2));
    const angle = Math.atan2(next.y - point.y, next.x - point.x) * 180 / Math.PI;
    craft.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
  }

  function earthTargetSize() {
    return orbit.getBoundingClientRect().width * 0.48;
  }

  function earthScale() {
    return earthTargetSize() / earth.offsetWidth;
  }

  function earthY() {
    const top = window.innerHeight * (window.innerWidth <= 600 ? 0.68 : 0.66);
    const targetCenter = window.innerHeight * (window.innerWidth <= 600 ? 0.53 : window.innerWidth <= 900 ? 0.57 : 0.51);
    return targetCenter - top - earthTargetSize() / 2;
  }

  gsap.set(earth, { xPercent: -50, transformOrigin: '50% 0%' });
  gsap.set('.orbit', { xPercent: -50, yPercent: -50 });
  gsap.set('.transition-108, .transition-65', { y: 25 });
  gsap.set('.time-bridge', { y: 12 });
  gsap.set('.time-line', { scaleX: 0 });
  gsap.set('.watch-primary', { y: 18 });
  placeCraft();

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: story,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 6.7)}`,
      pin: stage,
      scrub: 0.7,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: self => gsap.set('.progress-fill', { scaleX: self.progress })
    }
  });

  // 1961: typography and planet separate at different rates, like a slow camera pullback.
  timeline
    .to('.hero-date', { y: -36, opacity: 0, duration: 0.54 }, 0.48)
    .to('.hero-number', { y: -70, opacity: 0, duration: 0.72 }, 0.58)
    .to('.hero-unit', { y: -42, opacity: 0, duration: 0.65 }, 0.70)
    .to('.hero-subtitle', { y: -18, opacity: 0, duration: 0.48 }, 0.79)
    .to('.hero-note, .scroll-cue', { opacity: 0, duration: 0.35 }, 0.55)
    .to('.stars-far', { x: 10, y: -30, duration: 4.1 }, 0.45)
    .to('.stars-near', { x: -12, y: -66, duration: 4.1 }, 0.45)
    .to(earth, { scale: earthScale, y: earthY, duration: 1.10, ease: 'power2.inOut' }, 0.67)
    .to(orbit, { opacity: 1, duration: 0.62 }, 1.06)
    .to('.orbit-meta', { opacity: 0.65, duration: 0.4 }, 1.32)
    .to('.launch-copy', { opacity: 1, y: 0, duration: 0.48 }, 1.27)

    // Every point on the orbit is tied to the same scroll progress.
    .to(orbitTravel, { progress: 0.995, duration: 2.91, onUpdate: placeCraft }, 1.57)
    .to('.earth-surface', { rotation: 13, duration: 2.95, transformOrigin: '50% 50%' }, 1.57)
    .to(earth, { x: -12, duration: 2.75 }, 1.72)
    .to(earth, { scale: () => earthScale() * 1.025, duration: 2.3 }, 2.06)
    .to('.launch-copy', { opacity: 0, y: -14, duration: 0.33 }, 1.91)
    .to('.orbit-copy', { opacity: 1, y: 0, duration: 0.36 }, 2.12)
    .to('.orbit-copy', { opacity: 0, y: -14, duration: 0.32 }, 2.72)
    .to('.flight-copy', { opacity: 1, y: 0, duration: 0.36 }, 2.94)
    .to('.flight-copy', { opacity: 0, y: -14, duration: 0.34 }, 3.58)
    .to('.return-copy', { opacity: 1, y: 0, duration: 0.34 }, 3.81)
    .to('.return-copy', { opacity: 0, y: -15, duration: 0.33 }, 4.40)

    // The flight ends before the anniversary typography begins.
    .to('.orbit, .orbit-meta', { opacity: 0, duration: 0.45 }, 4.42)
    .to(earth, { scale: () => earthScale() * 0.38, y: () => earthY() - window.innerHeight * 0.12, opacity: 0, duration: 0.55, ease: 'power2.in' }, 4.37)
    .to('.transition-108', { opacity: 1, y: 0, duration: 0.35 }, 4.90)
    .to('.transition-108', { scale: 1.16, opacity: 0, duration: 0.30, ease: 'power1.in' }, 5.75)

    // A brief empty beat makes the date jump legible before the product reveal.
    .to('.time-bridge', { opacity: 1, y: 0, duration: 0.24 }, 6.14)
    .to('.time-line', { scaleX: 1, duration: 0.27 }, 6.17)
    .to('.time-bridge', { opacity: 0, y: -8, duration: 0.22 }, 6.64)
    .to('.transition-65', { opacity: 1, y: 0, duration: 0.32 }, 6.90)
    .to('.transition-65', { scale: 1.07, opacity: 0, duration: 0.29, ease: 'power1.in' }, 7.53)

    // The watch is visible first; the campaign typography follows it.
    .to('.product-scene', { opacity: 1, duration: 0.45 }, 7.65)
    .to('.match-ring', { opacity: 0.34, scale: 1, duration: 0.38 }, 7.86)
    .to('.watch-primary', { opacity: 1, scale: 1, y: 0, duration: 0.95, ease: 'power2.out' }, 7.72)
    .to('.match-ring', { left: () => window.innerWidth <= 600 ? '50%' : '55%', top: () => window.innerWidth <= 600 ? '46%' : '47%', scale: 1.10, duration: 0.38 }, 8.08)
    .to('.match-ring', { opacity: 0, scale: 1.18, duration: 0.34 }, 8.52)
    .to('.product-title', { opacity: () => window.innerWidth <= 600 ? 0.55 : 0.7, duration: 0.40 }, 8.55)
    .to('.product-kicker', { opacity: 0.72, duration: 0.34 }, 8.68)
    .to('.product-copy', { opacity: 1, duration: 0.37 }, 8.73)
    .to('.product-edition', { opacity: 0.6, duration: 0.34 }, 8.78)
    .to('.watch-secondary', { opacity: 0.31, scale: 1, duration: 0.52 }, 9.17)
    .to({}, { duration: 0.45 }, 9.69);

  function refreshWhenReady() { ScrollTrigger.refresh(); }
  window.addEventListener('load', refreshWhenReady, { once: true });
  document.fonts?.ready.then(refreshWhenReady);
  Promise.all(Array.from(document.images, image => image.decode().catch(() => {}))).then(refreshWhenReady);
  reduced.addEventListener?.('change', () => window.location.reload());
})();
