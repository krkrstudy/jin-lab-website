const $ = (selector, scope = document) => scope.querySelector(selector);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentLanguage = localStorage.getItem('jin-lab-language') || 'en';

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
  const introStories = {
    en: [
      ['Individual choice.', 'One person decides whether to cooperate.'],
      ['Reciprocity loops.', 'Choices are observed, returned, and remembered.'],
      ['A norm emerges.', 'Repeated behavior becomes a shared expectation.'],
      ['Across cultures.', 'New bridges carry cooperation between groups.']
    ],
    zh: [
      ['个体选择。', '一个人决定是否合作。'],
      ['互惠循环。', '选择被观察、回应，并被记住。'],
      ['规范形成。', '重复的行为成为共同的期待。'],
      ['跨越文化。', '新的桥梁让合作在群体之间流动。']
    ]
  };
  const story = introStories[currentLanguage];
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
    window.setTimeout(() => {
      const localizedItem = introStories[currentLanguage][index + 1] || item;
      word.textContent = localizedItem[0];
      explainer.textContent = localizedItem[1];
      word.classList.remove('switching');
    }, 240);
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

/* Bilingual presentation layer. The English copy remains the source version;
   the Chinese copy is applied in-place so links, animations, and layout stay shared. */
const languageToggle = $('.language-toggle');
const languageTargets = [];
const addLanguageTarget = (selector, en, zh) => languageTargets.push({ selector, values: [en, zh] });
const addLanguageList = (selector, values) => languageTargets.push({ selector, values });

addLanguageTarget('.brand > span:last-child', 'COOPERATION &amp; SOCIOCULTURAL LAB', '合作与社会文化实验室');
addLanguageTarget('.intro-kicker', 'AN EXPERIMENT IN HUMAN COOPERATION', '一场关于人类合作的实验');
addLanguageTarget('#intro-word', 'Individual choice.', '个体选择。');
addLanguageTarget('#intro-explainer', 'One person decides whether to cooperate.', '一个人决定是否合作。');
addLanguageTarget('.intro-outcome span', 'COOPERATION', '合作');
addLanguageTarget('.intro-outcome em', 'BECOMES CULTURE', '成为文化');
addLanguageList('.intro-sequence span', ['01&nbsp; CHOICE', '02&nbsp; RECIPROCITY', '03&nbsp; NORM', '04&nbsp; CULTURE']);
languageTargets.at(-1).values = ['01&nbsp; CHOICE|02&nbsp; RECIPROCITY|03&nbsp; NORM|04&nbsp; CULTURE'.split('|'), '01&nbsp; 选择|02&nbsp; 互惠|03&nbsp; 规范|04&nbsp; 文化'.split('|')];
addLanguageTarget('#skip-intro', 'Skip intro', '跳过开场');
addLanguageList('.desktop-nav a', ['About', 'News', 'Research', 'Methods', 'People', 'Publications', 'Join us']);
languageTargets.at(-1).values = [['About', 'News', 'Research', 'Methods', 'People', 'Publications', 'Join us'], ['关于', '新闻', '研究', '方法', '成员', '发表成果', '加入我们']];
addLanguageList('.mobile-menu nav a', ['About', 'News', 'Research', 'Methods', 'People', 'Publications', 'Join us']);
languageTargets.at(-1).values = [['About', 'News', 'Research', 'Methods', 'People', 'Publications', 'Join us'], ['关于', '新闻', '研究', '方法', '成员', '发表成果', '加入我们']];
addLanguageTarget('.eyebrow', 'Behavioral science · Cooperation · Culture', '行为科学 · 合作 · 文化');
addLanguageTarget('.hero h1', 'How cooperation<br /><em>becomes culture.</em>', '合作如何<br /><em>成为文化。</em>');
addLanguageTarget('.hero-intro', 'The Cooperation and Sociocultural Lab investigates how cooperative behavior and social norms emerge, vary across cultures, and can be strengthened through evidence-based interventions.', '合作与社会文化实验室研究合作行为和社会规范如何形成、如何在不同文化中变化，以及如何通过循证干预得到促进。');
addLanguageTarget('.hero-actions .button-primary', 'Explore our research <span>↗</span>', '探索我们的研究 <span>↗</span>');
addLanguageTarget('.hero-actions .text-link', 'Meet the lab <span>→</span>', '认识实验室 <span>→</span>');
addLanguageList('.methods-strip span', ['Economic games', 'Cross-national experiments', 'Meta-analysis']);
languageTargets.at(-1).values = [['Economic games', 'Cross-national experiments', 'Meta-analysis'], ['经济博弈', '跨国实验', '元分析']];
addLanguageList('.data-label span', ['REPEATED INTERACTION', 'ACROSS GROUPS']);
languageTargets.at(-1).values = [['REPEATED INTERACTION', 'ACROSS GROUPS'], ['重复互动', '跨群体']];
addLanguageList('.data-label b', ['Reciprocity', 'Norm diffusion']);
languageTargets.at(-1).values = [['Reciprocity', 'Norm diffusion'], ['互惠', '规范扩散']];
addLanguageList('.network-legend span', ['Individual', 'Within-culture tie', 'Cross-cultural bridge']);
languageTargets.at(-1).values = [['Individual', 'Within-culture tie', 'Cross-cultural bridge'], ['个体', '文化内部联结', '跨文化桥梁']];
addLanguageTarget('.visual-caption', '<span class="pulse"></span> Conceptual behavioral model', '<span class="pulse"></span> 行为概念模型');
addLanguageTarget('.scroll-note span', 'Scroll to discover', '滚动探索');

