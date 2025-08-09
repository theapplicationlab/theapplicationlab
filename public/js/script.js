// main author repo: https://github.com/justinribeiro/youtube-lite
// modified by: https://github.com/gethugothemes

class LiteYTEmbed extends HTMLElement {
  constructor() {
    super();
    this.isIframeLoaded = false;
    this.setupDom();
  }
  static get observedAttributes() {
    return ["videoid", "playlistid"];
  }
  connectedCallback() {
    this.addEventListener("pointerover", LiteYTEmbed.warmConnections, {
      once: true,
    });
    this.addEventListener("click", () => this.addIframe());
  }
  get videoId() {
    return encodeURIComponent(this.getAttribute("videoid") || "");
  }
  set videoId(id) {
    this.setAttribute("videoid", id);
  }
  get playlistId() {
    return encodeURIComponent(this.getAttribute("playlistid") || "");
  }
  set playlistId(id) {
    this.setAttribute("playlistid", id);
  }
  get videoTitle() {
    return this.getAttribute("videotitle") || "Video";
  }
  set videoTitle(title) {
    this.setAttribute("videotitle", title);
  }
  get videoPlay() {
    return this.getAttribute("videoPlay") || "Play";
  }
  set videoPlay(name) {
    this.setAttribute("videoPlay", name);
  }
  get videoStartAt() {
    return Number(this.getAttribute("videoStartAt") || "0");
  }
  set videoStartAt(time) {
    this.setAttribute("videoStartAt", String(time));
  }
  get autoLoad() {
    return this.hasAttribute("autoload");
  }
  get noCookie() {
    return this.hasAttribute("nocookie");
  }
  get posterQuality() {
    return this.getAttribute("posterquality") || "hqdefault";
  }
  get posterLoading() {
    return this.getAttribute("posterloading") || "lazy";
  }
  get params() {
    return `start=${this.videoStartAt}&${this.getAttribute("params")}`;
  }
  setupDom() {
    const shadowDom = this.attachShadow({ mode: "open" });
    shadowDom.innerHTML = `
    <style>
      :host {
        contain: content;
        display: block;
        position: relative;
        width: 100%;
        padding-bottom: calc(100% / (16 / 9));
        --lyt-animation: all 0.2s cubic-bezier(0, 0, 0.2, 1);
        --lyt-play-btn-default: #212121;
        --lyt-play-btn-hover: #f00;
      }

      #frame, #fallbackPlaceholder, iframe {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top:0;
      }

      #frame {
        cursor: pointer;
      }

      #fallbackPlaceholder {
        object-fit: cover;
      }

      #frame::before {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        background-image: linear-gradient(180deg, #111 -20%, transparent 90%);
        height: 60px;
        width: 100%;
        transition: var(--lyt-animation);
        z-index: 1;
      }

      #playButton {
        width: 70px;
        height: 46px;
        z-index: 1;
        opacity: 0.9;
        border-radius: 14%;
        transition: var(--lyt-animation);
        border: 0;
        cursor:pointer;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='100%25' version='1.1' viewBox='0 0 68 48' width='100%25'%3E%3Cpath class='ytp-large-play-button-bg' d='M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z' fill='%23f00'%3E%3C/path%3E%3Cpath d='M 45,24 27,14 27,34' fill='%23fff'%3E%3C/path%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
        filter: grayscale(1);
        background-color: transparent !important;
      }

      #frame:hover > #playButton {
        opacity: 1;
        filter: grayscale(0);
      }

      #playButton {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate3d(-50%, -50%, 0);
      }

      /* Post-click styles */
      .activated {
        cursor: unset;
      }

      #frame.activated::before,
      #frame.activated > #playButton {
        display: none;
      }
    </style>
    <div id="frame">
      <picture>
        <source id="webpPlaceholder" type="image/webp">
        <source id="jpegPlaceholder" type="image/jpeg">
        <img id="fallbackPlaceholder" referrerpolicy="origin">
      </picture>
      <button id="playButton"></button>
    </div>
  `;
    this.domRefFrame = shadowDom.querySelector("#frame");
    this.domRefImg = {
      fallback: shadowDom.querySelector("#fallbackPlaceholder"),
      webp: shadowDom.querySelector("#webpPlaceholder"),
      jpeg: shadowDom.querySelector("#jpegPlaceholder"),
    };
    this.domRefPlayButton = shadowDom.querySelector("#playButton");
  }
  setupComponent() {
    this.initImagePlaceholder();
    this.domRefPlayButton.setAttribute(
      "aria-label",
      `${this.videoPlay}: ${this.videoTitle}`
    );
    this.setAttribute("title", `${this.videoPlay}: ${this.videoTitle}`);
    if (this.autoLoad) {
      this.initIntersectionObserver();
    }
  }
  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case "videoid":
      case "playlistid": {
        if (oldVal !== newVal) {
          this.setupComponent();
          if (this.domRefFrame.classList.contains("activated")) {
            this.domRefFrame.classList.remove("activated");
            this.shadowRoot.querySelector("iframe").remove();
            this.isIframeLoaded = false;
          }
        }
        break;
      }
      default:
        break;
    }
  }
  addIframe(isIntersectionObserver = false) {
    if (!this.isIframeLoaded) {
      const autoplay = isIntersectionObserver ? 0 : 1;
      const wantsNoCookie = this.noCookie ? "-nocookie" : "";
      let embedTarget;
      if (this.playlistId) {
        embedTarget = `?listType=playlist&list=${this.playlistId}&`;
      } else {
        embedTarget = `${this.videoId}?`;
      }
      const iframeHTML = `
      <iframe frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
      src="https://www.youtube${wantsNoCookie}.com/embed/${embedTarget}rel=0&autoplay=${autoplay}&${this.params}"
      ></iframe>`;
      this.domRefFrame.insertAdjacentHTML("beforeend", iframeHTML);
      this.domRefFrame.classList.add("activated");
      this.isIframeLoaded = true;
      this.dispatchEvent(
        new CustomEvent("liteYoutubeIframeLoaded", {
          detail: {
            videoId: this.videoId,
          },
          bubbles: true,
          cancelable: true,
        })
      );
    }
  }
  initImagePlaceholder() {
    LiteYTEmbed.addPrefetch("preconnect", "https://i.ytimg.com/");
    const posterUrlWebp = `https://i.ytimg.com/vi_webp/${this.videoId}/${this.posterQuality}.webp`;
    const posterUrlJpeg = `https://i.ytimg.com/vi/${this.videoId}/${this.posterQuality}.jpg`;
    this.domRefImg.fallback.loading = this.posterLoading;
    this.domRefImg.webp.srcset = posterUrlWebp;
    this.domRefImg.jpeg.srcset = posterUrlJpeg;
    this.domRefImg.fallback.src = posterUrlJpeg;
    this.domRefImg.fallback.setAttribute(
      "aria-label",
      `${this.videoPlay}: ${this.videoTitle}`
    );
    this.domRefImg?.fallback?.setAttribute(
      "alt",
      `${this.videoPlay}: ${this.videoTitle}`
    );
  }
  initIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    };
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.isIframeLoaded) {
          LiteYTEmbed.warmConnections();
          this.addIframe(true);
          observer.unobserve(this);
        }
      });
    }, options);
    observer.observe(this);
  }
  static addPrefetch(kind, url, as) {
    const linkElem = document.createElement("link");
    linkElem.rel = kind;
    linkElem.href = url;
    if (as) {
      linkElem.as = as;
    }
    linkElem.crossOrigin = "true";
    document.head.append(linkElem);
  }
  static warmConnections() {
    if (LiteYTEmbed.isPreconnected) return;
    LiteYTEmbed.addPrefetch("preconnect", "https://s.ytimg.com");
    LiteYTEmbed.addPrefetch("preconnect", "https://www.youtube.com");
    LiteYTEmbed.addPrefetch("preconnect", "https://www.google.com");
    LiteYTEmbed.addPrefetch(
      "preconnect",
      "https://googleads.g.doubleclick.net"
    );
    LiteYTEmbed.addPrefetch("preconnect", "https://static.doubleclick.net");
    LiteYTEmbed.isPreconnected = true;
  }
}
LiteYTEmbed.isPreconnected = false;
customElements.define("youtube-lite", LiteYTEmbed);
;
/*!
 * Lazy Load - JavaScript plugin for lazy loading images
 *
 * Copyright (c) 2007-2019 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Original Plugin Source: https://appelsiini.net/projects/lazyload
 * Customize by: https://Gethugothemes.com
 *
 */

