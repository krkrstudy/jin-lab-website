/* Names and portraits are paired explicitly; omitted biography fields stay omitted. */
const labMembers = [
  { id: 'dou-ziwei', name: ['Dou Ziwei', '窦子为'], photo: 'dou-ziwei', position: '70% 34%',
    research: ['Social cognition and decision-making; artificial intelligence.', '社会认知与决策、人工智能。'],
    beyond: ['Films, street dance, photography, travel, and just about every sport—enthusiasm often exceeds skill.', '电影、街舞、摄影、一切运动（人菜瘾大）、旅行。'] },
  { id: 'liao-yufang', name: ['Liao Yufang', '廖羽芳'], photo: 'liao-yufang', position: '50% 53%',
    research: ['My current research examines how a culture of empathy affects relations between opposing groups, and how interventions can improve those relations. I am also interested in how emotions, morality, social norms, and motivated reasoning shape people’s views and social participation.', '目前关注共情文化对对立群体关系的影响，以及相关干预的设计。同时，也对情绪、道德、社会规范和动机性推理如何影响个体的观念形成与社会参与感兴趣。'],
    beyond: ['Hiking, climbing, photography, stargazing, and gaming. I’m an experience-seeker who prefers to leave room for spontaneity, and hopes to explore as much of the world’s diversity as life allows.', '喜欢徒步、攀岩、摄影、看星星和打游戏。体验型P人，希望自己能在有限的人生里，探索世界的多样性。'] },
  { id: 'zhang-jue', name: ['Zhang Jue', '张珏'], photo: 'zhang-jue', position: '50% 40%',
    research: ['Social and cross-cultural psychology. Why are we the way we are, and what influences us to become the way we are?', '社会心理学、跨文化心理学。我们为什么会成为现在的自己，又有哪些因素影响着这一过程？'],
    beyond: ['Football, Arsenal, Australian rules football, and music.', '足球、阿森纳、澳式橄榄球、音乐。'],
    quote: ['You can do anything you set your mind to.', 'You can do anything you set your mind to.'] },
  { id: 'deng-yujia', name: ['Deng Yujia', '邓雨佳'], photo: 'deng-yujia', position: '33% 40%',
    quote: ['Je pense, donc je suis.', 'Je pense, donc je suis。'], quoteLang: 'fr' },
  { id: 'gao-qi', name: ['Gao Qi', '高奇'], photo: 'gao-qi', position: '50% 63%',
    research: ['Prosocial behavior, cultural psychology, and social decision-making.', '亲社会行为、文化心理学、社会决策。'], beyond: ['Football.', '足球。'] },
  { id: 'wang-kairan', name: ['Wang Kairan', '王慨然'], photo: 'wang-kairan', position: '50% 72%',
    affiliation: ['Peking University · Undergraduate, 2023 cohort', '北京大学 · 本科生，2023级'],
    research: ['I use evolutionary game theory and computational modeling to study cooperation and competition at different levels.', '利用演化博弈论、计算建模等方式，探究不同层次的合作与竞争。'],
    beyond: ['Sport—football, basketball, table tennis, and badminton—as well as music and photography.', '运动（足球、篮球、乒乓球、羽毛球）、音乐、摄影。'] },
];
(() => {
  const grid = document.querySelector('#member-grid');
  const dialog = document.querySelector('#member-dialog');
  const detail = document.querySelector('#member-detail');
  const close = dialog.querySelector('.member-close');
  let language = document.documentElement.lang.startsWith('zh') ? 1 : 0;
  let activeId = null;
  const text = pair => pair?.[language] || '';
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function portrait(member, full = false) {
    return member.photo ? `<img src="assets/members/${member.photo}.webp" alt="${escape(text(member.name))}" ${full ? '' : 'loading="lazy"'} width="800" height="1000" style="object-position:${member.position}">` : `<span class="member-placeholder" aria-hidden="true">${member.initials}</span>`;
  }
  function renderCards() {
    grid.innerHTML = labMembers.map(member => `<button class="member-card" type="button" data-member="${member.id}" aria-haspopup="dialog" aria-controls="member-dialog" aria-label="${escape(language ? `查看${text(member.name)}的个人介绍` : `Read ${text(member.name)}’s profile`)}"><span class="member-cover">${portrait(member)}</span><span class="member-card-name">${escape(text(member.name))}<span aria-hidden="true"><svg class="ui-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14"/></svg></span></span></button>`).join('');
  }
  function renderDetail() {
    const member = labMembers.find(item => item.id === activeId);
    if (!member) return;
    const labels = language ? {research:'研究兴趣', beyond:'科研之外', quote:'个人分享'} : {research:'Research interests', beyond:'Beyond research', quote:'A thought to share'};
    detail.innerHTML = `<div class="member-detail-heading"><div><p class="section-index">${language ? '认识团队' : 'Meet the team'}</p><h2 id="member-dialog-title">${escape(text(member.name))}</h2>${member.alternate ? `<p class="member-alternate">${escape(text(member.alternate))}</p>` : ''}${member.affiliation ? `<p class="member-affiliation">${escape(text(member.affiliation))}</p>` : ''}</div>${member.photo ? `<div class="member-detail-photo">${portrait(member, true)}</div>` : ''}</div>` + ['research','beyond','quote'].filter(key => member[key]).map(key => `<section class="member-detail-section"><h3>${labels[key]}</h3>${key === 'quote' ? `<blockquote lang="${member.quoteLang || 'en'}">${escape(text(member[key]))}</blockquote>` : `<p>${escape(text(member[key]))}</p>`}</section>`).join('');
    close.setAttribute('aria-label', language ? '关闭个人介绍' : 'Close profile');
  }
  grid.addEventListener('click', event => {
    const card = event.target.closest('[data-member]');
    if (!card) return;
    activeId = card.dataset.member;
    renderDetail();
    dialog.showModal();
    document.body.classList.add('member-dialog-open');
    dialog.scrollTop = 0;
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('member-dialog-open'));
  document.addEventListener('languagechange', event => {
    language = event.detail.language === 'zh' ? 1 : 0;
    renderCards();
    if (dialog.open) renderDetail();
  });
  renderCards();
})();