addLanguageTarget('.pulse-heading .section-index', 'Live research field', '社会心理学研究场');
addLanguageTarget('.pulse-heading h2', 'Social psychology,<br /><em>in every direction.</em>', '社会心理学，<br /><em>向每个方向延展。</em>');
addLanguageTarget('.pulse-heading > span', '2,000 abstracts · 116 terms', '2,000 篇摘要 · 116 个术语');
addLanguageTarget('.kakeya-status span', 'CUBE GATE · FINITE DIRECTION MODEL', '立方体门 · 有限方向模型');
addLanguageTarget('#kakeya-motion', 'Pause', '暂停');
addLanguageTarget('#kakeya-reset', 'Reset view', '重置视图');
addLanguageTarget('#kakeya-fallback', 'The interactive field could not be loaded. Please refresh the page to try again.', '交互式研究场暂时无法加载，请刷新页面重试。');
addLanguageTarget('.kakeya-caption', 'Each term traces one direction through a shared cube—an interactive view of the concepts connecting our field. Drag to explore; scroll or pinch to zoom.', '每个术语都沿着一个方向穿过共享立方体，呈现连接社会心理学研究的概念网络。拖动探索，滚动或双指缩放。');
addLanguageTarget('.news-column > .section-index', 'News &amp; updates', '新闻与更新');
addLanguageTarget('.news-column h2', 'From the <em>lab.</em>', '来自<em>实验室。</em>');
addLanguageList('.news-item time', ['June 30, 2026', 'June 16, 2026']);
languageTargets.at(-1).values = [['June 30, 2026', 'June 16, 2026'], ['2026年6月30日', '2026年6月16日']];
addLanguageList('.news-item h3', ['Shuxian Jin Co-Organizes EASP Pre-Conference Workshop on Prosocial and Antisocial Behavior', 'Shuxian Jin Helps Advance the Chinese Translation and Release of the FORRT Open Scholarship Glossary']);
languageTargets.at(-1).values = [['Shuxian Jin Co-Organizes EASP Pre-Conference Workshop on Prosocial and Antisocial Behavior', 'Shuxian Jin Helps Advance the Chinese Translation and Release of the FORRT Open Scholarship Glossary'], ['金淑娴研究员成功组织欧洲社会心理学协会大会会前专题研讨会', '金淑娴研究员参与推进 FORRT 开放学术术语表中文版翻译与发布']];
addLanguageList('.news-item > span', ['Read story ↗', 'Read story ↗']);
languageTargets.at(-1).values = [['Read story ↗', 'Read story ↗'], ['阅读原文 ↗', '阅读原文 ↗']];

