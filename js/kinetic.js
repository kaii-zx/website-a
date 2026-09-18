(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || !window.ScrollTrigger || reduce) return;

  gsap.registerPlugin(ScrollTrigger);

  const intro = document.querySelector('.kinetic-intro');
  const content = document.querySelector('.kinetic-content');
  const kicker = document.querySelector('.kinetic-kicker');
  const orbs = document.querySelectorAll('.kinetic-orb');
  const noise = document.querySelector('.kinetic-noise');
  const main = document.querySelector('main');

  gsap.set(main, { y: 90, opacity: 0 });

  const introTl = gsap.timeline({
    scrollTrigger: {
      trigger: intro,
      start: 'top top',
      end: '+=115%',
      scrub: 1.15,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  introTl
    .to(kicker, { y: -30, opacity: 0, ease: 'none' }, 0)
    .to(content, { y: -95, scale: .82, opacity: .12, ease: 'power2.in' }, .08)
    .to(orbs, { scale: 1.45, opacity: .18, ease: 'power2.inOut', stagger: .03 }, 0)
    .to(noise, { opacity: .08, ease: 'none' }, 0)
    .to(intro, { filter: 'brightness(.72)', ease: 'none' }, .25)
    .to(main, { y: 0, opacity: 1, ease: 'power2.out' }, .46);

  gsap.from('.hero-copy > *', {
    y: 35, opacity: 0, duration: .9, stagger: .09, ease: 'power3.out',
    scrollTrigger: { trigger: '.hero', start: 'top 72%' }
  });

  gsap.utils.toArray('.section').forEach(section => {
    gsap.from(section.querySelectorAll('.section-label, h2, .body-copy, .interest, .gallery-item, .contact-content'), {
      y: 28, opacity: 0, duration: .8, stagger: .07, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 78%', once: true }
    });
  });
})();
