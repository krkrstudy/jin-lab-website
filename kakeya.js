import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// A finite direction study inspired by Kakeya geometry, with screen-facing labels.
const concepts = [
  ['cooperation','合作','cooperation'], ['cooperative behavior','合作行为','cooperation'], ['conditional cooperation','条件合作','cooperation'], ['mutual cooperation','相互合作','cooperation'],
  ['trust','信任','exchange'], ['reciprocity','互惠','exchange'], ['fairness','公平','exchange'], ['reputation','声誉','exchange'], ['punishment','惩罚','exchange'], ['public goods','公共物品','exchange'],
  ['group identity','群体认同','groups'], ['cross-cultural','跨文化','groups'], ['social influence','社会影响','groups'], ['intergroup conflict','群际冲突','groups'],
  ['empathy','共情','emotion'], ['emotion','情绪','emotion'], ['guilt','内疚','emotion'], ['compassion','同情','emotion'],
  ['decision making','决策','cognition'], ['beliefs','信念','cognition'], ['social learning','社会学习','cognition'], ['motivation','动机','cognition'],
  ['social norms','社会规范','systems'], ['collective action','集体行动','systems'], ['social dilemmas','社会困境','systems'], ["prisoner’s dilemma",'囚徒困境','systems'], ['cultural evolution','文化演化','systems'], ['economic games','经济博弈','systems'],
  ["contribution", "贡献", "exchange"],
  ["communication", "沟通", "emotion"],
  ["preferences", "偏好", "cognition"],
  ["conflict", "冲突", "emotion"],
  ["competition", "竞争", "systems"],
  ["reward", "奖励", "exchange"],
  ["power", "权力", "groups"],
  ["incentives", "激励", "exchange"],
  ["expectations", "预期", "cognition"],
  ["defection", "背叛", "exchange"],
  ["uncertainty", "不确定性", "cognition"],
  ["altruism", "利他主义", "systems"],
  ["personality", "人格", "cognition"],
  ["risk", "风险", "cognition"],
  ["sanctions", "制裁", "exchange"],
  ["learning", "学习", "cognition"],
  ["coordination", "协调", "systems"],
  ["status", "地位", "groups"],
  ["group size", "群体规模", "groups"],
  ["network", "网络", "systems"],
  ["outgroup", "外群体", "groups"],
  ["leadership", "领导力", "groups"],
  ["social preferences", "社会偏好", "systems"],
  ["memory", "记忆", "cognition"],
  ["prosocial behavior", "亲社会行为", "exchange"],
  ["anger", "愤怒", "emotion"],
  ["cooperation rates", "合作率", "cooperation"],
  ["free riding", "搭便车", "exchange"],
  ["social value orientation", "社会价值取向", "cognition"],
  ["perception", "知觉", "cognition"],
  ["dictator game", "独裁者博弈", "systems"],
  ["attention", "注意", "cognition"],
  ["interdependence", "相互依赖", "cognition"],
  ["responsibility", "责任", "systems"],
  ["anxiety", "焦虑", "emotion"],
  ["peer punishment", "同伴惩罚", "exchange"],
  ["ultimatum game", "最后通牒博弈", "systems"],
  ["trust game", "信任博弈", "systems"],
  ["indirect reciprocity", "间接互惠", "exchange"],
  ["honesty", "诚实", "systems"],
  ["shame", "羞耻", "emotion"],
  ["self-control", "自我控制", "cognition"],
  ["social identity", "社会认同", "groups"],
  ["ingroup favoritism", "内群体偏好", "groups"],
  ["attachment", "依恋", "emotion"],
  ["resource dilemmas", "资源困境", "systems"],
  ["humility", "谦逊", "systems"],
  ["exclusion", "排斥", "groups"],
  ["antisocial punishment", "反社会惩罚", "exchange"],
  ["generosity", "慷慨", "systems"],
  ["altruistic punishment", "利他性惩罚", "exchange"],
  ["interpersonal trust", "人际信任", "emotion"],
  ["diversity", "多样性", "groups"],
  ["coalition", "联盟", "groups"],
  ["negotiation", "协商", "cognition"],
  ["discrimination", "歧视", "groups"],
  ["strong reciprocity", "强互惠", "exchange"],
  ["norm enforcement", "规范执行", "systems"],
  ["conformity", "从众", "groups"],
  ["social distance", "社会距离", "groups"],
  ["hierarchy", "等级", "groups"],
  ["envy", "嫉妒", "emotion"],
  ["stereotypes", "刻板印象", "groups"],
  ["other-regarding preferences", "他涉偏好", "systems"],
  ["partner choice", "伙伴选择", "cognition"],
  ["behavioral economics", "行为经济学", "systems"],
  ["inclusion", "包容", "groups"],
  ["accountability", "问责", "systems"],
  ["self-esteem", "自尊", "cognition"],
  ["well-being", "幸福感", "emotion"],
  ["social support", "社会支持", "emotion"],
  ["procedural justice", "程序公正", "systems"],
  ["negative affect", "负性情感", "emotion"],
  ["moral judgment", "道德判断", "cognition"],
  ["moral emotions", "道德情绪", "emotion"],
  ["norm compliance", "规范遵从", "exchange"],
  ["loneliness", "孤独感", "emotion"],
  ["costly signaling", "代价信号", "systems"],
  ["common-pool resources", "公共池资源", "systems"],
  ["collective efficacy", "集体效能", "systems"],
  ["belonging", "归属感", "emotion"],
  ["institutional trust", "制度信任", "systems"],
  ["fairness norms", "公平规范", "exchange"],
  ["cooperation dynamics", "合作动态", "cooperation"],
  ["prejudice", "偏见", "groups"],
  ["positive affect", "正性情感", "emotion"],
  ["polarization", "极化", "systems"],
  ["civic cooperation", "公民合作", "cooperation"]
].map(([en,zh,category],index) => ({en,zh,category,index}));
const categories = {
  cooperation:{color:'#ffc69a',en:'Cooperation',zh:'合作'},
  exchange:{color:'#f4d58b',en:'Exchange',zh:'互惠'},
  groups:{color:'#a9d8ed',en:'Groups',zh:'群体'},
  emotion:{color:'#f2b5c8',en:'Emotion',zh:'情绪'},
  cognition:{color:'#d5c7f5',en:'Cognition',zh:'认知'},
  systems:{color:'#9ae0d0',en:'Norms & systems',zh:'规范与制度'}
};
const stage = document.querySelector('#kakeya-stage');
const labels = document.querySelector('#kakeya-labels');
const topics = document.querySelector('#kakeya-topics');
const fallback = document.querySelector('#kakeya-fallback');
let zh = document.documentElement.lang.startsWith('zh');
let filter = 'all';
let selected = null;
let controls;
let reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motion = document.querySelector('#kakeya-motion');
const reset = document.querySelector('#kakeya-reset');
document.querySelector('.kakeya-controls').addEventListener('pointerdown', event => event.stopPropagation());
const readout = document.createElement('div');
readout.className = 'kakeya-readout';
readout.setAttribute('aria-live','polite');
stage.append(readout);
const picker = document.createElement('select');
picker.className = 'kakeya-picker';
picker.setAttribute('aria-label', zh ? '选择概念' : 'Choose a concept');
topics.after(picker);
const labelText = item => zh ? item.zh : item.en;
const labelNodes = concepts.map(item => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'kakeya-word';
  button.style.setProperty('--term-color',categories[item.category].color);
  button.textContent = labelText(item);
  // The select offers every term to keyboard and assistive technology users.
  button.tabIndex = -1;
  button.setAttribute('aria-hidden','true');
  button.addEventListener('pointerdown', event => event.stopPropagation());
  button.addEventListener('click', () => selectConcept(item.index));
  labels.append(button);
  return button;
});
function renderTopics() {
  topics.innerHTML = ['all',...Object.keys(categories)].map(key => `<button type="button" data-topic="${key}" aria-pressed="${filter === key}" style="--topic-color:${categories[key]?.color || '#f1e8df'}">${key === 'all' ? (zh ? '全部' : 'All') : categories[key][zh ? 'zh' : 'en']}</button>`).join('');
  picker.innerHTML = `<option value="">${zh ? '选择概念' : 'Choose a concept'}</option>` + concepts.filter(item => filter === 'all' || item.category === filter).map(item => `<option value="${item.index}">${labelText(item)}</option>`).join('');
  if (selected !== null) picker.value = String(selected);
  picker.setAttribute('aria-label',zh ? '选择概念' : 'Choose a concept');
}
function syncLanguage() {
  labelNodes.forEach((node,index) => node.textContent = labelText(concepts[index]));
  motion.textContent = controls?.autoRotate ? (zh ? '暂停' : 'Pause') : (zh ? '继续' : 'Play');
  motion.setAttribute('aria-pressed',String(!!controls?.autoRotate));
  reset.textContent = zh ? '重置' : 'Reset';
  topics.setAttribute('aria-label', zh ? '概念分类' : 'Concept categories');
  document.querySelector('#kakeya-canvas').setAttribute('aria-label', zh ? '三维立方体方向图，可拖动旋转、双指缩放' : 'Three-dimensional Cube Gate. Drag to rotate; pinch or scroll to zoom.');
  renderTopics();
  updateReadout();
}
function updateReadout() {
  const item = concepts[selected];
  readout.hidden = !item;
  if (item) {
    readout.style.setProperty('--term-color',categories[item.category].color);
    readout.textContent = `${labelText(item)} · ${categories[item.category][zh ? 'zh' : 'en']}`;
  }
}
function selectConcept(index) {
  selected = index;
  if (controls) controls.autoRotate = false;
  syncLanguage();
  refreshLines();
}
let refreshLines = () => {};
topics.addEventListener('click', event => {
  const button = event.target.closest('[data-topic]');
  if (!button) return;
  filter = button.dataset.topic;
  selected = null;
  renderTopics();updateReadout();refreshLines();
});
picker.addEventListener('change', () => {
  if (picker.value !== '') selectConcept(Number(picker.value));
  else { selected = null;updateReadout();refreshLines(); }
});
document.addEventListener('languagechange', event => { zh = event.detail.language === 'zh';syncLanguage(); });
syncLanguage();
try {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#241b19');
  const camera = new THREE.PerspectiveCamera(42,1,.1,50);
  const renderer = new THREE.WebGLRenderer({canvas:document.querySelector('#kakeya-canvas'),antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  controls = new OrbitControls(camera,stage);
  controls.enableDamping = true;controls.dampingFactor = .07;
  controls.enablePan = false;controls.minDistance = 5.5;controls.maxDistance = 16;
  controls.autoRotate = !reduced.matches;controls.autoRotateSpeed = .22;
  const field = new THREE.Group();scene.add(field);
  field.rotation.set(.06,.24,-.08);
  function boxEdges(size,color,opacity) {
    const geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(size,size,size));
    const edges = new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity}));
    field.add(edges);return edges;
  }
  boxEdges(4.4,'#af8f76',.25);
  boxEdges(1.05,'#fff1dc',.88);
  boxEdges(.68,'#ffd0a9',.3);
  const cube = new THREE.Mesh(new THREE.BoxGeometry(1.05,1.05,1.05),new THREE.MeshBasicMaterial({color:'#f1be95',transparent:true,opacity:.025,depthWrite:false}));
  field.add(cube);
  const positions = [];
  const rays = concepts.map((item,i) => {
    const directionTotal = i < 28 ? 28 : concepts.length;
    const y = (i+.5)/directionTotal;
    const r = Math.sqrt(1-y*y);
    const theta = Math.PI*(3-Math.sqrt(5))*i;
    const direction = new THREE.Vector3(Math.cos(theta)*r,y,Math.sin(theta)*r);
    const center = new THREE.Vector3(.13*Math.sin(i*2.9),.13*Math.cos(i*1.3),.13*Math.sin(i*1.7));
    const start = direction.clone().multiplyScalar(-2.0).add(center);
    const end = direction.clone().multiplyScalar(2.0).add(center);
    const ray = new THREE.Line(new THREE.BufferGeometry().setFromPoints([start,end]),new THREE.LineBasicMaterial({color:categories[item.category].color,transparent:true,opacity:.26}));
    field.add(ray);
    // Distribute labels over both ends, away from the dense central gate.
    const anchor = (i % 2 ? start : end).clone();
    positions.push(anchor);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.025,8,8),new THREE.MeshBasicMaterial({color:categories[item.category].color}));
    dot.position.copy(anchor);field.add(dot);
    return {ray,dot};
  });
  refreshLines = () => rays.forEach(({ray,dot},index) => {
    const included = filter === 'all' || concepts[index].category === filter;
    ray.material.opacity = selected === index ? .95 : (included ? (index < 28 ? (selected === null ? .3 : .12) : .025) : .015);
    dot.material.transparent = true;
    dot.material.opacity = selected === index ? 1 : (included && index < 28 ? 1 : 0);
    dot.scale.setScalar(selected === index ? 2.2 : 1);
  });
  let width = 0,height = 0,inView = false;
  const world = new THREE.Vector3();
  const projected = new THREE.Vector3();
  function placeLabels() {
    field.updateWorldMatrix(true,false);camera.updateMatrixWorld();
    labelNodes.forEach(node => node.style.visibility = 'hidden');
    const candidates = concepts.filter(item => (item.index < 28 || item.index === selected) && (filter === 'all' || item.category === filter)).map(item => {
      world.copy(positions[item.index]);field.localToWorld(world);
      projected.copy(world).project(camera);
      return {item,x:(projected.x*.5+.5)*width,y:(-.5*projected.y+.5)*height,z:projected.z};
    }).sort((a,b) => a.item.index === selected ? -1 : b.item.index === selected ? 1 : a.z-b.z);
    const occupied = [];
    const maximum = width < 450 ? 10 : 15;
    for (const point of candidates) {
      if (point.z > 1 || point.z < -1 || occupied.length >= maximum) continue;
      const node = labelNodes[point.item.index];
      const w = node.offsetWidth,h = node.offsetHeight;
      const x = Math.max(w/2+12,Math.min(width-w/2-12,point.x));
      const y = Math.max(74+h/2,Math.min(height-(selected === null ? 58 : readout.offsetHeight+40)-h/2,point.y));
      const rect = {left:x-w/2-6,right:x+w/2+6,top:y-h/2-5,bottom:y+h/2+5};
      if (occupied.some(other => rect.left<other.right && rect.right>other.left && rect.top<other.bottom && rect.bottom>other.top)) continue;
      occupied.push(rect);
      node.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      node.style.visibility = 'visible';
      node.classList.toggle('is-selected',selected === point.item.index);
    }
  }
  function resetView() {
    const distance = width < 450 ? 10.8 : 8.3;
    camera.position.set(distance*.09,distance*.16,distance);
    controls.target.set(0,0,0);controls.update();
  }
  function resize() {
    width = stage.clientWidth;height = stage.clientHeight;
    camera.aspect = width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
    resetView();
  }
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(entries => {inView = entries[0].isIntersecting;},{rootMargin:'120px'}).observe(stage);
  motion.addEventListener('click', () => {controls.autoRotate = !controls.autoRotate;syncLanguage();});
  reset.addEventListener('click', () => {selected = null;filter = 'all';resetView();controls.autoRotate = !reduced.matches;syncLanguage();refreshLines();});
  reduced.addEventListener('change', () => {controls.autoRotate = !reduced.matches;syncLanguage();});
  controls.addEventListener('start', () => {controls.autoRotate = false;syncLanguage();});
  renderer.domElement.addEventListener('webglcontextlost',event => {event.preventDefault();fallback.classList.add('visible');});
  renderer.domElement.addEventListener('webglcontextrestored',() => fallback.classList.remove('visible'));
  resize();refreshLines();syncLanguage();
  // Render only while the visualization is visible and the tab is active.
  renderer.setAnimationLoop(() => {
    if (!inView || document.hidden) return;
    controls.update();renderer.render(scene,camera);placeLabels();
  });
} catch (error) {
  console.error('Cube Gate:',error);fallback.classList.add('visible');
}