addLanguageTarget('.research .section-index', '01 / What we study', '01 / 研究内容');
addLanguageTarget('.research .section-heading h2', 'Cooperation, culture,<br /><em>and choice.</em>', '合作、文化，<br /><em>与选择。</em>');
addLanguageTarget('.research .section-heading > p:last-child', 'We study the formation of cooperation and social norms, cross-cultural differences, and strategies that promote cooperation—using behavioral experiments, surveys, and meta-analysis.', '我们研究合作与社会规范的形成、跨文化差异，以及促进合作的策略，综合采用行为实验、问卷调查和元分析。');
addLanguageList('.research-card .card-kicker', ['Interaction · Reciprocity', 'Culture · Context', 'Economic games · Strategy']);
languageTargets.at(-1).values = [['Interaction · Reciprocity', 'Culture · Context', 'Economic games · Strategy'], ['互动 · 互惠', '文化 · 情境', '经济博弈 · 策略']];
addLanguageList('.research-card h3', ['Cooperative<br />Behavior', 'Cross-Cultural<br />Differences', 'Economic Game<br />Experiments']);
languageTargets.at(-1).values = [['Cooperative<br />Behavior', 'Cross-Cultural<br />Differences', 'Economic Game<br />Experiments'], ['合作<br />行为', '跨文化<br />差异', '经济博弈<br />实验']];
addLanguageList('.research-card > div:last-child > p:last-child', [
  'How trust, reciprocity, reputation, and repeated interaction transform individual choices into stable cooperation.',
  'How ecological, social, and cultural contexts shape cooperation—and which strategies build bridges across boundaries.',
  'The prisoner’s dilemma captures the tension between individual gain and mutual benefit when two players choose to cooperate or defect.'
]);
languageTargets.at(-1).values = [
  ['How trust, reciprocity, reputation, and repeated interaction transform individual choices into stable cooperation.', 'How ecological, social, and cultural contexts shape cooperation—and which strategies build bridges across boundaries.', 'The prisoner’s dilemma captures the tension between individual gain and mutual benefit when two players choose to cooperate or defect.'],
  ['信任、互惠、声誉与重复互动如何将个体选择转化为稳定合作。', '生态、社会与文化情境如何塑造合作，以及哪些策略能够跨越边界建立连接。', '囚徒困境呈现了两名参与者在选择合作或背叛时，个体收益与共同利益之间的张力。']
];
addLanguageList('.research-card .game-type', ['PUBLIC GOODS GAME · REPEATED ROUND', 'SAME TASK · DIFFERENT CULTURAL CONTEXTS', 'PRISONER’S DILEMMA']);
languageTargets.at(-1).values = [['PUBLIC GOODS GAME · REPEATED ROUND', 'SAME TASK · DIFFERENT CULTURAL CONTEXTS', 'PRISONER’S DILEMMA'], ['公共物品博弈 · 重复轮次', '同一任务 · 不同文化情境', '囚徒困境']];
addLanguageList('.pg-caption', ['CONTRIBUTE', 'CONTRIBUTE', 'CONTRIBUTE', 'CONTRIBUTE']);
languageTargets.at(-1).values = [['CONTRIBUTE', 'CONTRIBUTE', 'CONTRIBUTE', 'CONTRIBUTE'], ['贡献', '贡献', '贡献', '贡献']];
addLanguageTarget('.pg-pool text:first-of-type', 'PUBLIC POOL', '公共池');
addLanguageList('.experiment-result span', ['INDIVIDUAL COST', 'GROUP BENEFIT', 'ILLUSTRATIVE TRIAL', 'TEST STRATEGIES']);
languageTargets.at(-1).values = [['INDIVIDUAL COST', 'GROUP BENEFIT', 'ILLUSTRATIVE TRIAL', 'TEST STRATEGIES'], ['个体成本', '群体收益', '示例试次', '检验策略']];
addLanguageList('.experiment-result strong', ['CONTRIBUTE → MULTIPLY → SHARE', 'COMPARE NORMS &amp; CONTEXT']);
languageTargets.at(-1).values = [['CONTRIBUTE → MULTIPLY → SHARE', 'COMPARE NORMS &amp; CONTEXT'], ['贡献 → 增值 → 分享', '比较规范与情境']];
addLanguageList('.trial-name', ['CONTEXT A', 'CONTEXT B']);
languageTargets.at(-1).values = [['CONTEXT A', 'CONTEXT B'], ['情境 A', '情境 B']];
addLanguageList('.trial-pool b', ['POOL', 'POOL']);
languageTargets.at(-1).values = [['POOL', 'POOL'], ['公共池', '公共池']];
addLanguageList('.choice-meter span', ['COOPERATIVE CHOICES', 'COOPERATIVE CHOICES']);
languageTargets.at(-1).values = [['COOPERATIVE CHOICES', 'COOPERATIVE CHOICES'], ['合作选择', '合作选择']];
addLanguageTarget('.same-task span', 'SAME<br />GAME', '同一<br />博弈');
addLanguageList('.payoff small', ['MUTUAL TRUST', 'EXPLOITED', 'TEMPTATION', 'MUTUAL LOSS']);
languageTargets.at(-1).values = [['MUTUAL TRUST', 'EXPLOITED', 'TEMPTATION', 'MUTUAL LOSS'], ['相互信任', '被利用', '诱惑', '共同损失']];

