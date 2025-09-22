    const rotatingGroup = document.getElementById("rotating-text");
    let angle = 0;
    function animateRotation() {
      angle += 0.3;
      rotatingGroup.setAttribute("transform", `rotate(${angle}, 450, 450)`);
      requestAnimationFrame(animateRotation);
    }
    animateRotation();

    const pupil = document.getElementById('pupil');
    const eyeCenter = { x: 457, y: 450 };
    const maxRadius = 8;

    window.addEventListener('mousemove', e => {
      const svg = pupil.ownerSVGElement;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

      let dx = svgP.x - eyeCenter.x;
      let dy = svgP.y - eyeCenter.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist > maxRadius) {
        const angle = Math.atan2(dy, dx);
        dx = Math.cos(angle)*maxRadius;
        dy = Math.sin(angle)*maxRadius;
      }
      pupil.setAttribute('cx', eyeCenter.x + dx);
      pupil.setAttribute('cy', eyeCenter.y + dy);
    });

    const osdcDiv = document.querySelector('.partition-div.osdc');
    const osdcNodes = document.querySelector('.osdc-nodes');

    osdcNodes.style.opacity = 0;
    osdcNodes.style.pointerEvents = 'none';
    
const rect = osdcDiv.getBoundingClientRect();
osdcNodes.style.position = 'absolute';
osdcNodes.style.top = `${rect.top + window.scrollY + osdcDiv.offsetHeight -20}px`;  // 10px below
osdcNodes.style.left = `${rect.left + window.scrollX}px`;
    osdcDiv.addEventListener('click', () => {
      const visible = osdcNodes.style.opacity === '1';
      if(visible) {
        osdcNodes.style.opacity = '0';
        osdcNodes.style.pointerEvents = 'none';
      } else {
        osdcNodes.style.opacity = '1';
        osdcNodes.style.pointerEvents = 'auto';
      }
    });

    const questionDiv = document.querySelector('.partition-div.questions'); // Adjust class as per your markup
    const introDiv = document.querySelector('.partition-div.about');
    const guideDiv = document.querySelector('.partition-div.guide');

guideDiv.addEventListener('click', () => {
  window.location.href = 'guide.html';
});
if (questionDiv) {
  questionDiv.addEventListener('click', () => {
    window.location.href = 'questions.html';
  });
}

if (introDiv) {
  introDiv.addEventListener('click', () => {
    window.location.href = 'about.html';
  });
}
const loadingScreen = document.getElementById('loadingScreen');

setTimeout(() => {
  loadingScreen.style.opacity = 0;
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    document.getElementById('app').style.display = 'block';
  }, 1000);
}, 3000);



