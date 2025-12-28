// Portfolio Projects Management
(function() {
  'use strict';

  let projects = [];
  const AUTOPLAY_VIDEO = false;
  const INCLUDE_PLAYLIST_PARAMS = false;
  const pageSize = 6;
  let currentPage = 1;
  let totalPages = 0;

  // DOM Elements
  const grid = document.getElementById('projectGrid');
  const pager = document.getElementById('pager');
  const backdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');
  const modalImg = document.getElementById('modalImg');
  const modalTags = document.getElementById('modalTags');
  const modalDesc = document.getElementById('modalDesc');
  const modalGithub = document.getElementById('modalGithub');
  const modalLive = document.getElementById('modalLive');
  const modalVideoWrap = document.getElementById('modalVideoWrap');

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    loadProjects();
    setupEventListeners();
  }

  function loadProjects() {
    fetch('src/data/projects.json')
      .then((r) => r.json())
      .then((data) => {
        projects = data;
        totalPages = Math.ceil(projects.length / pageSize);
        renderPage(1);
      })
      .catch((err) => {
        console.error('Failed to load projects:', err);
      });
  }

  function setupEventListeners() {
    // Pager events
    if (pager) {
      pager.addEventListener('click', handlePagerClick);
    }

    // Grid card click events
    if (grid) {
      grid.addEventListener('click', handleCardClick);
    }

    // Modal backdrop click
    if (backdrop) {
      backdrop.addEventListener('click', handleBackdropClick);
    }
  }

  function renderPage(page = 1) {
    currentPage = page;
    const start = (page - 1) * pageSize;
    const items = projects.slice(start, start + pageSize);

    if (grid) {
      grid.innerHTML = items.map((p) => createCardHTML(p)).join('');

      // Setup intersection observer for cards
      document.querySelectorAll('.card').forEach((el) => {
        observer.observe(el);
      });
    }

    updatePager();
  }

  function createCardHTML(p) {
    return `
      <div class='card' data-id='${p.id}'>
        ${p.badge ? `<div class='badge'>${p.badge}</div>` : ''}
        <div class='thumb'><img src='${p.image}' alt='${p.title}' loading="lazy"></div>
        <div class='card-body'>
          <div class='title'>${p.title}</div>
          <div class='desc'>${p.desc}</div>
        </div>
      </div>
    `;
  }

  function updatePager() {
    if (!pager || totalPages <= 1) {
      if (pager) pager.style.display = 'none';
      return;
    }

    pager.style.display = 'flex';
    let html = `<button class="pager-btn" data-nav="prev" ${
      currentPage === 1 ? 'disabled' : ''
    }>Prev</button>`;

    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="pager-btn ${
        i === currentPage ? 'active' : ''
      }" data-page="${i}">${i}</button>`;
    }

    html += `<button class="pager-btn" data-nav="next" ${
      currentPage === totalPages ? 'disabled' : ''
    }>Next</button>`;

    pager.innerHTML = html;
  }

  function handlePagerClick(e) {
    const btn = e.target.closest('.pager-btn');
    if (!btn) return;

    if (btn.dataset.page) {
      renderPage(parseInt(btn.dataset.page));
    } else if (btn.dataset.nav === 'prev' && currentPage > 1) {
      renderPage(currentPage - 1);
    } else if (btn.dataset.nav === 'next' && currentPage < totalPages) {
      renderPage(currentPage + 1);
    }

    // Scroll to projects section
    const prj = document.getElementById('projects');
    if (prj) {
      window.scrollTo({ top: prj.offsetTop - 10, behavior: 'smooth' });
    }
  }

  function handleCardClick(e) {
    const card = e.target.closest('.card');
    if (!card) return;

    const p = projects.find((x) => x.id === card.dataset.id);
    if (!p) return;

    openModal(p);
  }

  function openModal(project) {
    if (modalTitle) modalTitle.textContent = project.title;
    if (modalDesc) modalDesc.textContent = project.desc;

    if (modalTags) {
      modalTags.innerHTML = project.tags.map((t) => `<span>${t}</span>`).join('');
    }

    // Setup buttons
    if (modalGithub) {
      modalGithub.href = project.github;
      modalGithub.style.display =
        project.github && project.github !== '#' ? 'inline-block' : 'none';
    }

    if (modalLive) {
      modalLive.href = project.live;
      modalLive.style.display =
        project.live && project.live !== '#' ? 'inline-block' : 'none';
    }

    // Handle video or image
    if (project.video) {
      if (modalImg) modalImg.style.display = 'none';
      if (modalVideoWrap) {
        modalVideoWrap.style.display = 'block';
        modalVideoWrap.innerHTML = `<iframe src="${toEmbedUrl(
          project.video,
          AUTOPLAY_VIDEO
        )}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>`;
      }
    } else {
      if (modalVideoWrap) {
        modalVideoWrap.innerHTML = '';
        modalVideoWrap.style.display = 'none';
      }
      if (modalImg) {
        modalImg.src = project.image;
        modalImg.style.display = 'block';
      }
    }

    // Hide badges when modal opens
    document.querySelectorAll('.badge').forEach((badge) => {
      badge.style.display = 'none';
    });

    if (backdrop) backdrop.style.display = 'flex';
  }

  function handleBackdropClick(e) {
    if (e.target === backdrop) {
      closeModal();
    }
  }

  function closeModal() {
    if (backdrop) backdrop.style.display = 'none';
    if (modalVideoWrap) modalVideoWrap.innerHTML = '';

    // Show badges again
    document.querySelectorAll('.badge').forEach((badge) => {
      badge.style.display = 'block';
    });
  }

  function toEmbedUrl(url, autoplay = false) {
    try {
      const u = new URL(url);

      if (u.hostname.includes('youtube.com')) {
        const id = u.searchParams.get('v');
        let embed = `https://www.youtube.com/embed/${id}?rel=0`;
        if (autoplay) embed += '&autoplay=1&mute=1';
        if (INCLUDE_PLAYLIST_PARAMS) {
          const list = u.searchParams.get('list');
          const index = u.searchParams.get('index');
          if (list) embed += `&list=${list}`;
          if (index) embed += `&index=${index}`;
        }
        return embed;
      }

      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.slice(1);
        return `https://www.youtube.com/embed/${id}?rel=0${
          autoplay ? '&autoplay=1&mute=1' : ''
        }`;
      }
    } catch (_e) {
      console.error('Invalid video URL:', url);
    }

    return url;
  }

  // Intersection Observer for lazy loading cards
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
})();
