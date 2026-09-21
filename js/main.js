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
  const rocketAnchor = $('.rocket-anchor');
  const rocketPose = $('.rocket-pose');
  const rocketVisual = $('.rocket-visual');
  const pathLength = path.getTotalLength();
  const orbitStart = 0.07;
  const orbitTravel = { progress: orbitStart };

  function smoothstep(start, end, value) {
    const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return t * t * (3 - 2 * t);
  }

  function placeRocket() {
    const distance = pathLength * orbitTravel.progress;
    const point = path.getPointAtLength(distance);
    const before = path.getPointAtLength(Math.max(0, distance - 2));
    const after = path.getPointAtLength(Math.min(pathLength, distance + 2));
    let angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
    if (orbitTravel.progress > 0.5 && angle < 0) angle += 360;
    const svgPoint = orbit.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;
    const screenPoint = svgPoint.matrixTransform(path.getScreenCTM());
    const stageRect = stage.getBoundingClientRect();
    // The drawn SVG path is the sole source of the image center at every viewport.
    gsap.set(rocketAnchor, {
      x: screenPoint.x - stageRect.left,
      y: screenPoint.y - stageRect.top
    });
    const travel = (orbitTravel.progress - orbitStart) / (0.995 - orbitStart);
    const proximity = smoothstep(0, 0.18, travel) *
      (1 - smoothstep(0.18, 0.36, travel));
    const nearScale = window.innerWidth <= 600 ? 1.3 : window.innerWidth <= 900 ? 1.45 : 1.6;
    const scale = 0.42 + (nearScale - 0.42) * proximity;
    gsap.set(rocketVisual, { scale });
    // The image points about 35 degrees above horizontal; align that axis with travel.
    gsap.set(rocketPose, { rotation: angle + 35 });
  }

  function earthTargetSize() {
    // The supplied 960 px image has a 44.4% radius within its square frame.
    if (window.innerWidth <= 600) return window.innerWidth * 0.66;
    return orbit.getBoundingClientRect().width * 0.54;
  }

  function earthScale() {
    return earthTargetSize() / earth.offsetWidth;
  }

  function earthY() {
    const top = earth.offsetTop;
    const targetCenter = window.innerHeight * (window.innerWidth <= 600 ? 0.53 : window.innerWidth <= 900 ? 0.57 : 0.51);
    const mobileLift = window.innerWidth <= 600 ? 22 : 0;
    return targetCenter - top - earthTargetSize() / 2 - mobileLift;
  }

  gsap.set(earth, { xPercent: -50, transformOrigin: '50% 0%' });
  gsap.set('.orbit', { xPercent: -50, yPercent: -50 });
  gsap.set('.transition-108, .transition-65', { y: 25 });
  gsap.set('.time-bridge', { y: 12 });
  gsap.set('.time-line', { scaleX: 0 });
  gsap.set('.watch-primary', { y: 18 });
  placeRocket();

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
      onRefresh: placeRocket,
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
    .to(earth, { opacity: 1, duration: 0.66 }, 0.02)
    .to('.stars-far', { x: 5, y: -12, duration: 4.1 }, 0.45)
    .to('.stars-near', { x: -7, y: -24, duration: 4.1 }, 0.45)
    .to(earth, { scale: earthScale, y: earthY, duration: 1.10, ease: 'power2.inOut' }, 0.67)
    .to(orbit, { opacity: 1, duration: 0.62 }, 1.06)
    .to('.orbit-meta', { opacity: 0.65, duration: 0.4 }, 1.32)
    .to('.launch-copy', { opacity: 1, y: 0, duration: 0.48 }, 1.27)
    .to(rocketAnchor, { opacity: 1, duration: 0.30 }, 1.13)

    // Every point on the orbit is tied to the same scroll progress.
    .to(orbitTravel, { progress: 0.995, duration: 3.28, onUpdate: placeRocket }, 1.20)
    .to('.rocket-trail', { opacity: 0.78, duration: 0.39 }, 1.61)
    .to('.rocket-exhaust', { opacity: 0.75, duration: 0.39 }, 1.61)
    .to('.rocket-trail', { opacity: 0.12, duration: 0.57 }, 2.05)
    .to('.rocket-exhaust', { opacity: 0.20, duration: 0.57 }, 2.05)
    .to('.earth-surface', { rotation: 3, duration: 2.95, transformOrigin: '50% 50%' }, 1.57)
    .to(earth, { x: window.innerWidth <= 600 ? 6 : -20, duration: 2.75 }, 1.72)
    .to(earth, { scale: () => earthScale() * 1.055, duration: 2.3 }, 2.06)
    .to('.launch-copy', { opacity: 0, y: -14, duration: window.innerWidth <= 600 ? 0.28 : 0.33 }, 1.91)
    .to('.orbit-copy', { opacity: 1, y: 0, duration: window.innerWidth <= 600 ? 0.28 : 0.36 }, window.innerWidth <= 600 ? 2.20 : 2.12)
    .to('.orbit-copy', { opacity: 0, y: -14, duration: window.innerWidth <= 600 ? 0.24 : 0.32 }, 2.72)
    .to('.flight-copy', { opacity: 1, y: 0, duration: window.innerWidth <= 600 ? 0.34 : 0.36 }, window.innerWidth <= 600 ? 2.96 : 2.94)
    .to('.flight-copy', { opacity: 0, y: -14, duration: window.innerWidth <= 600 ? 0.26 : 0.34 }, 3.58)
    .to('.return-copy', { opacity: 1, y: 0, duration: 0.34 }, window.innerWidth <= 600 ? 3.85 : 3.81)
    .to('.return-copy', { opacity: 0, y: -15, duration: window.innerWidth <= 600 ? 0.35 : 0.33 }, window.innerWidth <= 600 ? 4.52 : 4.40)

    // The flight ends before the anniversary typography begins.
    .to('.orbit, .orbit-meta, .rocket-anchor', { opacity: 0, duration: 0.45 }, 4.42)
    .to(earth, { scale: () => earthScale() * 0.46, y: () => earthY() - window.innerHeight * 0.22, opacity: 0, duration: 0.64, ease: 'power2.inOut' }, 4.28)
    .to('.transition-108', { opacity: 1, y: 0, duration: 0.35 }, 4.90)
    .to('.transition-108', { scale: 1.16, opacity: 0, duration: 0.30, ease: 'power1.in' }, 5.75)

    // A brief empty beat makes the date jump legible before the product reveal.
    .to('.time-bridge', { opacity: 1, y: 0, duration: 0.24 }, 6.14)
    .to('.time-line', { scaleX: 1, duration: 0.27 }, 6.17)
    .to('.time-bridge', { opacity: 0, y: -8, duration: 0.22 }, 6.64)
    .to('.transition-65', { opacity: 1, y: 0, duration: 0.32 }, 6.90)
    .to('.transition-65', { scale: 1.07, opacity: 0, duration: 0.29, ease: 'power1.in' }, 7.53);

  if (window.matchMedia('(min-width: 901px)').matches) {
    const earthBridge = $('.product-earth-bridge');
    function dialMatch() {
      const watchHeight = Math.min(stage.clientHeight * 0.52, 420);
      const watchWidth = watchHeight * 171 / 301;
      const watchScale = 1.08;
      return {
        x: stage.clientWidth * 0.57 + (0.275 - 0.5) * watchWidth * watchScale - stage.clientWidth * 0.5,
        y: stage.clientHeight * 0.48 + (0.35 - 0.5) * watchHeight * watchScale + 10 - stage.clientHeight * 0.5,
        scale: (31 / 301 * watchHeight * watchScale) / (earthBridge.offsetWidth * 0.888)
      };
    }

    gsap.set('.watch-primary', { opacity: 0, scale: 1.08, y: 10, clipPath: 'circle(0% at 27.5% 35%)' });
    gsap.set(earthBridge, { opacity: 0, scale: 1.04 });
    gsap.set('.product-halo', { opacity: 0.25 });

    // The photograph of Earth resolves into the Earth on the real dial before the case appears.
    timeline
      .to('.product-scene', { opacity: 1, duration: 0.38 }, 7.80)
      .to(earthBridge, { opacity: 0.9, duration: 0.23 }, 7.84)
      .to('.product-earth-anchor', { x: () => dialMatch().x, y: () => dialMatch().y, duration: 0.86, ease: 'power2.inOut' }, 7.97)
      .to(earthBridge, { scale: () => dialMatch().scale, opacity: 0.8, duration: 0.86, ease: 'power2.inOut' }, 7.97)
      .to('.watch-primary', { opacity: 1, clipPath: 'circle(7.5% at 27.5% 35%)', duration: 0.18 }, 8.66)
      .to(earthBridge, { opacity: 0, duration: 0.24 }, 8.73)
      .to('.watch-primary', { clipPath: 'circle(125% at 27.5% 35%)', scale: 1, y: 0, duration: 0.78, ease: 'power2.inOut' }, 8.78)
      .to('.product-halo', { opacity: 0.9, duration: 0.72 }, 8.68)
      .to('.product-kicker', { opacity: 0.76, duration: 0.30 }, 9.28)
      .to('.product-title', { opacity: 0.38, duration: 0.38 }, 9.42)
      .to('.product-copy', { opacity: 1, duration: 0.35 }, 9.55)
      .to('.watch-primary', { scale: 1.03, duration: 0.55, ease: 'power1.out' }, 9.57)
      .to({}, { duration: 0.45 }, 9.69);
  } else {
    if (window.innerWidth <= 600) {
      const earthBridge = $('.product-earth-bridge');
      const watch = $('.watch-primary');
      function mobileDialMatch() {
        const watchHeight = watch.offsetHeight;
        const watchWidth = watchHeight * 171 / 301;
        const watchScale = 1.08;
        return {
          x: (0.275 - 0.5) * watchWidth * watchScale,
          y: stage.clientHeight * (0.47 - 0.5) + (0.35 - 0.5) * watchHeight * watchScale + 8,
          scale: (31 / 301 * watchHeight * watchScale) / (earthBridge.offsetWidth * 0.888)
        };
      }

      gsap.set(watch, { yPercent: -50, opacity: 0, scale: 1.08, y: 8, clipPath: 'circle(0% at 27.5% 35%)' });
      gsap.set(earthBridge, { opacity: 0, scale: 1.04 });
      gsap.set('.product-halo', { opacity: 0.25 });

      timeline
        .to('.product-scene', { opacity: 1, duration: 0.38 }, 7.80)
        .to(earthBridge, { opacity: 0.9, duration: 0.23 }, 7.84)
        .to('.product-earth-anchor', { x: () => mobileDialMatch().x, y: () => mobileDialMatch().y, duration: 0.86, ease: 'power2.inOut' }, 7.97)
        .to(earthBridge, { scale: () => mobileDialMatch().scale, opacity: 0.8, duration: 0.86, ease: 'power2.inOut' }, 7.97)
        .to(watch, { opacity: 1, clipPath: 'circle(7.5% at 27.5% 35%)', duration: 0.18 }, 8.66)
        .to(earthBridge, { opacity: 0, duration: 0.24 }, 8.73)
        .to(watch, { clipPath: 'circle(125% at 27.5% 35%)', scale: 1, y: 0, duration: 0.78, ease: 'power2.inOut' }, 8.78)
        .to('.product-halo', { opacity: 0.9, duration: 0.72 }, 8.68)
        .to('.product-kicker', { opacity: 0.76, duration: 0.30 }, 9.28)
        .to('.product-title', { opacity: 0.38, duration: 0.38 }, 9.42)
        .to('.product-copy', { opacity: 1, duration: 0.35 }, 9.55)
        .to(watch, { scale: 1.03, duration: 0.55, ease: 'power1.out' }, 9.57)
        .to({}, { duration: 0.45 }, 9.69);
    } else {
      // Keep the existing tablet sequence outside the phone layout.
      timeline
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
    }
  }

  function refreshWhenReady() { ScrollTrigger.refresh(); }
  window.addEventListener('load', refreshWhenReady, { once: true });
  document.fonts?.ready.then(refreshWhenReady);
  Promise.all(Array.from(document.images, image => image.decode().catch(() => {}))).then(refreshWhenReady);
  reduced.addEventListener?.('change', () => window.location.reload());
})();
