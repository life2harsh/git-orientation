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

    (function buildSectors(){
      const svg = document.querySelector('.circle-wrapper svg');
      const wedgesGroup = svg.querySelector('#sector-wedges');
      const labelsGroup = svg.querySelector('#sector-labels');
      if(!svg || !wedgesGroup || !labelsGroup) return;

      const cx = 450, cy = 450;
      const rInner = 255; 
      const rOuter = 380; 
      const sectors = [
        { key: 'questions', text: 'questions', href: 'questions.html', baseAngle: -90 },
        { key: 'guide', text: 'guide', href: 'guide.html', baseAngle: -90 + 72 },
        { key: 'osdc', text: 'osdc', href: null, baseAngle: -90 + 144 },
        { key: 'leaderboard', text: 'leaderboard', href: 'leaderboard.html', baseAngle: -90 + 216 },
        { key: 'about', text: 'about', href: 'about.html', baseAngle: -90 + 288 },
      ];

      const sweep = 72; 

      function polarToCartesian(cx, cy, r, angleDeg){
        const rad = (angleDeg-90) * Math.PI/180; 
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
      }

      sectors.forEach((s, i) => {
        const start = s.baseAngle;
        const end = s.baseAngle + sweep;

        const p1 = polarToCartesian(cx, cy, rInner, start);
        const p2 = polarToCartesian(cx, cy, rOuter, start);
        const p3 = polarToCartesian(cx, cy, rOuter, end);
        const p4 = polarToCartesian(cx, cy, rInner, end);

        const largeArc = sweep > 180 ? 1 : 0;

        const d = [
          `M ${p1.x} ${p1.y}`,
          `L ${p2.x} ${p2.y}`,
          `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p3.x} ${p3.y}`,
          `L ${p4.x} ${p4.y}`,
          `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p1.x} ${p1.y}`,
          'Z'
        ].join(' ');

        const path = document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'rgba(255,215,0,0.08)');
        path.setAttribute('stroke', '#ffd70055');
        path.setAttribute('class', `sector-wedge sector-${s.key}`);

        if(s.href){
          path.addEventListener('click', () => window.location.href = s.href);
        } else if (s.key === 'osdc') {
          const osdcNodes = document.querySelector('.osdc-nodes');
          path.addEventListener('click', () => {
            const visible = osdcNodes.style.opacity === '1';
            osdcNodes.style.opacity = visible ? '0' : '1';
            osdcNodes.style.pointerEvents = visible ? 'none' : 'auto';
          });
        }

        wedgesGroup.appendChild(path);

        const rLabel = (rInner + rOuter)/2 + 5;
        const a1 = start + 3;
        const a2 = end - 3;
        const midA = (start + end) / 2;
        const midP = polarToCartesian(cx, cy, rLabel, midA);
        const isBottom = midP.y > cy; 

        const lp1 = polarToCartesian(cx, cy, rLabel, a1);
        const lp2 = polarToCartesian(cx, cy, rLabel, a2);

        // For bottom keys, render a simple centered horizontal label for guaranteed readability
        if (s.key === 'leaderboard' || s.key === 'about') {
          const text = document.createElementNS('http://www.w3.org/2000/svg','text');
          text.setAttribute('fill', '#ffd700');
          text.setAttribute('font-size', '22');
          text.setAttribute('letter-spacing','2');
          text.setAttribute('style','filter: drop-shadow(0 0 6px #ffd700)');
          text.setAttribute('text-anchor','middle');
          text.setAttribute('dominant-baseline','middle');
          text.setAttribute('x', midP.x);
          text.setAttribute('y', midP.y);
          text.textContent = s.text;
          labelsGroup.appendChild(text);
        } else {
          // Default: curved label along arc
          const labelId = `sector-label-path-${s.key}`;
          const labelPath = document.createElementNS('http://www.w3.org/2000/svg','path');
          // clockwise small arc from a1 -> a2
          labelPath.setAttribute('d', `M ${lp1.x} ${lp1.y} A ${rLabel} ${rLabel} 0 0 1 ${lp2.x} ${lp2.y}`);
          labelPath.setAttribute('id', labelId);
          labelPath.setAttribute('fill','none');
          labelsGroup.appendChild(labelPath);

          const text = document.createElementNS('http://www.w3.org/2000/svg','text');
          text.setAttribute('fill', '#ffd700');
          text.setAttribute('font-size', '22');
          text.setAttribute('letter-spacing','2');
          text.setAttribute('style','filter: drop-shadow(0 0 6px #ffd700)');
          const textPath = document.createElementNS('http://www.w3.org/2000/svg','textPath');
          textPath.setAttributeNS('http://www.w3.org/1999/xlink','href', `#${labelId}`);
          textPath.setAttribute('startOffset','50%');
          textPath.setAttribute('text-anchor','middle');
          textPath.textContent = s.text;
          text.appendChild(textPath);
          labelsGroup.appendChild(text);
        }
      });
    })();
const loadingScreen = document.getElementById('loadingScreen');

setTimeout(() => {
  loadingScreen.style.opacity = 0;
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    document.getElementById('app').style.display = 'block';
  }, 1000);
}, 3000);