addLanguageTarget('#methods .section-index', '02 / How we work', '02 / 工作方式');
addLanguageTarget('#methods h2', 'Multiple methods.<br /><em>One human question.</em>', '多种方法。<br /><em>同一个人类问题。</em>');
addLanguageList('.method-list h3', ['Economic Game Experiments', 'Cross-National Behavioral Studies', 'Surveys &amp; Interventions', 'Meta-Analysis']);
languageTargets.at(-1).values = [['Economic Game Experiments', 'Cross-National Behavioral Studies', 'Surveys &amp; Interventions', 'Meta-Analysis'], ['经济博弈实验', '跨国行为研究', '问卷与干预', '元分析']];
addLanguageList('.method-list p', ['Controlled tests of trust, fairness, punishment, reciprocity, and collective action.', 'Coordinated experiments comparing behavior across cultural and institutional settings.', 'Measuring beliefs, norms, identities, and strategies that promote cooperation.', 'Synthesizing global evidence to identify robust patterns and boundary conditions.']);
languageTargets.at(-1).values = [['Controlled tests of trust, fairness, punishment, reciprocity, and collective action.', 'Coordinated experiments comparing behavior across cultural and institutional settings.', 'Measuring beliefs, norms, identities, and strategies that promote cooperation.', 'Synthesizing global evidence to identify robust patterns and boundary conditions.'], ['对信任、公平、惩罚、互惠与集体行动进行受控检验。', '在不同文化与制度情境中开展协调一致的行为比较实验。', '测量信念、规范、身份与促进合作的策略。', '综合全球证据，识别稳定模式及其边界条件。']];

