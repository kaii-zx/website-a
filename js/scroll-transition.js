document.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const intro = document.querySelector(".kinetic");
  const homepage = document.querySelectorAll(".site-header, #top, .site-footer");

  if (!intro || !homepage.length) return;

  gsap.set(homepage, { y: 48, opacity: 0 });

  gsap.timeline({
    scrollTrigger: {
      trigger: intro,
      start: "top top",
      end: "+=100%",
      scrub: 0.9,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  })
    .to(".kinetic .text-background", { opacity: 0.16, scale: 1.035, ease: "none" }, 0)
    .to(".kinetic .main-content", { scale: 0.84, y: -24, opacity: 0.28, ease: "power2.in" }, 0)
    .to(".kinetic .background-image", { scale: 1.07, ease: "none" }, 0)
    .to(".kinetic", { filter: "brightness(0.72)", ease: "none" }, 0.35)
    .to(homepage, { y: 0, opacity: 1, duration: 0.48, stagger: 0.04, ease: "power2.out" }, 0.5);

  window.addEventListener("load", () => ScrollTrigger.refresh());
});