/* ============================================================
   FOR CUTUS — main script
   Organized as an IIFE so nothing leaks into the global scope.
   Sections:
     1. Setup & element refs
     2. Ambient background (floating hearts + sparkles)
     3. Heart button (burst effect + secret unlock)
     4. Runaway "no" button
     5. Forgive button → page transition
     6. Celebration effects (confetti, fireworks, balloons)
     7. Secret popup
     8. Music toggle
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     1. SETUP & ELEMENT REFS
     ============================================================ */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const dom = {
    apologyPage: document.getElementById("apology-page"),
    celebrationPage: document.getElementById("celebration-page"),
    heartButton: document.getElementById("heart-button"),
    heartField: document.getElementById("heart-field"),
    sparkleCanvas: document.getElementById("sparkle-canvas"),
    noButton: document.getElementById("no-button"),
    forgiveButton: document.getElementById("forgive-button"),
    secretPopup: document.getElementById("secret-popup"),
    closePopupButton: document.getElementById("close-popup"),
    fireworks: document.getElementById("fireworks"),
    balloons: document.getElementById("balloons"),
    musicToggle: document.getElementById("music-toggle"),
    bgMusic: document.getElementById("bg-music"),
  };

  /* ============================================================
     2. AMBIENT BACKGROUND
     ============================================================ */
  function spawnFloatingHeart() {
    const heart = document.createElement("span");
    heart.className = "heart-field__item";
    heart.textContent = "❤️";
    heart.setAttribute("aria-hidden", "true");

    const size = 14 + Math.random() * 18;
    const duration = 9 + Math.random() * 6;

    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${size}px`;
    heart.style.opacity = String(0.4 + Math.random() * 0.5);
    heart.style.animationDuration = `${duration}s`;

    dom.heartField.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000 + 200);
  }

  function initHeartField() {
    if (!dom.heartField || prefersReducedMotion) return;
    setInterval(spawnFloatingHeart, 900);
  }

  function initSparkles() {
    if (!dom.sparkleCanvas || prefersReducedMotion) return;

    const canvas = dom.sparkleCanvas;
    const ctx = canvas.getContext("2d");
    let sparkles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function seedSparkles() {
      const count = Math.round((canvas.width * canvas.height) / 60000);
      sparkles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 0.6 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.02,
      }));
    }

    function draw(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

      sparkles.forEach((s) => {
        const twinkle = (Math.sin(time * s.speed + s.phase) + 1) / 2;
        ctx.globalAlpha = 0.15 + twinkle * 0.5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", () => {
      resize();
      seedSparkles();
    });

    resize();
    seedSparkles();
    requestAnimationFrame(draw);
  }

  /* ============================================================
     3. HEART BUTTON — burst effect + secret unlock
     ============================================================ */
  let heartClickCount = 0;
  const SECRET_CLICK_THRESHOLD = 5;

  function burstHeartsFrom(originEl) {
    const rect = originEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < 18; i++) {
      const heart = document.createElement("span");
      heart.textContent = "💖";
      heart.setAttribute("aria-hidden", "true");
      heart.style.cssText = `
        position: fixed;
        left: ${originX}px;
        top: ${originY}px;
        font-size: ${16 + Math.random() * 10}px;
        pointer-events: none;
        z-index: 40;
        transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.1s ease-out;
      `;
      document.body.appendChild(heart);

      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 220;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      requestAnimationFrame(() => {
        heart.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
        heart.style.opacity = "0";
      });

      setTimeout(() => heart.remove(), 1200);
    }
  }

  function handleHeartClick() {
    burstHeartsFrom(dom.heartButton);

    heartClickCount += 1;
    if (heartClickCount === SECRET_CLICK_THRESHOLD) {
      openPopup(dom.secretPopup);
    }
  }

  /* ============================================================
     4. RUNAWAY "NO" BUTTON
     ============================================================ */
  const RUNAWAY_MARGIN = 16;

  function fleeToRandomSpot() {
    const btn = dom.noButton;
    const width = btn.offsetWidth || 120;
    const height = btn.offsetHeight || 48;

    const maxX = Math.max(RUNAWAY_MARGIN, window.innerWidth - width - RUNAWAY_MARGIN);
    const maxY = Math.max(RUNAWAY_MARGIN, window.innerHeight - height - RUNAWAY_MARGIN);

    const nextX = RUNAWAY_MARGIN + Math.random() * (maxX - RUNAWAY_MARGIN);
    const nextY = RUNAWAY_MARGIN + Math.random() * (maxY - RUNAWAY_MARGIN);

    // Once "fleeing" the button is fixed-position, so the translate is
    // relative to its own top-left resting spot (0,0 offset via left/top reset).
    if (!btn.classList.contains("is-fleeing")) {
      const rect = btn.getBoundingClientRect();
      btn.style.left = `${rect.left}px`;
      btn.style.top = `${rect.top}px`;
      btn.style.transform = "translate(0, 0)";
      btn.classList.add("is-fleeing");
    }

    btn.style.left = `${nextX}px`;
    btn.style.top = `${nextY}px`;
    btn.style.transform = "translate(0, 0)";
  }

  function initRunawayButton() {
    if (!dom.noButton) return;

    dom.noButton.addEventListener("mouseenter", fleeToRandomSpot);
    dom.noButton.addEventListener(
      "touchstart",
      (event) => {
        event.preventDefault();
        fleeToRandomSpot();
      },
      { passive: false }
    );

    // Keep the button reachable if the viewport is resized after it fled.
    window.addEventListener("resize", () => {
      if (dom.noButton.classList.contains("is-fleeing")) {
        fleeToRandomSpot();
      }
    });
  }

  /* ============================================================
     5. FORGIVE BUTTON → PAGE TRANSITION
     ============================================================ */
  function showCelebrationPage() {
    const from = dom.apologyPage;
    const to = dom.celebrationPage;

    const finishTransition = () => {
      from.hidden = true;
      from.classList.add("is-hidden");
      from.classList.remove("is-fading-out");

      to.hidden = false;
      to.classList.remove("is-hidden");
      to.classList.add("is-fading-in");

      launchConfetti();
      launchFireworks();
      launchBalloons();
    };

    if (prefersReducedMotion) {
      finishTransition();
      return;
    }

    from.classList.add("is-fading-out");
    from.addEventListener("animationend", finishTransition, { once: true });
  }

  /* ============================================================
     6. CELEBRATION EFFECTS
     ============================================================ */
  function launchConfetti() {
    if (prefersReducedMotion) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:15;";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#e8628c", "#ffb4cd", "#b39ce8", "#ffffff", "#ffd9e6"];
    const pieces = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      r: 4 + Math.random() * 6,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      spin: Math.random() * Math.PI,
      spinSpeed: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let elapsed = 0;
    const durationMs = 6000;

    function tick() {
      elapsed += 16;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.spin += p.spinSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx.restore();
      });

      if (elapsed < durationMs) {
        requestAnimationFrame(tick);
      } else {
        canvas.remove();
      }
    }

    requestAnimationFrame(tick);
  }

  function launchFireworks() {
    if (!dom.fireworks || prefersReducedMotion) return;

    function burst() {
      const originX = 15 + Math.random() * 70;
      const originY = 15 + Math.random() * 40;
      const colors = ["#e8628c", "#ffb4cd", "#b39ce8", "#ffd9e6"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      for (let i = 0; i < 14; i++) {
        const spark = document.createElement("span");
        spark.style.cssText = `
          position: absolute;
          left: ${originX}%;
          top: ${originY}%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${color};
          transition: transform 0.9s ease-out, opacity 0.9s ease-out;
        `;
        dom.fireworks.appendChild(spark);

        const angle = (Math.PI * 2 * i) / 14;
        const distance = 60 + Math.random() * 40;

        requestAnimationFrame(() => {
          spark.style.transform = `translate(${Math.cos(angle) * distance}px, ${
            Math.sin(angle) * distance
          }px)`;
          spark.style.opacity = "0";
        });

        setTimeout(() => spark.remove(), 950);
      }
    }

    burst();
    const interval = setInterval(burst, 700);
    setTimeout(() => clearInterval(interval), 5000);
  }

  function launchBalloons() {
    if (!dom.balloons || prefersReducedMotion) return;

    for (let i = 0; i < 8; i++) {
      const balloon = document.createElement("span");
      balloon.textContent = "🎈";
      balloon.style.cssText = `
        position: absolute;
        left: ${Math.random() * 90}%;
        bottom: -60px;
        font-size: ${28 + Math.random() * 16}px;
        filter: hue-rotate(${Math.random() * 30}deg);
        animation: floatUp ${8 + Math.random() * 4}s ease-in forwards;
        animation-delay: ${i * 0.3}s;
      `;
      dom.balloons.appendChild(balloon);
      setTimeout(() => balloon.remove(), 13000);
    }
  }

  /* ============================================================
     7. SECRET POPUP
     ============================================================ */
  function openPopup(popupEl) {
    popupEl.hidden = false;
    popupEl.classList.remove("is-hidden");
  }

  function closePopup(popupEl) {
    popupEl.hidden = true;
    popupEl.classList.add("is-hidden");
  }

  function initPopup() {
    if (!dom.closePopupButton || !dom.secretPopup) return;
    dom.closePopupButton.addEventListener("click", () =>
      closePopup(dom.secretPopup)
    );

    dom.secretPopup.addEventListener("click", (event) => {
      if (event.target === dom.secretPopup) closePopup(dom.secretPopup);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !dom.secretPopup.hidden) {
        closePopup(dom.secretPopup);
      }
    });
  }

  /* ============================================================
     8. MUSIC TOGGLE (optional — hidden if music.mp3 is missing)
     ============================================================ */
  function initMusic() {
    const { bgMusic, musicToggle } = dom;
    if (!bgMusic || !musicToggle) return;

    // Only reveal the control once we know the track can actually load.
    bgMusic.addEventListener("canplaythrough", () => {
      musicToggle.hidden = false;
    });
    bgMusic.addEventListener("error", () => {
      musicToggle.hidden = true;
    });

    musicToggle.addEventListener("click", () => {
      const isPlaying = !bgMusic.paused;

      if (isPlaying) {
        bgMusic.pause();
        musicToggle.setAttribute("aria-pressed", "false");
        musicToggle.setAttribute("aria-label", "Play background music");
      } else {
        bgMusic.play().catch(() => {
          musicToggle.hidden = true;
        });
        musicToggle.setAttribute("aria-pressed", "true");
        musicToggle.setAttribute("aria-label", "Pause background music");
      }
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    initHeartField();
    initSparkles();
    initRunawayButton();
    initPopup();
    initMusic();

    dom.heartButton?.addEventListener("click", handleHeartClick);
    dom.forgiveButton?.addEventListener("click", showCelebrationPage);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