addLanguageTarget('#publications .section-index', '03 / Selected work', '03 / 代表性成果');
addLanguageTarget('#publications h2', 'Research<br /><em>in motion</em>', '研究<br /><em>持续发生</em>');
addLanguageTarget('#publications .button-dark', 'All publications <span>↗</span>', '全部成果 <span>↗</span>');
addLanguageList('.project-list article > div > p', ['Nature Human Behaviour · Cross-national study', 'Journal of Personality and Social Psychology · Meta-analysis', 'Journal of Experimental Social Psychology · Experiment', 'Journal of Personality and Social Psychology · Meta-analysis']);
languageTargets.at(-1).values = [['Nature Human Behaviour · Cross-national study', 'Journal of Personality and Social Psychology · Meta-analysis', 'Journal of Experimental Social Psychology · Experiment', 'Journal of Personality and Social Psychology · Meta-analysis'], ['Nature Human Behaviour · 跨国研究', '人格与社会心理学杂志 · 元分析', '实验社会心理学杂志 · 实验研究', '人格与社会心理学杂志 · 元分析']];
addLanguageList('.project-list article h3', ['Honour, competition and cooperation across 13 societies', 'Institutions and cooperation: A meta-analysis of structural features in social dilemmas', 'Conflict, cooperation, and institutional choice', 'Cross-cultural variation in cooperation: A meta-analysis']);
languageTargets.at(-1).values = [['Honour, competition and cooperation across 13 societies', 'Institutions and cooperation: A meta-analysis of structural features in social dilemmas', 'Conflict, cooperation, and institutional choice', 'Cross-cultural variation in cooperation: A meta-analysis'], ['荣誉、竞争与合作：13个社会中的跨国研究', '制度与合作：社会困境中结构性特征的元分析', '冲突、合作与制度选择', '合作的跨文化差异：元分析']];
addLanguageTarget('.featured .project-arrow', '↗', '↗');

addLanguageTarget('.people .section-index', '04 / Principal investigator', '04 / 首席研究员');
addLanguageTarget('.people .pi-title', 'Principal Investigator · Researcher · Doctoral Supervisor', '首席研究员 · 研究员 · 博士生导师');
addLanguageTarget('.people-copy > p:nth-of-type(2)', 'Dr. Jin studies cooperation, social norms, and cultural variation through behavioral experiments and global evidence synthesis.', '金老师通过行为实验与全球证据综合，研究合作、社会规范与文化差异。');
addLanguageTarget('.profile-open', 'Learn more about Dr. Jin <span>↗</span>', '了解金老师 <span>↗</span>');
addLanguageTarget('.journey-head span:first-child', 'ACADEMIC JOURNEY', '学术旅程');
addLanguageTarget('.profile-preview', 'Explore her academic journey and research profile.', '了解她的学术经历与研究方向。');

addLanguageTarget('.members .section-index', '05 / Lab members', '05 / 实验室成员');
addLanguageTarget('.members-heading h2', 'Different paths.<br /><em>Shared questions.</em>', '不同路径。<br /><em>共同问题。</em>');
addLanguageTarget('.members-heading > p', 'Our members bring perspectives from psychology, behavioral science, and international academic communities.', '成员们从心理学、行为科学与国际学术社群中带来多元视角。');
addLanguageList('.member-info p', ['Peking University', 'École Normale Supérieure, Paris', 'Peking University']);
languageTargets.at(-1).values = [['Peking University', 'École Normale Supérieure, Paris', 'Peking University'], ['北京大学', '巴黎高等师范学院', '北京大学']];
addLanguageList('.member-info span', ['Undergraduate · 2023 Cohort', 'First-Year PhD Student', 'Second-Year Undergraduate']);
languageTargets.at(-1).values = [['Undergraduate · 2023 Cohort', 'First-Year PhD Student', 'Second-Year Undergraduate'], ['本科生 · 2023级', '博士一年级', '本科生二年级']];

