/* =========================================
   0. JSON-first homepage card rendering
   =========================================
   The homepage project cards are rendered from data/projects.json by
   default. The hardcoded cards in index.html remain in place as a
   safety net and are only swapped out after JSON cards have been
   built and validated successfully.

   URL query parameters:
     (none)      Default — render from data/projects.json.
     ?static=1   Escape hatch — force the original hardcoded cards.
                 Useful if JSON breaks or for direct comparison.
     ?json=1    Debug mode — same as default, but shows a visible
                 badge confirming the JSON path is active.

   Fallback policy:
     If fetch fails, JSON parsing fails, the projects array is
     missing/empty, or any card fails to build, the hardcoded cards
     remain visible. The atomic swap only runs once every card has
     been built in memory.

   This is JSON-first migration, NOT a React/framework rewrite. The
   live website is still a static site served from GitHub Pages.
   See docs/JSON_FIRST_MIGRATION_PLAN.md.
   ========================================= */
function buildCardFromProject(p) {
    // Use createElement + textContent everywhere to avoid any XSS path
    // from data/projects.json content. No innerHTML on user-derived
    // strings.
    const subtitleKey = 'card.' + p.id + '.sub';
    const catLabel = p.category
        ? (p.category.charAt(0).toUpperCase() + p.category.slice(1))
        : '';
    const subtitleFallback = (p.location || '') +
        (catLabel ? ' / ' + catLabel + ' ' + (p.year || '') : '');

    const card = document.createElement('a');
    card.className = 'project-card';
    card.href = p.page || '#';
    card.setAttribute('data-category', p.category || '');
    card.setAttribute('data-type', p.type || '');
    card.setAttribute(
        'data-tags',
        Array.isArray(p.dataTags) ? p.dataTags.join(' ') : ''
    );

    const imageBox = document.createElement('div');
    imageBox.className = 'image-box';
    const img = document.createElement('img');
    img.src = p.coverImage || '';
    img.alt = p.title || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    if (p.coverWidth && p.coverHeight) {
        img.width = p.coverWidth;
        img.height = p.coverHeight;
    }
    imageBox.appendChild(img);

    const textBox = document.createElement('div');
    textBox.className = 'text-box';
    const h3 = document.createElement('h3');
    h3.textContent = p.title || '';
    const subtitle = document.createElement('p');
    subtitle.setAttribute('data-i18n', subtitleKey);
    subtitle.textContent = subtitleFallback;
    textBox.appendChild(h3);
    textBox.appendChild(subtitle);

    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'tags';
    tagsDiv.textContent = p.displayedTagsRaw || '';

    card.appendChild(imageBox);
    card.appendChild(textBox);
    card.appendChild(tagsDiv);
    return card;
}

async function tryRenderFromJson(grid) {
    if (!grid) return false;
    const params = new URLSearchParams(window.location.search);

    // Escape hatch — leave the hardcoded cards in place.
    if (params.get('static') === '1') {
        console.log('[json-default] ?static=1 — using hardcoded cards');
        return false;
    }

    const showBadge = params.get('json') === '1';

    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        if (!data || !Array.isArray(data.projects) || !data.projects.length) {
            throw new Error('projects array missing or empty');
        }

        // Build all new cards before mutating the grid, so a mid-loop
        // failure cannot leave the page half-populated.
        const newCards = data.projects.map(buildCardFromProject);

        // Validate the card set before swapping. Any of these failing
        // means we leave the hardcoded cards in place.
        if (newCards.length !== data.projects.length) {
            throw new Error('card build incomplete (' +
                newCards.length + ' / ' + data.projects.length + ')');
        }
        if (typeof data.project_count === 'number' &&
            newCards.length !== data.project_count) {
            throw new Error('card count ' + newCards.length +
                ' does not match declared project_count ' +
                data.project_count);
        }
        if (newCards.some(function (c) {
            return !c || c.tagName !== 'A' || !c.href;
        })) {
            throw new Error('one or more cards built without href');
        }

        // Atomic swap — remove hardcoded cards, insert JSON cards
        // before the .gallery-gutter spacer (or at the end if absent).
        const gutter = grid.querySelector('.gallery-gutter');
        grid.querySelectorAll('.project-card').forEach(function (el) {
            el.remove();
        });
        newCards.forEach(function (card) {
            if (gutter) grid.insertBefore(card, gutter);
            else grid.appendChild(card);
        });

        // Re-apply i18n so subtitles translate to the active language
        if (typeof applyI18n === 'function') {
            try { applyI18n(); } catch (e) { /* non-fatal */ }
        }

        // Debug badge only when ?json=1 is set; default mode is silent.
        if (showBadge) {
            const banner = document.createElement('div');
            banner.id = 'json-preview-banner';
            banner.textContent = 'JSON preview mode — cards from data/projects.json';
            banner.style.cssText =
                'position:fixed;top:10px;right:10px;background:#557055;' +
                'color:#fff;padding:6px 12px;font-size:0.72rem;' +
                'font-family:Menlo,monospace;letter-spacing:.5px;' +
                'z-index:9999;border-radius:3px;opacity:0.9;';
            document.body.appendChild(banner);
        }

        console.log('[json-default] Rendered ' + newCards.length +
            ' cards from data/projects.json');
        return true;
    } catch (e) {
        // Any failure leaves the hardcoded cards intact.
        console.warn(
            '[json-default] Failed, falling back to hardcoded cards:', e
        );
        return false;
    }
}

