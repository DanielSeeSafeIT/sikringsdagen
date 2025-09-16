// Mobile menu toggle
const burger = document.querySelector(".burger");
const mobile = document.getElementById("mobileMenu");
burger?.addEventListener("click", () => {
  const open = mobile.hasAttribute("hidden") ? false : true;
  if (open) {
    mobile.setAttribute("hidden", "");
    burger.setAttribute("aria-expanded", "false");
  } else {
    mobile.removeAttribute("hidden");
    burger.setAttribute("aria-expanded", "true");
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id && id.length > 1) {
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 70,
          behavior: "smooth",
        });
        mobile?.setAttribute("hidden", "");
        burger?.setAttribute("aria-expanded", "false");
      }
    }
  });
});

// Current year
document.getElementById("year").textContent = new Date().getFullYear();