(function (root, factory) {
  if (typeof exports === "object") {
    module.exports = factory(root);
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.LazyLoad = factory(root);
  }
})(
  typeof global !== "undefined" ? global : this.window || this.global,
  function (root) {
    "use strict";

    if (typeof define === "function" && define.amd) {
      root = window;
    }

    const defaults = {
      src: "data-src",
      srcset: "data-srcset",
      selector: ".lazy",
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const extend = function () {
      let extended = {};
      let deep = false;
      let i = 0;
      let length = arguments.length;

      if (Object.prototype.toString.call(arguments[0]) === "[object Boolean]") {
        deep = arguments[0];
        i++;
      }

      let merge = function (obj) {
        for (let prop in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            if (
              deep &&
              Object.prototype.toString.call(obj[prop]) === "[object Object]"
            ) {
              extended[prop] = extend(true, extended[prop], obj[prop]);
            } else {
              extended[prop] = obj[prop];
            }
          }
        }
      };

      for (; i < length; i++) {
        let obj = arguments[i];
        merge(obj);
      }

      return extended;
    };

    function LazyLoad(images, options) {
      this.settings = extend(defaults, options || {});
      this.images = images || document.querySelectorAll(this.settings.selector);
      this.observer = null;
      this.init();
    }

    LazyLoad.prototype = {
      init: function () {
        if (!root.IntersectionObserver) {
          this.loadImages();
          return;
        }

        let self = this;
        let observerConfig = {
          root: this.settings.root,
          rootMargin: this.settings.rootMargin,
          threshold: [this.settings.threshold],
        };

        this.observer = new IntersectionObserver(function (entries) {
          Array.prototype.forEach.call(entries, function (entry) {
            if (entry.isIntersecting) {
              self.observer.unobserve(entry.target);
              let src = entry.target.getAttribute(self.settings.src);
              let srcset = entry.target.getAttribute(self.settings.srcset);
              if ("img" === entry.target.tagName.toLowerCase()) {
                if (src) {
                  entry.target.src = src;
                }
                if (srcset) {
                  entry.target.srcset = srcset;
                }
              } else {
                var newImage = new Image();
                newImage.src = src;
                newImage.onload = function () {
                  entry.target.style.backgroundImage =
                    "url(" + newImage.src + ")";
                };
              }
            }
          });
        }, observerConfig);

        Array.prototype.forEach.call(this.images, function (image) {
          self.observer.observe(image);
        });
      },

      loadAndDestroy: function () {
        if (!this.settings) {
          return;
        }
        this.loadImages();
        this.destroy();
      },

      loadImages: function () {
        if (!this.settings) {
          return;
        }

        let self = this;
        Array.prototype.forEach.call(this.images, function (image) {
          let src = image.getAttribute(self.settings.src);
          let srcset = image.getAttribute(self.settings.srcset);
          if ("img" === image.tagName.toLowerCase()) {
            if (src) {
              image.src = src;
            }
            if (srcset) {
              image.srcset = srcset;
            }
          } else {
            var newImage = new Image();
            newImage.src = src;
            newImage.onload = function () {
              image.style.backgroundImage = "url(" + newImage.src + ")";
            };
          }
        });
      },

      destroy: function () {
        if (!this.settings) {
          return;
        }
        this.observer.disconnect();
        this.settings = null;
      },
    };

    root.lazyload = function (images, options) {
      return new LazyLoad(images, options);
    };

    if (root.jQuery) {
      const $ = root.jQuery;
      $.fn.lazyload = function (options) {
        options = options || {};
        options.attribute = options.attribute || "data-src";
        new LazyLoad($.makeArray(this), options);
        return this;
      };
    }

    return LazyLoad;
  }
);