/* =========================================
   0b. Manifesto + IT Skills word-by-word reveal
   =========================================
   Splits the manifesto sentence into per-word spans and indexes the
   skill pills, then reveals them one at a time (via CSS transition-delay,
   see .reveal-word / .skill-pill in style.css) once the section scrolls
   into view. Delay grows with each item so the sequence reads like a
   typewriter slowing down as it finishes.
   ========================================= */
function initBioReveal() {
    const bioSection = document.querySelector('.bio-section');
    if (!bioSection) return;

    const lines = bioSection.querySelectorAll('.manifesto-line');
    let wordIndex = 0;
    lines.forEach(line => {
        const words = line.textContent.trim().split(/\s+/);
        line.textContent = '';
        words.forEach((word, i) => {
            const span = document.createElement('span');
            span.className = 'reveal-word';
            span.style.setProperty('--i', wordIndex++);
            span.textContent = word;
            line.appendChild(span);
            if (i < words.length - 1) line.appendChild(document.createTextNode(' '));
        });
    });

    bioSection.querySelectorAll('.skill-pill').forEach((pill, i) => {
        pill.style.setProperty('--i', i);
    });

    if (!('IntersectionObserver' in window)) {
        bioSection.classList.add('in-view');
        return;
    }

    // threshold 0.5: wait until half the section is visible before playing,
    // so it starts closer to when it's actually being looked at (0.2 fired
    // too early — the sequence had already finished by the time it was in
    // full view). Toggles in-view on/off (no unobserve) so leaving the
    // viewport in either direction resets it, and scrolling back in —
    // whichever way — replays it from the start instead of a one-time-only
    // animation.
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            bioSection.classList.toggle('in-view', entry.isIntersecting);
        });
    }, { threshold: 0.5 });
    revealObserver.observe(bioSection);
}

/* =========================================
   0c. Sidebar (name/education/contact/filter) slow reveal
   =========================================
   Same growing-delay fade as initBioReveal(), but fade-only (no
   translateY) since the sidebar items already carry --i and the
   .sidebar-reveal class directly in index.html. Triggers once when the
   sticky sidebar scrolls into view.
   threshold 0.1 -> 0.5: the sidebar's own box is ~100vh tall, so 10%
   visible was only ~1/10th of a screen scrolled -- the reveal had
   already played out before it was actually in view. Matches the same
   fix applied to the manifesto reveal (initBioReveal).
   ========================================= */
function initSidebarReveal() {
    const sidebar = document.querySelector('.sticky-sidebar');
    if (!sidebar) return;

    if (!('IntersectionObserver' in window)) {
        sidebar.classList.add('in-view');
        return;
    }

    const sidebarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                sidebar.classList.add('in-view');
                sidebarObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    sidebarObserver.observe(sidebar);
}

/* =========================================
   1. 初始化 AOS & 頁面判斷邏輯
   ========================================= */
var msnry;

