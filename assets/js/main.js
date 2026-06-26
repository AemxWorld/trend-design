(function () {
  "use strict";

  const SECTIONS = ["#porte-01", "#porte-02", "#porte-03", "#porte-04", "#porte-05"];
  const HERO = "#hero";

  const preloader = document.getElementById("preloader");
  const discoverBtn = document.getElementById("discover-btn");
  const loadBar = document.getElementById("load-bar");
  const scrollBar = document.getElementById("scroll-bar");
  const header = document.getElementById("site-header");
  const bottomNav = document.getElementById("bottom-nav");
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const fullscreenMenu = document.getElementById("fullscreen-menu");
  const mainContent = document.getElementById("main-content");
  const heroCollage = document.getElementById("hero-collage");
  const contactForm = document.getElementById("contact-form");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  document.documentElement.classList.add("preloader-active");

  /* ─── Preloader counter animation ─── */
  let loadProgress = 0;
  const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 18 + 4;
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(loadInterval);
    }
    if (loadBar) loadBar.style.width = loadProgress + "%";
  }, 120);

  function dismissPreloader() {
    if (!preloader || preloader.classList.contains("is-done")) return;
    if (loadBar) loadBar.style.width = "100%";
    preloader.classList.add("is-done");
    document.documentElement.classList.remove("preloader-active");
    header?.classList.add("is-visible");
    bottomNav?.classList.add("is-visible");
    initAnimations();
    setTimeout(() => {
      document.querySelector(HERO)?.scrollIntoView({ behavior: "smooth" });
    }, 400);
  }

  discoverBtn?.addEventListener("click", dismissPreloader);

  window.addEventListener("load", () => {
    setTimeout(() => {
      if (loadBar) loadBar.style.width = "100%";
    }, 600);
  });

  /* Auto-dismiss after images load + min display time */
  Promise.all([
    new Promise((r) => setTimeout(r, 2200)),
    ...Array.from(document.images).map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve();
          else {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }
        })
    ),
  ]).then(() => {
    clearInterval(loadInterval);
    if (loadBar) loadBar.style.width = "100%";
  });

  /* ─── Menu ─── */
  function openMenu() {
    fullscreenMenu?.classList.add("is-open");
    fullscreenMenu?.setAttribute("aria-hidden", "false");
    menuToggle?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    fullscreenMenu?.classList.remove("is-open");
    fullscreenMenu?.setAttribute("aria-hidden", "true");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  menuToggle?.addEventListener("click", openMenu);
  menuClose?.addEventListener("click", closeMenu);

  fullscreenMenu?.querySelectorAll(".menu-link").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
      dismissPreloader();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ─── Scroll progress & header state ─── */
  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollBar) scrollBar.style.width = pct + "%";

    if (scrollTop > 80) {
      header?.classList.add("is-scrolled");
      if (!preloader?.classList.contains("is-done")) {
        dismissPreloader();
      }
    } else {
      header?.classList.remove("is-scrolled");
    }

    updateActiveSection();
    parallaxBg();
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* ─── Active section tracking ─── */
  function updateActiveSection() {
    const viewportMid = window.scrollY + window.innerHeight * 0.45;
    let activeIdx = 0;

    const heroEl = document.querySelector(HERO);
    if (heroEl) {
      const heroBottom = heroEl.offsetTop + heroEl.offsetHeight;
      if (viewportMid < heroBottom) {
        setActiveNav(-1);
        return;
      }
    }

    SECTIONS.forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (!el) return;
      if (viewportMid >= el.offsetTop) activeIdx = i;
    });

    setActiveNav(activeIdx);
  }

  function setActiveNav(idx) {
    bottomNav?.querySelectorAll(".bottom-nav-item").forEach((btn, i) => {
      btn.classList.toggle("active", i === idx);
    });
  }

  /* ─── Bottom nav + menu navigation ─── */
  function scrollToSection(idx) {
    dismissPreloader();
    const target = idx < 0 ? document.querySelector(HERO) : document.querySelector(SECTIONS[idx]);
    target?.scrollIntoView({ behavior: "smooth" });
  }

  bottomNav?.querySelectorAll(".bottom-nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      scrollToSection(parseInt(btn.dataset.section, 10));
    });
  });

  fullscreenMenu?.querySelectorAll(".menu-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToSection(parseInt(link.dataset.section, 10));
    });
  });

  /* ─── Parallax backgrounds ─── */
  function parallaxBg() {
    document.querySelectorAll(".porte-bg").forEach((bg) => {
      const section = bg.closest(".porte");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (center - window.innerHeight / 2) * 0.04;
      bg.style.transform = `scale(1.08) translateY(${offset}px)`;
    });

    if (heroCollage) {
      const scrollY = window.scrollY;
      heroCollage.style.transform = `translateY(${scrollY * 0.25}px) scale(${1 + scrollY * 0.0002})`;
      heroCollage.style.opacity = String(Math.max(0.05, 0.18 - scrollY * 0.0003));
    }
  }

  /* ─── Counter animation ─── */
  function animateCounters() {
    document.querySelectorAll(".stat-num[data-count]").forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      if (el.dataset.animated) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          el.dataset.animated = "1";
          observer.disconnect();

          const duration = 1600;
          const start = performance.now();

          function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased);
            if (t < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
        },
        { threshold: 0.5 }
      );

      observer.observe(el);
    });
  }

  /* ─── Reveal on scroll ─── */
  function setupReveals() {
    const revealEls = document.querySelectorAll(
      ".porte-title, .porte-lead, .service-card, .work-item, .guarantee-card, .process-step, .offer-banner"
    );

    revealEls.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ─── Reviews slider ─── */
  function setupReviewsSlider() {
    const slider = document.getElementById("reviews-slider");
    const viewport = document.getElementById("reviews-viewport");
    const track = document.getElementById("reviews-track");
    const dotsWrap = document.getElementById("reviews-dots");
    const prevBtn = document.getElementById("reviews-prev");
    const nextBtn = document.getElementById("reviews-next");
    if (!slider || !viewport || !track || !dotsWrap || slider.dataset.sliderReady) return;

    const slides = [...track.querySelectorAll(".review-card")];
    if (!slides.length) return;

    slider.dataset.sliderReady = "1";

    let activeIndex = 0;
    let autoTimer = null;
    const AUTO_MS = 5000;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "reviews-slider-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "الرأي " + (i + 1));
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.querySelectorAll(".reviews-slider-dot")];
    let sliderVisible = false;

    function scrollToSlide(index, smooth) {
      activeIndex = (index + slides.length) % slides.length;
      const slide = slides[activeIndex];
      const behavior =
        smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto";
      viewport.scrollTo({ left: slide.offsetLeft, behavior });
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === activeIndex);
        dot.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
      });
    }

    function goTo(index) {
      scrollToSlide(index, true);
    }

    function next() {
      if (!sliderVisible) return;
      scrollToSlide(activeIndex + 1, true);
    }

    function prev() {
      scrollToSlide(activeIndex - 1, true);
    }

    function syncFromScroll() {
      const viewportRect = viewport.getBoundingClientRect();
      const viewportCenter = viewportRect.left + viewportRect.width / 2;
      let closest = 0;
      let minDist = Infinity;
      slides.forEach((slide, i) => {
        const rect = slide.getBoundingClientRect();
        const slideCenter = rect.left + rect.width / 2;
        const dist = Math.abs(viewportCenter - slideCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      if (closest !== activeIndex) {
        activeIndex = closest;
        dots.forEach((dot, i) => {
          dot.classList.toggle("is-active", i === activeIndex);
          dot.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
        });
      }
    }

    function startAuto() {
      stopAuto();
      if (!sliderVisible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      autoTimer = setInterval(next, AUTO_MS);
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    prevBtn?.addEventListener("click", () => {
      prev();
      startAuto();
    });

    nextBtn?.addEventListener("click", () => {
      next();
      startAuto();
    });

    viewport.addEventListener("scroll", syncFromScroll, { passive: true });

    slider.addEventListener("mouseenter", stopAuto);
    slider.addEventListener("mouseleave", startAuto);
    slider.addEventListener("touchstart", stopAuto, { passive: true });
    slider.addEventListener("touchend", () => setTimeout(startAuto, 3000), { passive: true });

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        sliderVisible = entries[0]?.isIntersecting ?? false;
        if (sliderVisible) startAuto();
        else stopAuto();
      },
      { threshold: 0.15 }
    );
    visibilityObserver.observe(slider);

    window.addEventListener("resize", () => scrollToSlide(activeIndex, false));
  }

  /* ─── Contact form ─── */
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = contactForm.querySelector("#name")?.value?.trim();
    const phone = contactForm.querySelector("#phone")?.value?.trim();
    const projectType = contactForm.querySelector("#project-type")?.value?.trim();
    const message = contactForm.querySelector("#message")?.value?.trim();

    if (!name || !phone) {
      alert("يرجى إدخال الاسم ورقم الجوال.");
      return;
    }

    const text = encodeURIComponent(
      `مرحباً، أنا ${name}.\nنوع المشروع: ${projectType || "—"}\n${message || ""}\nرقم التواصل: ${phone}`
    );
    window.open(`https://wa.me/966100000000000?text=${text}`, "_blank");
  });

  /* ─── GSAP animations ─── */
  function initAnimations() {
    if (typeof gsap === "undefined") {
      setupReveals();
      animateCounters();
      setupReviewsSlider();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero-logo-mark", {
      opacity: 0,
      scale: 0.85,
      duration: 1.2,
      ease: "power3.out",
    });

    gsap.from(".hero-title-ar", {
      opacity: 0,
      y: 40,
      duration: 1,
      delay: 0.2,
      ease: "power3.out",
    });

    gsap.from(".hero-title-en", {
      opacity: 0,
      letterSpacing: "0.8em",
      duration: 1.2,
      delay: 0.4,
      ease: "power3.out",
    });

    gsap.from(".hero-tagline", {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: 0.7,
      ease: "power2.out",
    });

    gsap.from(".collage-item", {
      opacity: 0,
      scale: 0.9,
      stagger: 0.08,
      duration: 1.2,
      delay: 0.3,
      ease: "power2.out",
    });

    document.querySelectorAll(".porte").forEach((porte) => {
      const title = porte.querySelector(".porte-title");
      const label = porte.querySelector(".porte-label");
      const lead = porte.querySelector(".porte-lead");

      if (title) {
        gsap.from(title, {
          scrollTrigger: { trigger: porte, start: "top 75%", toggleActions: "play none none reverse" },
          opacity: 0,
          y: 60,
          duration: 0.9,
          ease: "power3.out",
        });
      }

      if (label) {
        gsap.from(label, {
          scrollTrigger: { trigger: porte, start: "top 80%" },
          opacity: 0,
          x: -20,
          duration: 0.6,
          ease: "power2.out",
        });
      }

      if (lead) {
        gsap.from(lead, {
          scrollTrigger: { trigger: porte, start: "top 70%" },
          opacity: 0,
          y: 30,
          duration: 0.7,
          delay: 0.15,
          ease: "power2.out",
        });
      }
    });

    gsap.utils.toArray(".service-card").forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: "top 85%" },
        opacity: 0,
        x: i % 2 === 0 ? -40 : 40,
        duration: 0.8,
        ease: "power3.out",
      });
    });

    gsap.utils.toArray(".work-item").forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: "top 90%" },
        opacity: 0,
        scale: 0.92,
        duration: 0.6,
        delay: (i % 3) * 0.08,
        ease: "power2.out",
      });
    });

    animateCounters();
    setupReviewsSlider();
  }

  setupReviewsSlider();
  onScroll();
})();