lazyload();
;
// main script
(function () {
  "use strict";

  // --- Mobile Nav Toggle ---
  const body = document.body;
  const navToggler = document.getElementById("nav-toggler");
  const navOverlay = document.getElementById("mobile-nav-overlay");
  const navCloseBtn = document.getElementById("mobile-nav-close");

  const toggleNav = () => {
    body.classList.toggle("is-mobile-nav-open");
  };

  if (navToggler) {
    navToggler.addEventListener("click", toggleNav);
  }
  if (navOverlay) {
    navOverlay.addEventListener("click", toggleNav);
  }
  if (navCloseBtn) {
    navCloseBtn.addEventListener("click", toggleNav);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('is-mobile-nav-open')) {
      toggleNav();
    }
  });

  // --- Contribution Bubbles for Community Partners ---
  const initContributionBubbles = () => {
    const section = document.querySelector('.community-partners-section');
    const bubbleContainer = document.querySelector('.bubbles-container');
    if (!section || !bubbleContainer) return;

    const partnersWithContributions = Array.from(section.querySelectorAll('.partner-logo-link[data-contributions]'));
    if (partnersWithContributions.length === 0) return;

    // --- Logic for randomly appearing bubbles ---
    const MAX_BUBBLES = 3;
    const BUBBLE_LIFETIME = 4000;
    const BUBBLE_INTERVAL = 2000;

    let bubblePool = [];
    for (let i = 0; i < MAX_BUBBLES; i++) {
      let bubble = document.createElement('div');
      bubble.className = 'contribution-bubble';
      bubble.dataset.busy = 'false';
      bubbleContainer.appendChild(bubble);
      bubblePool.push(bubble);
    }
    let activeBubbles = new Map();

    const updateBubblePositions = () => {
      activeBubbles.forEach((bubble, partner) => {
        const partnerRect = partner.getBoundingClientRect();
        const containerRect = bubbleContainer.getBoundingClientRect();
        const left = partnerRect.left - containerRect.left + (partnerRect.width / 2) - (bubble.offsetWidth / 2);
        const top = partnerRect.top - containerRect.top - bubble.offsetHeight - 10;
        bubble.style.transform = `translate(${left}px, ${top}px)`;
      });
      requestAnimationFrame(updateBubblePositions);
    };
    requestAnimationFrame(updateBubblePositions);

    const showBubble = (partner) => {
      const bubble = bubblePool.find(b => b.dataset.busy === 'false');
      if (!bubble) return;
      bubble.dataset.busy = 'true';
      activeBubbles.set(partner, bubble);
      bubble.innerHTML = partner.dataset.contributions;
      bubble.classList.add('visible');
      setTimeout(() => hideBubble(partner, bubble), BUBBLE_LIFETIME);
    };

    const hideBubble = (partner, bubble) => {
      bubble.classList.remove('visible');
      activeBubbles.delete(partner);
      setTimeout(() => { bubble.dataset.busy = 'false'; }, 300);
    };

    // --- NEW: Hover-triggered bubble logic ---
    let hoverBubble = document.createElement('div');
    hoverBubble.className = 'contribution-bubble';
    bubbleContainer.appendChild(hoverBubble);
    let isHovering = false;

    partnersWithContributions.forEach(partner => {
      partner.addEventListener('mouseenter', () => {
        isHovering = true;
        // Hide any random bubbles that might be showing
        activeBubbles.forEach((bubble, p) => hideBubble(p, bubble));

        hoverBubble.innerHTML = partner.dataset.contributions;

        // Position calculation must happen *after* content is set
        const partnerRect = partner.getBoundingClientRect();
        const containerRect = bubbleContainer.getBoundingClientRect();
        const left = partnerRect.left - containerRect.left + (partnerRect.width / 2) - (hoverBubble.offsetWidth / 2);
        const top = partnerRect.top - containerRect.top - hoverBubble.offsetHeight - 10;

        hoverBubble.style.transform = `translate(${left}px, ${top}px)`;
        hoverBubble.classList.add('visible');
      });

      partner.addEventListener('mouseleave', () => {
        isHovering = false;
        hoverBubble.classList.remove('visible');
      });
    });

    // --- Modified interval for random bubbles ---
    setInterval(() => {
      // Pause random bubbles if user is hovering or max bubbles are already shown
      if (isHovering || activeBubbles.size >= MAX_BUBBLES) return;

      const rect = section.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom >= 0;

      if (isInView) {
        const availablePartners = partnersWithContributions.filter(p => {
          if (activeBubbles.has(p)) return false;
          const r = p.getBoundingClientRect();
          return r.left > 50 && r.right < window.innerWidth - 50;
        });

        if (availablePartners.length > 0) {
          const randomIndex = Math.floor(Math.random() * availablePartners.length);
          showBubble(availablePartners[randomIndex]);
        }
      }
    }, BUBBLE_INTERVAL);
  };


  // --- Copy Code Block ---
  const initCopyCodeButtons = () => {
    const codeBlocks = document.querySelectorAll('.code-block-wrapper');
    codeBlocks.forEach(wrapper => {
      const codeElement = wrapper.querySelector('pre > code');
      const button = wrapper.querySelector('.copy-code-button');

      if (codeElement && button) {
        button.addEventListener('click', () => {
          const textToCopy = codeElement.innerText;
          navigator.clipboard.writeText(textToCopy).then(() => {
            button.classList.add('copied');
            button.querySelector('.copy-text').classList.add('hidden');
            button.querySelector('.copied-text').classList.remove('hidden');

            setTimeout(() => {
              button.classList.remove('copied');
              button.querySelector('.copy-text').classList.remove('hidden');
              button.querySelector('.copied-text').add('hidden');
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy code to clipboard.');
          });
        });
      }
    });
  };

  // --- OG Image Assets Modal ---
  const initOgImageModal = () => {
    const modal = document.getElementById('og-image-modal');
    const modalContent = document.getElementById('og-modal-content');
    const closeBtn = document.getElementById('og-modal-close');
    if (!modal || !modalContent || !closeBtn) return;

    const showModal = () => {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    };

    const hideModal = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };

    closeBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideModal();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        hideModal();
      }
    });

    window.openOgModal = (imageUrls) => {
      modalContent.innerHTML = ''; // Clear previous content

      if (!imageUrls || imageUrls.length === 0) {
        modalContent.innerHTML = '<p class="text-center col-span-full">No social media assets found for this page.</p>';
      } else {
        imageUrls.forEach(img => {
          const cardHTML = `
            <div class="og-image-card text-center">
                <h4 class="font-semibold mb-2 text-sm">${img.label}</h4>
                <a href="${img.url}" download="${img.filename}" title="Download this image">
                    <img src="${img.url}" alt="OG Image Preview for ${img.label}" class="w-full rounded-md border border-border dark:border-darkmode-border shadow-md hover:shadow-lg transition-shadow">
                </a>
                <div class="mt-3">
                    <a href="${img.url}" download="${img.filename}" class="btn btn-sm btn-new-primary">
                        Download
                    </a>
                </div>
            </div>
          `;
          modalContent.insertAdjacentHTML('beforeend', cardHTML);
        });
      }
      showModal();
    };

    document.querySelectorAll('[data-og-assets]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const assetsJson = trigger.dataset.ogAssets;
        try {
          const assets = JSON.parse(assetsJson);
          window.openOgModal(assets);
        } catch (error) {
          console.error("Could not parse OG assets JSON:", error);
          window.openOgModal([]);
        }
      });
    });
  };

  // Wait for the DOM to be fully loaded to initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCopyCodeButtons();
      initOgImageModal();
      if (window.innerWidth > 768) { // Only run on larger screens
        initContributionBubbles();
      }
    });
  } else {
    initCopyCodeButtons();
    initOgImageModal();
    if (window.innerWidth > 768) { // Only run on larger screens
      initContributionBubbles();
    }
  }

})();
