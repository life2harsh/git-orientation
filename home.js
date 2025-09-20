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

    const aboutDiv = document.querySelector('.partition-div.about');
    const aboutNodes = document.querySelector('.about-nodes');

    aboutNodes.style.opacity = 0;
    aboutNodes.style.pointerEvents = 'none';

    aboutDiv.addEventListener('click', () => {
      const visible = aboutNodes.style.opacity === '1';
      if(visible) {
        aboutNodes.style.opacity = '0';
        aboutNodes.style.pointerEvents = 'none';
      } else {
        aboutNodes.style.opacity = '1';
        aboutNodes.style.pointerEvents = 'auto';
      }
    });

    const questionDiv = document.querySelector('.partition-div.questions'); // Adjust class as per your markup
    const introDic=document.querySelector('.about');
if (questionDiv) {
  questionDiv.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

if (introDic) {
  introDic.addEventListener('click', () => {
    window.location.href = 'about.html';
  });
}