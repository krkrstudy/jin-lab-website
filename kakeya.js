import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("#kakeya-canvas");
const stage = document.querySelector("#kakeya-stage");
const motionButton = document.querySelector("#kakeya-motion");
const resetButton = document.querySelector("#kakeya-reset");
const fallback = document.querySelector("#kakeya-fallback");

if (canvas && stage) {
  try {
    const terms = [
      ["cooperation",2583,"cooperation"],["punishment",787,"exchange"],["public goods",601,"exchange"],
      ["contribution",483,"exchange"],["trust",463,"exchange"],["prisoner's dilemma",419,"systems"],
      ["communication",354,"emotion"],["preferences",291,"cognition"],["reciprocity",227,"exchange"],
      ["conflict",223,"emotion"],["competition",200,"systems"],["social dilemmas",192,"systems"],
      ["reward",183,"exchange"],["cooperative behavior",172,"cooperation"],["power",170,"groups"],
      ["incentives",169,"exchange"],["expectations",159,"cognition"],["beliefs",157,"cognition"],
      ["defection",151,"exchange"],["uncertainty",144,"cognition"],["altruism",143,"systems"],
      ["personality",138,"cognition"],["reputation",136,"exchange"],["fairness",122,"exchange"],
      ["risk",120,"cognition"],["sanctions",113,"exchange"],["learning",111,"cognition"],
      ["coordination",98,"systems"],["status",95,"groups"],["group size",93,"groups"],
      ["network",91,"systems"],["outgroup",81,"groups"],["leadership",80,"groups"],
      ["social preferences",66,"systems"],["memory",66,"cognition"],["prosocial behavior",63,"exchange"],
      ["motivation",61,"cognition"],["decision making",61,"cognition"],["anger",61,"emotion"],
      ["guilt",56,"emotion"],["cooperation rates",54,"cooperation"],["emotion",51,"emotion"],
      ["free riding",50,"exchange"],["social norms",47,"exchange"],["conditional cooperation",47,"cooperation"],
      ["social value orientation",46,"cognition"],["perception",46,"cognition"],["dictator game",44,"systems"],
      ["attention",43,"cognition"],["group identity",42,"groups"],["collective action",41,"systems"],
      ["interdependence",39,"cognition"],["responsibility",37,"systems"],["empathy",37,"emotion"],
      ["mutual cooperation",36,"cooperation"],["anxiety",35,"emotion"],["peer punishment",34,"exchange"],
      ["economic games",34,"systems"],["ultimatum game",32,"systems"],["trust game",31,"systems"],
      ["indirect reciprocity",31,"exchange"],["cross-cultural",29,"groups"],["honesty",28,"systems"],
      ["shame",26,"emotion"],["self-control",26,"cognition"],["social identity",25,"groups"],
      ["ingroup favoritism",25,"groups"],["attachment",25,"emotion"],["resource dilemmas",24,"systems"],
      ["intergroup conflict",24,"groups"],["humility",22,"systems"],["exclusion",22,"groups"],
      ["antisocial punishment",21,"exchange"],["generosity",20,"systems"],["altruistic punishment",19,"exchange"],
      ["interpersonal trust",16,"emotion"],["diversity",16,"groups"],["coalition",16,"groups"],
      ["negotiation",15,"cognition"],["discrimination",14,"groups"],["strong reciprocity",13,"exchange"],
      ["norm enforcement",13,"systems"],["conformity",13,"groups"],["social distance",12,"groups"],
      ["hierarchy",12,"groups"],["envy",11,"emotion"],["compassion",11,"emotion"],
      ["stereotypes",10,"groups"],["other-regarding preferences",10,"systems"],["social learning",9,"cognition"],
      ["partner choice",9,"cognition"],["behavioral economics",9,"systems"],["inclusion",8,"groups"],
      ["accountability",8,"systems"],["self-esteem",7,"cognition"],["well-being",5,"emotion"],
      ["social support",5,"emotion"],["procedural justice",5,"systems"],["negative affect",5,"emotion"],
      ["moral judgment",5,"cognition"],["moral emotions",5,"emotion"],["norm compliance",4,"exchange"],
      ["loneliness",4,"emotion"],["costly signaling",4,"systems"],["common-pool resources",4,"systems"],
      ["collective efficacy",4,"systems"],["belonging",4,"emotion"],["institutional trust",3,"systems"],
      ["fairness norms",2,"exchange"],["cooperation dynamics",2,"cooperation"],["social influence",1,"groups"],
      ["prejudice",1,"groups"],["positive affect",1,"emotion"],["polarization",1,"systems"],
      ["cultural evolution",1,"systems"],["civic cooperation",1,"cooperation"]
    ].map(([term, count, category]) => ({ term, count, category }));

    const categories = {
      cooperation: "#ffae7c",
      exchange: "#f1c982",
      groups: "#8fc7dc",
      emotion: "#ee9fb6",
      cognition: "#cbb8ef",
      systems: "#83d2c5"
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x251811);
    scene.fog = new THREE.FogExp2(0x251811, 0.09);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 50);
    const initialCamera = new THREE.Vector3(0.16, 0.68, 5.5);
    camera.position.copy(initialCamera);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 8.5;
    controls.autoRotate = !reducedMotion.matches;
    controls.autoRotateSpeed = 0.34;
    controls.target.set(0, 0, 0);

    const field = new THREE.Group();
    const initialRotation = new THREE.Euler(-0.12, 0.22, 0.035);
    field.rotation.copy(initialRotation);
    scene.add(field);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const planeGeometry = new THREE.PlaneGeometry(1, 1);
    const maxLog = Math.log1p(terms[0].count);
    const minLog = Math.log1p(terms[terms.length - 1].count);
    const wordMeshes = [];
    const directionCount = 94;
    const gateSpread = 0.56;
    const lineLength = 2.08;

    function seeded(index, salt = 0) {
      const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
      return value - Math.floor(value);
    }

    function fibonacciDirection(index, total) {
      const y = (index + 0.5) / total;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const angle = goldenAngle * index;
      return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius).normalize();
    }

    function wordTexture(item) {
      const weight = (Math.log1p(item.count) - minLog) / (maxLog - minLog);
      const fontSize = Math.round(50 + weight * 20);
      const textureCanvas = document.createElement("canvas");
      const context = textureCanvas.getContext("2d");
      context.font = `${Math.round(560 + weight * 170)} ${fontSize}px Manrope, Arial, sans-serif`;
      textureCanvas.width = Math.max(190, Math.ceil(context.measureText(item.term).width + 82));
      textureCanvas.height = 124;
      context.font = `${Math.round(560 + weight * 170)} ${fontSize}px Manrope, Arial, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      const color = categories[item.category];
      context.shadowColor = color;
      context.shadowBlur = 16 + weight * 10;
      context.fillStyle = color;
      context.globalAlpha = 0.97;
      context.fillText(item.term, textureCanvas.width / 2, 60);
      context.shadowBlur = 0;
      context.strokeStyle = color;
      context.globalAlpha = 0.28;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(18, 102);
      context.lineTo(textureCanvas.width - 18, 102);
      context.stroke();

      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return { texture, weight, aspect: textureCanvas.width / textureCanvas.height };
    }

    terms.slice(0, directionCount).forEach((item, index) => {
      const direction = fibonacciDirection(index, directionCount);
      const { texture, weight, aspect } = wordTexture(item);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        fog: true,
        opacity: 0.72 + weight * 0.25
      });
      const mesh = new THREE.Mesh(planeGeometry, material);
      const height = 0.052 + weight * 0.045;
      mesh.scale.set(height * aspect, height, 1);
      mesh.renderOrder = Math.round(weight * 10);
      mesh.userData = {
        direction,
        along: (seeded(index, 7) - 0.5) * 3.08,
        center: new THREE.Vector3(
          (seeded(index, 11) * 2 - 1) * 0.35 * gateSpread,
          (seeded(index, 17) * 2 - 1) * 0.35 * gateSpread,
          (seeded(index, 23) * 2 - 1) * 0.35 * gateSpread
        )
      };
      mesh.position.copy(mesh.userData.center).addScaledVector(direction, mesh.userData.along);
      wordMeshes.push(mesh);
      field.add(mesh);
    });

    const linePositions = [];
    const lineColors = [];
    wordMeshes.forEach((mesh, index) => {
      const { center, direction } = mesh.userData;
      const start = center.clone().addScaledVector(direction, -lineLength);
      const end = center.clone().addScaledVector(direction, lineLength);
      linePositions.push(start.x, start.y, start.z, end.x, end.y, end.z);
      const color = new THREE.Color(categories[terms[index].category]);
      lineColors.push(color.r, color.g, color.b, color.r, color.g, color.b);
    });
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));
    const directionLines = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
      fog: true
    }));
    field.add(directionLines);

    function cubeGuide(size, edgeOpacity, faceOpacity, color) {
      const group = new THREE.Group();
      const geometry = new THREE.BoxGeometry(size, size, size);
      if (faceOpacity > 0) {
        const faces = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: faceOpacity,
          depthWrite: false,
          side: THREE.DoubleSide,
          fog: true
        }));
        faces.renderOrder = 1;
        group.add(faces);
      }
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: edgeOpacity, depthWrite: false, fog: true })
      );
      edges.renderOrder = 2;
      group.add(edges);
      return group;
    }

    const gateFrame = cubeGuide(0.8, 0.82, 0.07, 0xffae7c);
    field.add(gateFrame);
    const apertureVolume = cubeGuide(0.7, 0.46, 0.045, 0xf1c982);
    apertureVolume.scale.setScalar(gateSpread);
    field.add(apertureVolume);
    field.add(cubeGuide(4.45, 0.08, 0, 0xb88b70));

    const floor = new THREE.GridHelper(4.45, 10, 0xa66f4e, 0x644333);
    floor.position.y = -2.225;
    floor.material.transparent = true;
    floor.material.opacity = 0.11;
    floor.material.depthWrite = false;
    field.add(floor);

    const core = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, 0.085, 0.085),
      new THREE.MeshBasicMaterial({ color: 0xfff6ef, transparent: true, opacity: 0.78, depthWrite: false })
    );
    field.add(core);

    const particleCount = 360;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 2.1 + seeded(index, 29) * 4.8;
      const theta = seeded(index, 31) * Math.PI * 2;
      const phi = Math.acos(2 * seeded(index, 37) - 1);
      particlePositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[index * 3 + 1] = radius * Math.cos(phi);
      particlePositions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    scene.add(new THREE.Points(particleGeometry, new THREE.PointsMaterial({
      color: 0xffae7c,
      size: 0.012,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
      fog: true
    })));

    const matrix = new THREE.Matrix4();
    const projectedNormal = new THREE.Vector3();
    const planeY = new THREE.Vector3();
    const toCamera = new THREE.Vector3();
    const cameraLocal = new THREE.Vector3();

    function orientWordsToCamera() {
      field.updateMatrixWorld(true);
      cameraLocal.copy(camera.position);
      field.worldToLocal(cameraLocal);
      wordMeshes.forEach((mesh) => {
        const { direction } = mesh.userData;
        toCamera.copy(cameraLocal).sub(mesh.position);
        projectedNormal.copy(toCamera).addScaledVector(direction, -toCamera.dot(direction));
        if (projectedNormal.lengthSq() < 0.0001) projectedNormal.set(0, 0, 1);
        projectedNormal.normalize();
        planeY.crossVectors(projectedNormal, direction).normalize();
        matrix.makeBasis(direction, planeY, projectedNormal);
        mesh.quaternion.setFromRotationMatrix(matrix);
      });
    }

    function resize() {
      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      orientWordsToCamera();
      renderer.render(scene, camera);
    }

    function syncMotionButton() {
      if (!motionButton) return;
      const isChinese = document.documentElement.lang === "zh-CN";
      motionButton.textContent = controls.autoRotate ? (isChinese ? "暂停" : "Pause") : (isChinese ? "继续" : "Play");
      motionButton.setAttribute("aria-pressed", String(controls.autoRotate));
    }

    document.addEventListener("languagechange", syncMotionButton);

    motionButton?.addEventListener("click", () => {
      controls.autoRotate = !controls.autoRotate;
      syncMotionButton();
    });

    resetButton?.addEventListener("click", () => {
      camera.position.copy(initialCamera);
      controls.target.set(0, 0, 0);
      field.rotation.copy(initialRotation);
      controls.update();
      orientWordsToCamera();
      renderer.render(scene, camera);
    });

    reducedMotion.addEventListener?.("change", (event) => {
      controls.autoRotate = !event.matches;
      syncMotionButton();
    });

    if ("ResizeObserver" in window) {
      new ResizeObserver(resize).observe(stage);
    } else {
      window.addEventListener("resize", resize);
    }

    let inView = true;
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        inView = entries[0]?.isIntersecting ?? true;
      }, { rootMargin: "160px 0px" });
      observer.observe(stage);
    }

    function animate() {
      window.requestAnimationFrame(animate);
      if (!inView) return;
      controls.update();
      orientWordsToCamera();
      renderer.render(scene, camera);
    }

    resize();
    syncMotionButton();
    animate();
  } catch (error) {
    console.error("Unable to initialize the Cube Gate visualization.", error);
    fallback?.classList.add("visible");
  }
}