addLanguageTarget('.join .section-index', '06 / Join the Lab', '06 / 加入实验室');
addLanguageTarget('.join h2', 'New questions need<br /><em>new collaborators.</em>', '新问题需要<br /><em>新的合作者。</em>');
addLanguageTarget('.join-content > p:nth-of-type(2)', 'We welcome postdoctoral researchers, PhD and master’s students, and research assistants with strong interests in decision-making, social psychology, and cross-cultural psychology. Applicants from computer science, life sciences, economics, management, sociology, anthropology, and other disciplines are especially encouraged.', '我们欢迎对决策、社会心理学与跨文化心理学有浓厚兴趣的博士后、博士生、硕士生与科研助理。我们尤其欢迎来自计算机科学、生命科学、经济学、管理学、社会学、人类学及其他学科的申请者。');
addLanguageTarget('.join-note', 'Prospective direct-entry PhD students are advised to contact Dr. Jin before May of the application year.', '计划直接攻读博士的申请者，建议在申请当年5月前联系金老师。');
addLanguageTarget('.join-actions .button-light', 'Contact Dr. Jin <span>↗</span>', '联系金老师 <span>↗</span>');
addLanguageTarget('.join-actions .text-link', 'School website <span>→</span>', '学院网站 <span>→</span>');

addLanguageTarget('.footer-brand strong', 'COOPERATION &amp; SOCIOCULTURAL LAB', '合作与社会文化实验室');
addLanguageTarget('.footer-brand p', 'Behavioral Science<br />Cooperation · Norms · Culture', '行为科学<br />合作 · 规范 · 文化');
addLanguageList('footer > div:nth-child(2) a', ['News', 'Research', 'Methods', 'People']);
languageTargets.at(-1).values = [['News', 'Research', 'Methods', 'People'], ['新闻', '研究', '方法', '成员']];
addLanguageTarget('footer > div:nth-child(2) > span', 'Explore', '探索');
addLanguageTarget('footer > div:nth-child(3) > span', 'Connect', '联系');
addLanguageTarget('.copyright', '© 2026 Cooperation and Sociocultural Lab<br />All rights reserved.', '© 2026 合作与社会文化实验室<br />版权所有');

addLanguageTarget('.profile-close', '×', '×');
addLanguageTarget('.profile-dialog .section-index', 'Principal Investigator', '首席研究员');
addLanguageTarget('#profile-dialog-title', 'Shuxian <em>Jin</em>', '金淑娴');
addLanguageTarget('.profile-dialog .pi-title', 'Researcher · Doctoral Supervisor · Peking University', '研究员 · 博士生导师 · 北京大学');
addLanguageTarget('.profile-dialog-grid h3', 'Background', '个人经历');
addLanguageList('.profile-dialog-grid > div > p', [
  'Dr. Shuxian Jin joined the School of Psychological and Cognitive Sciences at Peking University in March 2026. She received her PhD in Experimental and Applied Psychology from Vrije Universiteit Amsterdam in 2023, following an MSc in Social Psychology from Nankai University in 2018 and a BSc in Human Resource Management from Capital University of Economics and Business in 2016.',
  'From 2022 to 2026, she conducted postdoctoral research at the School of Psychology and the Centre for Culture and Social Diversity, University of Sussex.',
  'Her research has appeared in <em>Nature Human Behaviour</em>, <em>Journal of Personality and Social Psychology</em>, and <em>Journal of Experimental Social Psychology</em>, among other journals.'
]);
languageTargets.at(-1).values = [
  ['Dr. Shuxian Jin joined the School of Psychological and Cognitive Sciences at Peking University in March 2026. She received her PhD in Experimental and Applied Psychology from Vrije Universiteit Amsterdam in 2023, following an MSc in Social Psychology from Nankai University in 2018 and a BSc in Human Resource Management from Capital University of Economics and Business in 2016.', 'From 2022 to 2026, she conducted postdoctoral research at the School of Psychology and the Centre for Culture and Social Diversity, University of Sussex.', 'Her research has appeared in <em>Nature Human Behaviour</em>, <em>Journal of Personality and Social Psychology</em>, and <em>Journal of Experimental Social Psychology</em>, among other journals.'],
  ['2026年3月，金淑娴加入北京大学心理与认知科学学院。她于2023年获得阿姆斯特丹自由大学实验与应用心理学博士学位，此前于2018年获得南开大学社会心理学硕士学位，并于2016年获得首都经济贸易大学人力资源管理学学士学位。', '2022年至2026年，她在萨塞克斯大学心理学院及文化与社会多样性中心开展博士后研究。', '她的研究成果发表于 <em>Nature Human Behaviour</em>、<em>Journal of Personality and Social Psychology</em>、<em>Journal of Experimental Social Psychology</em> 等期刊。']
];
addLanguageList('.profile-dialog dl dt', ['Research', 'Methods', 'Academic service', 'Contact']);
languageTargets.at(-1).values = [['Research', 'Methods', 'Academic service', 'Contact'], ['研究方向', '研究方法', '学术服务', '联系方式']];
addLanguageList('.profile-dialog dl dd', [
  'Cooperation and norm formation, cross-cultural variation, and evidence-based strategies that promote cooperation.',
  'Economic game experiments, cross-national behavioral experiments and surveys, and meta-analysis.',
  'Editorial Board Member, <em>Asian Journal of Social Psychology</em>; Guest Editor, <em>Journal of Experimental Social Psychology</em>; reviewer for leading international journals.',
  's.jin@pku.edu.cn<br />Wang Kezhen Building, Peking University, Beijing 100871'
]);
languageTargets.at(-1).values = [
  ['Cooperation and norm formation, cross-cultural variation, and evidence-based strategies that promote cooperation.', 'Economic game experiments, cross-national behavioral experiments and surveys, and meta-analysis.', 'Editorial Board Member, <em>Asian Journal of Social Psychology</em>; Guest Editor, <em>Journal of Experimental Social Psychology</em>; reviewer for leading international journals.', 's.jin@pku.edu.cn<br />Wang Kezhen Building, Peking University, Beijing 100871'],
  ['合作与规范形成、跨文化差异，以及促进合作的循证策略。', '经济博弈实验、跨国行为实验与问卷调查，以及元分析。', '《亚洲社会心理学杂志》编委；《实验社会心理学杂志》客座编辑；担任多本国际期刊审稿人。', 's.jin@pku.edu.cn<br />北京大学王克桢楼，北京 100871']
];