document.addEventListener('DOMContentLoaded', async function() {
    const navbar = document.querySelector('.top-bar');
    const heroSection = document.querySelector('.hero-poster');
    // [重要] 對應 HTML 中的 ID
    const grid = document.getElementById('masonry-container');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo && reduceMotion.matches) {
        heroVideo.pause();
        heroVideo.removeAttribute('autoplay');
    }

    if (heroSection) {
        initLiquidChrome();
    }

    initBioReveal();
    initSidebarReveal();

    // JSON-first rendering: cards come from data/projects.json by
    // default. Returns false (leaving hardcoded cards in place) if
    // ?static=1 is set or if any fetch / validation step fails.
    await tryRenderFromJson(grid);

    if (grid) {
        imagesLoaded(grid, function() {
            msnry = new Masonry(grid, {
                itemSelector: '.project-card',
                columnWidth: '.project-card', 
                percentPosition: true,
                gutter: '.gallery-gutter',
                horizontalOrder: true 
            });
            
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    offset: 50,
                    duration: 1000,
                    easing: 'ease-out-cubic',
                    once: true
                });
            }

            // Strip AOS from project cards after initial animations finish
            // so filtering never re-triggers the fly-in effect
            setTimeout(() => {
                document.querySelectorAll('#masonry-container .project-card').forEach(card => {
                    card.removeAttribute('data-aos');
                    card.removeAttribute('data-aos-duration');
                    card.removeAttribute('data-aos-delay');
                    card.style.transform = '';
                    card.style.opacity = '1';
                });

                // Apply filter from clean path (/arch) or fallback query (?f=arch)
                const shortToFull = { arch: 'architecture', furn: 'furniture', '3d': '3dprinting', vr: 'vr', aigc: 'aigc' };
                const pathCode = window.location.pathname.replace(/^\//, '').replace('index.html', '');
                const queryCode = new URLSearchParams(window.location.search).get('f');
                const code = (pathCode && shortToFull[pathCode]) ? pathCode : queryCode;
                if (code && shortToFull[code]) {
                    filterByType(shortToFull[code]);
                }
            }, 1500);
        });
    } else {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                offset: 50,
                duration: 1000,
                easing: 'ease-out-cubic',
                once: true
            });
        }
    }

    if (heroSection) {
        if (navbar) navbar.classList.add('hidden-nav');
        window.addEventListener('scroll', handleHomeScroll);
    } else {
        if (navbar) navbar.classList.remove('hidden-nav');
    }
});

/* =========================================
   2. 首頁滾動監聽
   ========================================= */
function handleHomeScroll() {
    const navbar = document.querySelector('.top-bar');
    if (!navbar) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const showThreshold = window.innerHeight + 50; 

    if (scrollTop > showThreshold) {
        navbar.classList.remove('hidden-nav');
    } else {
        navbar.classList.add('hidden-nav');
    }
}

/* =========================================
   3. 篩選專案並更新 Masonry 排版
   ========================================= */

// refreshMasonry — defensive helper for re-running Masonry layout after
// DOM visibility / content changes. Solves two timing bugs:
//   (a) display:none → block toggle. Calling reloadItems() synchronously
//       right after the toggle measures stale / intermediate item heights
//       because the browser hasn't finished reflow yet. requestAnimationFrame
//       defers until the browser has applied the layout change.
//   (b) Image dimensions may still be in flight (lazy-load, first paint).
//       A second layout() pass inside imagesLoaded() catches that.
// Safe to call before Masonry instance exists (no-op until grid + lib are
// available). Reason string is for debug logging only.
function refreshMasonry(reason) {
    const grid = document.getElementById('masonry-container');
    if (!grid) return;
    if (typeof Masonry === 'undefined') return;

    // Initialize on first call if the page hasn't yet — e.g. if called
    // from a language switch before the initial imagesLoaded callback fired.
    if (!msnry) {
        msnry = new Masonry(grid, {
            itemSelector: '.project-card',
            columnWidth: '.project-card',
            percentPosition: true,
            gutter: '.gallery-gutter',
            horizontalOrder: true
        });
    }

    // Defer one frame so any display: block toggles or text swaps have
    // been reflowed by the browser before Masonry measures.
    requestAnimationFrame(function () {
        msnry.reloadItems();
        msnry.layout();

        // Second layout pass once images finish loading, in case any
        // newly-visible card had a not-yet-loaded image at first layout.
        if (typeof imagesLoaded !== 'undefined') {
            imagesLoaded(grid, function () { msnry.layout(); });
        }
    });
}

