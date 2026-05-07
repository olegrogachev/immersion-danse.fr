/* ─────────────────────────────────────────────
   VIEWER.JS — Chorégraphie du Bien-Être
   PDF Viewer · PDF.js lazy rendering
───────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── CONFIG ── */
  const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const DOC_MAP = {
    'programme':             { file: 'programme.pdf',               label: 'Programme du séjour' },
    'presentation':          { file: 'choreographie-bien-etre.pdf', label: 'Présentation' },
    'programme.pdf':         { file: 'programme.pdf',               label: 'Programme du séjour' },
    'choreographie-bien-etre.pdf': { file: 'choreographie-bien-etre.pdf', label: 'Présentation' },
  };

  /* ── STATE ── */
  let pdfDoc   = null;
  let totalPages = 0;
  let renderedPages = new Set();
  let rendering = new Set();
  let currentPage = 1;
  let scale = 1;
  let observer = null;

  /* ── DOM REFS ── */
  const loader       = document.getElementById('loader');
  const loaderBar    = document.getElementById('loader-bar');
  const loaderLabel  = document.getElementById('loader-label');
  const container    = document.getElementById('canvas-container');
  const viewerBody   = document.getElementById('viewer-body');
  const pageInd      = document.getElementById('page-indicator');
  const docTitle     = document.getElementById('doc-title');
  const btnDownload  = document.getElementById('btn-download');
  const btnBack      = document.getElementById('btn-back');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const scrollTop    = document.getElementById('scroll-top');
  const errorState   = document.getElementById('error-state');

  /* ── PARSE URL PARAMS ── */
  function getDocConfig() {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('file') || params.get('pdf') || 'programme';
    return DOC_MAP[key] || DOC_MAP['programme'];
  }

  /* ── COMPUTE SCALE ── */
  function computeScale(viewport) {
    const maxW = Math.min(window.innerWidth - 24, 900);
    return maxW / viewport.width;
  }

  /* ── RENDER ONE PAGE ── */
  async function renderPage(pageNum) {
    if (renderedPages.has(pageNum) || rendering.has(pageNum)) return;
    rendering.add(pageNum);

    const wrapper = document.getElementById(`page-wrapper-${pageNum}`);
    if (!wrapper) { rendering.delete(pageNum); return; }

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const ctx    = canvas.getContext('2d');
      const dpr    = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width  = Math.floor(viewport.width  * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width  = viewport.width  + 'px';
      canvas.style.height = viewport.height + 'px';

      // Remove skeleton placeholder
      wrapper.innerHTML = '';
      wrapper.appendChild(canvas);

      await page.render({ canvasContext: ctx, viewport, transform: [dpr, 0, 0, dpr, 0, 0] }).promise;

      renderedPages.add(pageNum);
      rendering.delete(pageNum);

      // Fade in
      requestAnimationFrame(() => wrapper.classList.add('visible'));
    } catch (err) {
      console.error('renderPage error', pageNum, err);
      rendering.delete(pageNum);
    }
  }

  /* ── SETUP INTERSECTION OBSERVER for lazy loading ── */
  function setupLazyLoad() {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const num = parseInt(entry.target.dataset.page, 10);
          renderPage(num);
          // Preload adjacent pages
          if (num > 1) renderPage(num - 1);
          if (num < totalPages) renderPage(num + 1);
        }
      });
    }, { root: viewerBody, rootMargin: '200px 0px', threshold: 0 });

    document.querySelectorAll('.pdf-page-wrapper').forEach(el => observer.observe(el));
  }

  /* ── TRACK CURRENT PAGE ── */
  function setupPageTracker() {
    const pageObserver = new IntersectionObserver((entries) => {
      let best = null, bestRatio = 0;
      entries.forEach(e => {
        if (e.intersectionRatio > bestRatio) {
          bestRatio = e.intersectionRatio;
          best = e.target;
        }
      });
      if (best) {
        currentPage = parseInt(best.dataset.page, 10);
        updatePageIndicator();
      }
    }, { root: viewerBody, threshold: [0.1, 0.5, 0.9] });

    document.querySelectorAll('.pdf-page-wrapper').forEach(el => pageObserver.observe(el));
  }

  function updatePageIndicator() {
    if (pageInd) pageInd.textContent = `${currentPage} / ${totalPages}`;
  }

  /* ── BUILD SKELETON PAGES ── */
  function buildSkeletons(count) {
    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'pdf-page-wrapper';
      wrapper.id = `page-wrapper-${i}`;
      wrapper.dataset.page = i;

      const skeleton = document.createElement('div');
      skeleton.className = 'pdf-page-skeleton';
      wrapper.appendChild(skeleton);
      container.appendChild(wrapper);
    }
  }

  /* ── LOAD PDFJS ── */
  function loadPdfJs() {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) { resolve(); return; }
      const s = document.createElement('script');
      s.src = PDFJS_CDN;
      s.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        resolve();
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  /* ── LOAD PDF ── */
  async function loadPdf(config) {
    setLoaderProgress(10, 'Chargement…');

    await loadPdfJs();
    setLoaderProgress(25, 'Initialisation…');

    const loadingTask = window.pdfjsLib.getDocument({
      url: config.file,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
    });

    loadingTask.onProgress = ({ loaded, total }) => {
      if (total > 0) {
        const pct = 25 + Math.round((loaded / total) * 55);
        setLoaderProgress(pct, 'Téléchargement…');
      }
    };

    pdfDoc = await loadingTask.promise;
    totalPages = pdfDoc.numPages;

    setLoaderProgress(82, 'Mise en page…');

    // Compute scale from first page
    const firstPage = await pdfDoc.getPage(1);
    const viewport  = firstPage.getViewport({ scale: 1 });
    scale = computeScale(viewport);

    buildSkeletons(totalPages);
    updatePageIndicator();
    setupLazyLoad();
    setupPageTracker();

    setLoaderProgress(100, 'Prêt');
    setTimeout(() => {
      loader.classList.add('hidden');
      // Render first 2 pages immediately
      renderPage(1);
      if (totalPages > 1) renderPage(2);
    }, 400);
  }

  function setLoaderProgress(pct, label) {
    if (loaderBar)   loaderBar.style.width = pct + '%';
    if (loaderLabel) loaderLabel.textContent = label;
  }

  /* ── BACK NAVIGATION ── */
  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  }

  /* ── FULLSCREEN ── */
  function toggleFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    }
  }

  /* ── SCROLL TO TOP ── */
  viewerBody.addEventListener('scroll', () => {
    scrollTop.classList.toggle('visible', viewerBody.scrollTop > 300);
  }, { passive: true });

  scrollTop.addEventListener('click', () => {
    viewerBody.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── KEYBOARD NAV ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        toggleFullscreen();
      } else {
        goBack();
      }
    }
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      viewerBody.scrollBy({ top: viewerBody.clientHeight * 0.85, behavior: 'smooth' });
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      viewerBody.scrollBy({ top: -viewerBody.clientHeight * 0.85, behavior: 'smooth' });
    }
    if (e.key === 'Home') {
      e.preventDefault();
      viewerBody.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (e.key === 'End') {
      e.preventDefault();
      viewerBody.scrollTo({ top: viewerBody.scrollHeight, behavior: 'smooth' });
    }
  });

  /* ── BIND BUTTONS ── */
  btnBack.addEventListener('click', (e) => { e.preventDefault(); goBack(); });
  btnFullscreen.addEventListener('click', toggleFullscreen);

  /* ── HANDLE RESIZE ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(async () => {
      if (!pdfDoc) return;
      const firstPage = await pdfDoc.getPage(1);
      const viewport  = firstPage.getViewport({ scale: 1 });
      const newScale  = computeScale(viewport);
      if (Math.abs(newScale - scale) < 0.02) return;
      scale = newScale;
      renderedPages.clear();
      rendering.clear();
      if (observer) observer.disconnect();
      buildSkeletons(totalPages);
      setupLazyLoad();
      setupPageTracker();
      renderPage(1);
      if (totalPages > 1) renderPage(2);
    }, 250);
  });

  /* ── INIT ── */
  async function init() {
    const config = getDocConfig();

    // Set document title & meta
    if (docTitle) docTitle.textContent = config.label;
    document.title = config.label + ' — Chorégraphie du Bien-Être';

    // Set download href
    if (btnDownload) btnDownload.href = config.file;
    if (btnDownload) btnDownload.download = config.file;

    try {
      await loadPdf(config);
    } catch (err) {
      console.error('PDF load error:', err);
      loader.classList.add('hidden');
      errorState.classList.add('visible');
    }
  }

  init();
})();
