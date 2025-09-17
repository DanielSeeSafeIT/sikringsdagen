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

  // --- Helper: generér Krak rute-URL ud fra lat/lng (+ valgfrit navn) ---
  function buildKrakRouteUrl(lat, lng, name = "", zoom = 17) {
    const encName = name
      ? "," + encodeURIComponent(encodeURIComponent(name))
      : "";
    // rs = ;<lat>,<lng>,<navn>,,geo
    const rs = `;${lat},${lng}${encName},,geo`;
    const c = `${lat},${lng}`;
    return `https://www.krak.dk/kort/ruteplan?rs=${rs}&c=${c}&z=${zoom}`;
  }

  // 2) Init kort
  const map = L.map("map").setView(coords, 15);

  // 3) Tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  }).addTo(map);

  // 4) Marker
  const marker = L.marker(coords).addTo(map);

  // 5) Rutevejledning (opdateret til mobil)
  function openDirections() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isMobile = isAndroid || isIOS;

    let url;
    if (isIOS) {
      // Stabilt Apple Maps deep link
      url = `https://maps.apple.com/?daddr=${encodeURIComponent(
        address
      )}&dirflg=d`;
    } else if (isAndroid) {
      // Google Maps – åbner app hvis muligt
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    } else {
      // Desktop → Krak
      url = buildKrakRouteUrl(lat, lng, "See Safe Aps", 17);
    }

    if (isMobile) {
      // Mobil: brug direkte navigation (undgår about:blank/pop-ups)
      window.location.href = url;
    } else {
      // Desktop: ny fane er fint
      window.open(url, "_blank", "noopener");
    }
  }

  // 6) Bind klik + popup (uændret, men med Enter-accessibility)
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
