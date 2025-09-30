// =====================
// Burger / mobile menu
// =====================
const burger = document.querySelector(".burger");
const mobile = document.getElementById("mobileMenu");

burger?.addEventListener("click", () => {
  const open = mobile?.hasAttribute("hidden") ? false : true;
  if (open) {
    mobile?.setAttribute("hidden", "");
    burger.setAttribute("aria-expanded", "false");
  } else {
    mobile?.removeAttribute("hidden");
    burger.setAttribute("aria-expanded", "true");
  }
});

// =====================
// Smooth anchor scroll
// =====================
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id && id.length > 1) {
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 70,
          behavior: reduceMotion ? "auto" : "smooth",
        });
        mobile?.setAttribute("hidden", "");
        burger?.setAttribute("aria-expanded", "false");
      }
    }
  });
});

// =====================
// Current year in footer
// =====================
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// =====================
// Leaflet map (contact)
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const mapEl = document.getElementById("map");
  if (!mapEl) return; // Kun på kontaktsiden

  // 1) Koordinater & adresse
  const coords = [55.2395, 11.7612]; // Lunavej 6, 4700 Næstved
  const address = "Lunavej 6, 4700 Næstved";
  const [lat, lng] = coords;

  function buildKrakRouteUrl(lat, lng, name = "", zoom = 17) {
    const encName = name
      ? "," + encodeURIComponent(encodeURIComponent(name))
      : "";
    const rs = `;${lat},${lng}${encName},,geo`;
    const c = `${lat},${lng}`;
    return `https://www.krak.dk/kort/ruteplan?rs=${rs}&c=${c}&z=${zoom}`;
  }

  const map = L.map("map").setView(coords, 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  }).addTo(map);

  const marker = L.marker(coords).addTo(map);

  function openDirections() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isMobile = isAndroid || isIOS;

    let url;
    if (isIOS) {
      url = `https://maps.apple.com/?daddr=${encodeURIComponent(
        address
      )}&dirflg=d`;
    } else if (isAndroid) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    } else {
      url = buildKrakRouteUrl(lat, lng, "See Safe Aps", 17);
    }

    if (isMobile) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener");
    }
  }

  marker.on("click", openDirections);
  marker.on("keypress", (e) => {
    if (e.originalEvent && e.originalEvent.key === "Enter") openDirections();
  });
  marker.bindPopup(
    `<b>SeeSafe</b><br>${address}<br><a href="#" id="routeLink">Åbn rutevejledning</a>`
  );

  map.on("popupopen", () => {
    const a = document.getElementById("routeLink");
    if (a) {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        openDirections();
      });
    }
  });
});

// =====================
// Fade navbar ved scroll
// =====================
const SCROLL_THRESHOLD = 50; // px – justér hvis du vil
function updateTopbarOpacity() {
  document.body.classList.toggle("scrolled", window.scrollY > SCROLL_THRESHOLD);
}
// kør ved load (så det også virker hvis man refresher midt på siden) og ved scroll
updateTopbarOpacity();
window.addEventListener("scroll", updateTopbarOpacity, { passive: true });

// =====================
// Tilmeldingsformular (POST til PHP)
// =====================
const signupForm = document.getElementById('signup');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = signupForm.querySelector('button[type="submit"]');
    const out = document.getElementById('resultat');
    btn.disabled = true; out.textContent = 'Sender...';

    try {
      const res = await fetch(signupForm.action, {
        method: 'POST',
        body: new FormData(signupForm)
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        out.textContent = 'Tak for din tilmelding! Tjek din e-mail for bekræftelse.';
        signupForm.reset();
      } else {
        out.textContent = 'Kunne ikke sende. ' + (json.error || 'Prøv igen senere.');
      }
    } catch (err) {
      out.textContent = 'Netværksfejl. Prøv igen.';
    } finally {
      btn.disabled = false;
    }
  });
}