function applyLanguage(lang) {
  currentLanguage = lang === 'zh' ? 'zh' : 'en';
  localStorage.setItem('jin-lab-language', currentLanguage);
  document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
  document.body.dataset.language = currentLanguage;
  languageTargets.forEach(({ selector, values }) => {
    const nodes = Array.from(document.querySelectorAll(selector));
    const content = values[currentLanguage === 'zh' ? 1 : 0];
    if (Array.isArray(content)) {
      nodes.forEach((node, index) => { if (content[index] !== undefined) node.innerHTML = content[index]; });
    } else {
      nodes.forEach(node => { node.innerHTML = content; });
    }
  });
  document.title = currentLanguage === 'zh' ? '合作与社会文化实验室 — 合作、规范与文化' : 'Cooperation and Sociocultural Lab — Cooperation, Norms & Culture';
  const description = $('meta[name="description"]');
  if (description) description.content = currentLanguage === 'zh' ? '合作与社会文化实验室通过行为科学研究合作、社会规范与文化。' : 'Cooperation and Sociocultural Lab studies cooperation, social norms, and culture through behavioral science.';
  if (languageToggle) {
    languageToggle.setAttribute('aria-pressed', String(currentLanguage === 'zh'));
    languageToggle.setAttribute('aria-label', currentLanguage === 'zh' ? 'Switch to English' : '切换到中文');
    $('.language-option-zh', languageToggle)?.classList.toggle('is-active', currentLanguage === 'zh');
    $('.language-option-en', languageToggle)?.classList.toggle('is-active', currentLanguage === 'en');
  }
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { language: currentLanguage } }));
}

languageToggle?.addEventListener('click', () => applyLanguage(currentLanguage === 'en' ? 'zh' : 'en'));
applyLanguage(currentLanguage);
