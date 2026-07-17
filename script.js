const $ = (selector, scope = document) => scope.querySelector(selector);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class Network {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = { count: 70, distance: 135, speed: 0.22, colorful: true, introMode: false, ...options };
    this.nodes = [];
    this.startedAt = Date.now();
    this.pointer = { x: -9999, y: -9999 };
    this.resize();
    this.createNodes();
    window.addEventListener('resize', () => { this.resize(); this.createNodes(); });
    canvas.addEventListener('pointermove', e => {
      const rect = canvas.getBoundingClientRect();
      this.pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    });
    canvas.addEventListener('pointerleave', () => this.pointer = { x: -9999, y: -9999 });
    this.draw();
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width || window.innerWidth;
    this.height = rect.height || window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  createNodes() {
    const count = Math.min(this.options.count, Math.floor(this.width * this.height / 9000));
    this.nodes = Array.from({ length: Math.max(26, count) }, (_, i) => {
      const cluster = i % 3;
      const centers = [[.27,.33],[.7,.3],[.55,.7]];
      const center = centers[cluster];
      return {
        x: center[0] * this.width + (Math.random() - .5) * this.width * .42,
        y: center[1] * this.height + (Math.random() - .5) * this.height * .38,
        vx: (Math.random() - .5) * this.options.speed,
        vy: (Math.random() - .5) * this.options.speed,
        r: Math.random() * 2 + 1.1,
        cluster,
        phase: Math.random() * Math.PI * 2
      };
    });
  }
  draw = () => {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);
    const colors = this.options.colorful ? ['255,174,124','184,145,119','255,240,228'] : ['255,246,239','255,246,239','255,246,239'];
    const introProgress = Math.min(1, (Date.now() - this.startedAt) / 4800);
    this.nodes.forEach((node, i) => {
      if (!prefersReducedMotion) {
        node.x += node.vx; node.y += node.vy; node.phase += .018;
        if (node.x < -15 || node.x > width + 15) node.vx *= -1;
        if (node.y < -15 || node.y > height + 15) node.vy *= -1;
        const pd = Math.hypot(node.x - this.pointer.x, node.y - this.pointer.y);
        if (pd < 110) { node.x += (node.x - this.pointer.x) * .006; node.y += (node.y - this.pointer.y) * .006; }
      }
      for (let j = i + 1; j < this.nodes.length; j++) {
        const other = this.nodes[j];
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        const crossCulture = node.cluster !== other.cluster;
        if (distance < this.options.distance && (!this.options.introMode || !crossCulture || introProgress > .42)) {
          const alpha = (1 - distance / this.options.distance) * (node.cluster === other.cluster ? .3 : .5);
          ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(${node.cluster === other.cluster ? colors[node.cluster] : '230,239,240'},${alpha})`;
          ctx.lineWidth = node.cluster === other.cluster ? .55 : .85; ctx.stroke();
        }
      }
      const glow = 5 + Math.sin(node.phase) * 2;
      ctx.beginPath(); ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${colors[node.cluster]})`; ctx.shadowColor = `rgba(${colors[node.cluster]},.8)`; ctx.shadowBlur = glow; ctx.fill(); ctx.shadowBlur = 0;
    });
    this.frame = requestAnimationFrame(this.draw);
  }
}

const intro = $('#intro');
if (intro && !prefersReducedMotion) {
  new Network($('#intro-canvas'), { count: 86, distance: 118, speed: .24, colorful: true, introMode: true });
  const endIntro = () => intro.classList.add('is-hidden');
  $('#skip-intro').addEventListener('click', endIntro);
  intro.classList.add('stage-1');
  const story = [
    ['Individual choice.', 'One person decides whether to cooperate.'],
    ['Reciprocity loops.', 'Choices are observed, returned, and remembered.'],
    ['A norm emerges.', 'Repeated behavior becomes a shared expectation.'],
    ['Across cultures.', 'New bridges carry cooperation between groups.']
  ];
  const word = $('#intro-word');
  const explainer = $('#intro-explainer');
  const stageNumber = $('#intro-stage-number');
  const steps = Array.from(document.querySelectorAll('.intro-sequence span'));
  const lines = Array.from(document.querySelectorAll('.intro-sequence i'));
  story.slice(1).forEach((item, index) => window.setTimeout(() => {
    intro.classList.remove('stage-1', 'stage-2', 'stage-3', 'stage-4');
    intro.classList.add(`stage-${index + 2}`);
    stageNumber.textContent = String(index + 2).padStart(2, '0');
    word.classList.add('switching');
    window.setTimeout(() => { word.textContent = item[0]; explainer.textContent = item[1]; word.classList.remove('switching'); }, 240);
    steps.forEach((step, stepIndex) => { step.classList.toggle('active', stepIndex === index + 1); if (stepIndex <= index) step.classList.add('complete'); });
    if (lines[index]) lines[index].classList.add('complete');
  }, 2100 * (index + 1)));
  window.setTimeout(endIntro, 9200);
} else if (intro) intro.classList.add('is-hidden');

new Network($('#network-canvas'), { count: 82, distance: 145, speed: .2 });
new Network($('#join-canvas'), { count: 46, distance: 170, speed: .13, colorful: false });

const header = $('#site-header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

const menuButton = $('.menu-button');
const mobileMenu = $('.mobile-menu');
function closeMenu() {
  document.body.classList.remove('menu-open'); mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true'); menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  if (open) closeMenu(); else {
    document.body.classList.add('menu-open'); mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false'); menuButton.setAttribute('aria-expanded', 'true');
  }
});
document.querySelectorAll('.mobile-menu a').forEach(link => link.addEventListener('click', closeMenu));

$('.theme-toggle').addEventListener('click', () => document.body.classList.toggle('light-theme'));

const profileDialog = $('#profile-dialog');
const profileOpen = $('.profile-open');
const profileClose = $('.profile-close');
if (profileDialog && profileOpen && profileClose) {
  profileOpen.addEventListener('click', () => profileDialog.showModal());
  profileClose.addEventListener('click', () => profileDialog.close());
  profileDialog.addEventListener('click', event => {
    if (event.target === profileDialog) profileDialog.close();
  });
}

const observed = document.querySelectorAll('.research-card,.method-list article,.project-list article');
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,fill:'forwards',easing:'cubic-bezier(.22,1,.36,1)'}); observer.unobserve(entry.target); }
}), { threshold: .12 });
if (!prefersReducedMotion) observed.forEach(el => { el.style.opacity = 0; observer.observe(el); });
