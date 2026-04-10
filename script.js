/* =========================================
   1. 初始化 AOS & 頁面判斷邏輯
   ========================================= */
var msnry; 

document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.top-bar');
    const heroSection = document.querySelector('.hero-poster'); 
    // [重要] 對應 HTML 中的 ID
    const grid = document.getElementById('masonry-container');

    if (heroSection) {
        initLiquidChrome(); 
    }

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

        if (msnry) msnry.layout();

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