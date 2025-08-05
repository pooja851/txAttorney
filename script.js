document.addEventListener("DOMContentLoaded", () => {
  // Modular Vertical Scroller Class
  class VerticalScroller {
    constructor(selector, options = {}) {
      this.elements = typeof selector === 'string'
          ? document.querySelectorAll(selector)
          : [selector].filter(Boolean);

      this.options = {
        speed: options.speed || 1,
        direction: options.direction || 1, // 1 for down, -1 for up
        delay: options.delay || 2000,
        pauseOnHover: options.pauseOnHover !== false,
        pauseOnParentHover: options.pauseOnParentHover !== false,
        hideScrollbar: options.hideScrollbar !== false,
        ...options
      };

      this.scrollers = [];
      this.init();
    }

    init() {
      if (!this.elements.length) {
        console.warn('VerticalScroller: No elements found for selector');
        return;
      }

      this.elements.forEach((element, index) => {
        if (!element) return;

        const scroller = {
          element,
          direction: this.options.direction,
          isPaused: false,
          animationId: null,
          hoverElements: []
        };

        // Setup scrollbar hiding
        if (this.options.hideScrollbar) {
          this.hideScrollbar(element);
        }

        // Setup hover listeners
        if (this.options.pauseOnHover || this.options.pauseOnParentHover) {
          this.setupHoverListeners(scroller);
        }

        this.scrollers.push(scroller);
      });

      // Start scrolling after delay
      setTimeout(() => this.startAll(), this.options.delay);
    }

    hideScrollbar(element) {
      element.style.overflowY = 'auto';
      element.style.scrollbarWidth = 'none';
      element.style.msOverflowStyle = 'none';

      // Add webkit scrollbar hiding
      const id = `scroller-${Math.random().toString(36).substr(2, 9)}`;
      element.classList.add(id);

      if (!document.querySelector('#vertical-scroller-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'vertical-scroller-styles';
        document.head.appendChild(styleSheet);
      }

      const styles = document.querySelector('#vertical-scroller-styles');
      styles.textContent += `
        .${id}::-webkit-scrollbar {
          display: none;
        }
      `;
    }

    setupHoverListeners(scroller) {
      const hoverElements = [];

      if (this.options.pauseOnHover) {
        hoverElements.push(scroller.element);
      }

      if (this.options.pauseOnParentHover && scroller.element.parentElement) {
        hoverElements.push(scroller.element.parentElement);
      }

      // Add any custom hover elements
      if (this.options.additionalHoverElements) {
        const additionalElements = document.querySelectorAll(this.options.additionalHoverElements);
        hoverElements.push(...additionalElements);
      }

      scroller.hoverElements = hoverElements;

      hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => this.pause(scroller));
        element.addEventListener('mouseleave', () => this.resume(scroller));
      });
    }

    startAll() {
      this.scrollers.forEach(scroller => this.start(scroller));
    }

    start(scroller) {
      scroller.isPaused = false;
      this.animate(scroller);
    }

    pause(scroller) {
      scroller.isPaused = true;
      if (scroller.animationId) {
        cancelAnimationFrame(scroller.animationId);
        scroller.animationId = null;
      }
    }

    resume(scroller) {
      if (!scroller.isPaused) return;
      scroller.isPaused = false;
      this.animate(scroller);
    }

    pauseAll() {
      this.scrollers.forEach(scroller => this.pause(scroller));
    }

    resumeAll() {
      this.scrollers.forEach(scroller => this.resume(scroller));
    }

    animate(scroller) {
      if (scroller.isPaused) return;

      const { element, direction } = scroller;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;

      if (scrollHeight > clientHeight) {
        element.scrollTop += direction * this.options.speed;

        // Reverse direction at boundaries
        if (element.scrollTop >= scrollHeight - clientHeight) {
          scroller.direction = -1;
        } else if (element.scrollTop <= 0) {
          scroller.direction = 1;
        }
      }

      scroller.animationId = requestAnimationFrame(() => this.animate(scroller));
    }

    updateSpeed(newSpeed) {
      this.options.speed = newSpeed;
    }

    destroy() {
      this.scrollers.forEach(scroller => {
        this.pause(scroller);

        // Remove hover listeners
        scroller.hoverElements.forEach(element => {
          element.removeEventListener('mouseenter', () => this.pause(scroller));
          element.removeEventListener('mouseleave', () => this.resume(scroller));
        });
      });

      this.scrollers = [];
    }
  }

  // Cache DOM elements
  const elements = {
    pages: document.querySelectorAll(".page-section"),
    navButtons: document.querySelectorAll(".nav-btn"),
    cityCards: document.querySelectorAll(".city-card"),
    adBanners: document.querySelectorAll(".ad-banner"),
    injuryIcons: document.querySelectorAll(".injury-icon"),
    header: document.querySelector(".header"),
    tagline: document.querySelector(".tagline"),
    contactForm: document.querySelector(".contact-form")
  };

  // Initialize sidebar scrolling with the new modular system
  // Only pause on hover of the sidebar itself, not parent
  const leftSidebarScroller = new VerticalScroller('.left-sidebar', {
    speed: 3,
    direction: 1,
    delay: 2000,
    pauseOnHover: true,
    pauseOnParentHover: false // Changed to false
  });

  const rightSidebarScroller = new VerticalScroller('.right-sidebar', {
    speed: 3,
    direction: -1, // Start scrolling up
    delay: 2000,
    pauseOnHover: true,
    pauseOnParentHover: false // Changed to false
  });

  // Page navigation system
  const pageManager = {
    currentPage: "landing-page",

    show(pageId) {
      elements.pages.forEach(page => page.style.display = "none");

      const targetPage = document.getElementById(pageId);
      if (targetPage) {
        targetPage.style.display = "block";
        this.currentPage = pageId;
        this.updateNavigation(pageId);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },

    updateNavigation(pageId) {
      elements.navButtons.forEach(btn => btn.classList.remove("active"));

      const pageMap = {
        "landing-page": 0,
        "contact-page": 1,
        "about-page": 2
      };

      if (pageId in pageMap) {
        elements.navButtons[pageMap[pageId]]?.classList.add("active");
      }
    }
  };

  // Global navigation functions
  window.showPage = pageId => pageManager.show(pageId);
  window.showAttorneyProfile = name => pageManager.show(`attorney-profile-${name}-page`);
  window.showLocationPage = location => pageManager.show(`location-${location}-page`);
  window.showDirectoryPage = city => pageManager.show(`directory-${city}-page`);

  // Navigation button handlers
  const navPages = ["landing-page", "contact-page", "about-page"];
  elements.navButtons.forEach((button, index) => {
    button.addEventListener("click", () => window.showPage(navPages[index]));
  });

  // City card handlers
  elements.cityCards.forEach(card => {
    card.addEventListener("click", function() {
      const cityName = this.dataset.city;

      elements.cityCards.forEach(c => {
        c.style.background = "rgba(255, 255, 255, 0.8)";
        c.style.border = "none";
      });

      this.style.background = "rgba(41, 128, 185, 0.1)";
      this.style.border = "2px solid #2980b9";

      setTimeout(() => window.showDirectoryPage(cityName), 500);
    });
  });

  // Ad banner click handlers
  const attorneyMap = {
    "amaro": "amaro",
    "hadi-law": "handi",
    "push-win": "pusch",
    "christian-texas": "simmons",
    "miller-law": "miller",
    "pettit-law": "pettit",
    "stand-law": "stano",
    "zeni": "zehlo",
    "ramji": "ramji",
    "jim-adler": "jim-adler",
    "brian-white": "brian-white",
    "pacht-nichols": "pacht-nichols"
  };

  elements.adBanners.forEach(banner => {
    banner.addEventListener("click", function() {
      for (const [className, attorneyName] of Object.entries(attorneyMap)) {
        if (this.classList.contains(className)) {
          window.showAttorneyProfile(attorneyName);
          break;
        }
      }
    });
  });

  // Injury icon handlers
  elements.injuryIcons.forEach(icon => {
    icon.addEventListener("click", function() {
      const injuryType = this.querySelector("span").textContent;
      console.log(`Injury type selected: ${injuryType}`);
      window.showDirectoryPage("houston");
    });
  });

 

  // Parallax effect
  let ticking = false;
  function updateParallax() {
    if (elements.header) {
      const scrolled = window.pageYOffset;
      elements.header.style.transform = `translateY(${scrolled * -0.1}px)`;
    }
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });

  // Typing animation
  function typeWriter(element, text, speed = 80) {
    if (!element) return;

    let i = 0;
    element.textContent = "";

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }

    type();
  }

  if (elements.tagline) {
    const originalText = elements.tagline.textContent;
    setTimeout(() => typeWriter(elements.tagline, originalText), 1000);
  }

  // Ripple effect
  function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement("span");

    ripple.classList.add("ripple");

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";

    button.style.position = "relative";
    button.style.overflow = "hidden";
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  // Apply ripple effect
  const clickableElements = document.querySelectorAll(
      ".city-card, .ad-banner, .injury-icon, .attorney-card, .back-link"
  );

  clickableElements.forEach(element => {
    element.addEventListener("click", createRipple);
  });

  // Scroll to top button
  const scrollBtn = document.createElement("button");
  scrollBtn.innerHTML = "↑";
  scrollBtn.className = "scroll-to-top";
  scrollBtn.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #2980b9;
    color: white;
    border: none;
    font-size: 20px;
    cursor: pointer;
    z-index: 999;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  document.body.appendChild(scrollBtn);

  window.addEventListener("scroll", () => {
    scrollBtn.style.opacity = window.pageYOffset > 300 ? "1" : "0";
  });

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Contact form handler
  if (elements.contactForm) {
    elements.contactForm.addEventListener("submit", function(e) {
      e.preventDefault();
      alert("Thank you for your message! We will contact you soon.");
      this.reset();
    });
  }

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    }
    
    .page-section {
      transition: opacity 0.5s ease-in-out;
    }
    
    .city-card, .ad-banner {
      transition: transform 0.3s ease, background 0.3s ease, border 0.3s ease;
    }
    
    .city-card:hover {
      transform: translateY(-5px) scale(1.02);
    }
  `;
  document.head.appendChild(style);

  // Export VerticalScroller for global use
  window.VerticalScroller = VerticalScroller;
});