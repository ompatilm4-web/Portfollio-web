// ============================================================
// Om Patil — portfolio interactivity
// ============================================================

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Hero "typing" query effect ---------- */
(function heroTyping() {
  const typeEl = document.getElementById("typeText");
  const resultEl = document.getElementById("consoleResult");
  if (!typeEl || !resultEl) return;

  const phrase = "-- running query...";

  if (prefersReducedMotion) {
    typeEl.textContent = phrase;
    resultEl.classList.add("is-visible");
    resultEl.removeAttribute("aria-hidden");
    return;
  }

  let i = 0;
  function type() {
    if (i <= phrase.length) {
      typeEl.textContent = phrase.slice(0, i);
      i++;
      setTimeout(type, 28);
    } else {
      setTimeout(() => {
        resultEl.classList.add("is-visible");
        resultEl.removeAttribute("aria-hidden");
      }, 260);
    }
  }
  setTimeout(type, 500);
})();

/* ---------- 2. Active tab highlighting via scroll position ---------- */
(function tabHighlighting() {
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const sections = tabs
    .map((tab) => document.getElementById(tab.dataset.tab))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (id) => {
    tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === id));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
})();

/* ---------- 3. Generic scroll reveal for cards / blocks / log rows ---------- */
(function scrollReveal() {
  const targets = document.querySelectorAll(
    ".card, .req-block, .log__row, .doc-block, .req-bar"
  );
  if (!targets.length) return;

  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  targets.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(14px)";
    el.style.transition = "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)";
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
})();

/* ---------- 4. Contact form -> POST /api/contact ---------- */
(function contactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const submitLabel = document.getElementById("submitLabel");
  const responsePanel = document.getElementById("responsePanel");
  const responseStatus = document.getElementById("responseStatus");
  const responseBody = document.getElementById("responseBody");

  const fields = ["name", "email", "message"];

  function clearErrors() {
    fields.forEach((f) => {
      const el = document.getElementById(`err-${f}`);
      if (el) el.textContent = "";
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const payload = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      message: document.getElementById("message").value.trim(),
    };

    submitBtn.disabled = true;
    submitLabel.textContent = "Sending...";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      responsePanel.hidden = false;

      if (res.ok && data.ok) {
        responseStatus.textContent = "200 OK";
        responseStatus.className = "response-panel__status ok";
        responseBody.textContent = data.message;
        form.reset();
      } else {
        responseStatus.textContent = `${res.status} Bad Request`;
        responseStatus.className = "response-panel__status err";
        responseBody.textContent = JSON.stringify(data.errors || data, null, 2);

        if (data.errors) {
          Object.entries(data.errors).forEach(([field, msg]) => {
            const el = document.getElementById(`err-${field}`);
            if (el) el.textContent = msg;
          });
        }
      }
    } catch (err) {
      responsePanel.hidden = false;
      responseStatus.textContent = "Network error";
      responseStatus.className = "response-panel__status err";
      responseBody.textContent = "Could not reach the server. Please try again in a moment.";
    } finally {
      submitBtn.disabled = false;
      submitLabel.textContent = "Send request →";
    }
  });
})();