function applyFilter(testFn, activeType, activeValue) {
    const projects = document.querySelectorAll('.project-card');

    // Phase 1: fade everything out
    projects.forEach(p => { p.style.opacity = '0'; });

    setTimeout(() => {
        // Phase 2: show/hide items, then relayout
        let firstVisible = null;
        projects.forEach(p => {
            if (testFn(p)) {
                p.classList.remove('hidden');
                p.style.display = 'block';
                if (!firstVisible) firstVisible = p;
            } else {
                p.classList.add('hidden');
                p.style.display = 'none';
            }
        });

        // Special order: swap Single-family and Tea Room for architecture filter only
        const container = document.getElementById('masonry-container');
        const singleFamily = container.querySelector('a[href="Single-family-home.html"]');
        const teaRoom = container.querySelector('a[href="tearoom.html"]');
        if (singleFamily && teaRoom) {
            if (activeValue === 'architecture') {
                container.insertBefore(singleFamily, teaRoom);
            } else {
                container.insertBefore(teaRoom, singleFamily);
            }
        }

        refreshMasonry('filter:' + activeType + ':' + activeValue);

        // Phase 3: fade visible items back in
        setTimeout(() => {
            projects.forEach(p => {
                if (!p.classList.contains('hidden')) p.style.opacity = '1';
            });
        }, 40);

        updateActiveButton(activeType, activeValue);
    }, 220);
}

function filterProjects(category) {
    applyFilter(
        p => category === 'all' || p.getAttribute('data-category') === category,
        'category', category
    );
}

function filterByType(type) {
    applyFilter(
        p => type === 'all' || p.getAttribute('data-type') === type,
        'type', type
    );
}

function filterByTag(tag) {
    applyFilter(
        p => { const t = p.getAttribute('data-tags'); return t && t.includes(tag); },
        'tag', tag
    );
}

/* =========================================
   4. 輔助功能
   ========================================= */

function scrollToElement(element) {
    if (element) {
        const yOffset = -120; 
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
}

function updateActiveButton(type, value) {
    const allFilters = document.querySelectorAll('.filter-btn, .cat-btn, .tag-btn, .type-filter-pill');
    allFilters.forEach(btn => btn.classList.remove('active'));

    if (type === 'category') {
        const activeBtns = document.querySelectorAll(`[onclick*="filterProjects('${value}')"]`);
        activeBtns.forEach(btn => btn.classList.add('active'));
    } else if (type === 'tag') {
        const activeBtns = document.querySelectorAll(`[onclick*="filterByTag('${value}')"]`);
        activeBtns.forEach(btn => btn.classList.add('active'));
    } else if (type === 'type') {
        const activeBtns = document.querySelectorAll(`[onclick*="filterByType('${value}')"]`);
        activeBtns.forEach(btn => btn.classList.add('active'));

        // Show clean URL in address bar (e.g. /arch, /aigc)
        const fullToShort = { architecture: 'arch', furniture: 'furn', '3dprinting': '3d', vr: 'vr', aigc: 'aigc' };
        const shortCode = fullToShort[value];
        history.replaceState({}, '', value === 'all' ? '/' : '/' + shortCode);
    }
}


/* =========================================
   5. [Vanilla WebGL] Liquid Chrome
   ========================================= */
function initLiquidChrome() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.warn('WebGL not supported');
        return;
    }

    const vertexSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragmentSource = `
        precision highp float;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec3 uBaseColor;
        uniform vec2 uMouse;

        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution.xy;
            uv = (uv - 0.5) * 2.0;
            uv.x *= uResolution.x / uResolution.y;

            float amplitude = 0.5; 
            float freq = 3.0;
            
            for(float i = 1.0; i < 8.0; i++){
                uv.x += amplitude / i * cos(i * freq * uv.y + uTime + uMouse.x * 3.0);
                uv.y += amplitude / i * cos(i * freq * uv.x + uTime + uMouse.y * 3.0);
            }

            float intensity = abs(sin(uTime - uv.y - uv.x));
            intensity = clamp(intensity, 0.1, 1.0);
            
            vec3 color = uBaseColor / intensity;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);

    const vertices = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uResLoc = gl.getUniformLocation(program, "uResolution");
    const uBaseColorLoc = gl.getUniformLocation(program, "uBaseColor");
    const uMouseLoc = gl.getUniformLocation(program, "uMouse");

    let time = 0;
    const baseColor = [0.4, 0.6, 0.4]; 
    const mouse = { x: 0.5, y: 0.5 };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uResLoc, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX / window.innerWidth;
        mouse.y = 1.0 - (e.clientY / window.innerHeight); 
    });

    gl.uniform3f(uBaseColorLoc, baseColor[0], baseColor[1], baseColor[2]);

    function animate() {
        time += 0.005; 
        gl.uniform1f(uTimeLoc, time);
        gl.uniform2f(uMouseLoc, mouse.x, mouse.y);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(animate);
    }
    animate();
}
