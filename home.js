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

      sectors.forEach((s) => {
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
        if (s.href) {
          path.addEventListener('click', () => (window.location.href = s.href));
        }
        wedgesGroup.appendChild(path);

        const rLabel = (rInner + rOuter) / 2 + 5;
        const a1 = start + 3;
        const a2 = end - 3;
        const midA = (start + end) / 2;
        const midP = polarToCartesian(cx, cy, rLabel, midA);
        const isBottom = midP.y > cy;
        const lp1 = polarToCartesian(cx, cy, rLabel, a1);
        const lp2 = polarToCartesian(cx, cy, rLabel, a2);

        const labelId = `sector-label-path-${s.key}`;
        const labelPath = document.createElementNS('http://www.w3.org/2000/svg','path');
        if (isBottom) {

          labelPath.setAttribute('d', `M ${lp2.x} ${lp2.y} A ${rLabel} ${rLabel} 0 0 0 ${lp1.x} ${lp1.y}`);
        } else {
          labelPath.setAttribute('d', `M ${lp1.x} ${lp1.y} A ${rLabel} ${rLabel} 0 0 1 ${lp2.x} ${lp2.y}`);
        }
        labelPath.setAttribute('id', labelId);
        labelPath.setAttribute('fill', 'none');
        labelsGroup.appendChild(labelPath);

        const text = document.createElementNS('http://www.w3.org/2000/svg','text');
        text.setAttribute('fill', '#ffd700');
        text.setAttribute('font-size', '22');
        text.setAttribute('letter-spacing','2');
        text.setAttribute('style','filter: drop-shadow(0 0 6px #ffd700)');
        const textPath = document.createElementNS('http://www.w3.org/2000/svg','textPath');
        textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${labelId}`);
        textPath.setAttribute('startOffset', '50%');
        textPath.setAttribute('text-anchor', 'middle');
        textPath.textContent = s.text; 
        text.appendChild(textPath);
        labelsGroup.appendChild(text);
      });

      const oldNodesDiv = document.querySelector('.osdc-nodes');
      if (oldNodesDiv) oldNodesDiv.style.display = 'none';

      const wrapper = document.querySelector('.circle-wrapper');
      let osdcOverlay = wrapper.querySelector('#osdc-overlay');
      if (!osdcOverlay) {
        osdcOverlay = document.createElement('div');
        osdcOverlay.id = 'osdc-overlay';
        osdcOverlay.style.position = 'absolute';
        osdcOverlay.style.inset = '0';
        osdcOverlay.style.overflow = 'visible';
        osdcOverlay.style.opacity = '0';
        osdcOverlay.style.pointerEvents = 'none';
        osdcOverlay.style.transition = 'opacity .25s ease';
        wrapper.appendChild(osdcOverlay);
      }

      const osdcMid = sectors.find(s => s.key === 'osdc').baseAngle + sweep/2; 
      const iconPx = 42; 
      const offsets = [-12, 0, 12];
      const radii = [rOuter + 20, rOuter + 50, rOuter + 80];
      const links = [
        { href: 'https://chat.whatsapp.com/CFewmdu2yXKD8bpg2t5gB4?mode=r_t', img: 'assets/whatsapp.jpeg', alt: 'Whatsapp' },
        { href: 'https://www.instagram.com/osdc.dev?igsh=ZHFuMTJrYjZoNGho', img: 'assets/instagram.png', alt: 'Instagram' },
        { href: 'https://discord.com/invite/jiit-open-source-developer-s-community-475154983910899722', img: 'assets/discord.png', alt: 'Discord' },
      ];

      osdcOverlay.innerHTML = '';
      const overlayItems = [];
      links.forEach((link, idx) => {
        const ang = osdcMid + offsets[idx];
        const pos = polarToCartesian(cx, cy, radii[idx], ang);
        const a = document.createElement('a');
        a.href = link.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'osdc-icon';
        a.style.position = 'absolute';
        a.style.width = `${iconPx}px`;
        a.style.height = `${iconPx}px`;
        a.style.filter = 'drop-shadow(0 0 6px #ffd700)';
        a.style.pointerEvents = 'auto';

        a.dataset.svgsx = String(pos.x);
        a.dataset.svgsy = String(pos.y);
        const img = document.createElement('img');
        img.src = link.img;
        img.alt = link.alt;
        img.width = iconPx;
        img.height = iconPx;
        img.style.display = 'block';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '6px';
        a.appendChild(img);
        osdcOverlay.appendChild(a);
        overlayItems.push(a);
      });

      function positionOverlayIcons() {
        const rect = wrapper.getBoundingClientRect();

        const scaleX = rect.width / 900;
        const scaleY = rect.height / 900;
        overlayItems.forEach((el) => {
          const sx = parseFloat(el.dataset.svgsx);
          const sy = parseFloat(el.dataset.svgsy);
          const left = sx * scaleX - iconPx / 2;
          const top = sy * scaleY - iconPx / 2;
          el.style.left = `${left}px`;
          el.style.top = `${top}px`;
        });
      }
      positionOverlayIcons();
      window.addEventListener('resize', positionOverlayIcons);

      const osdcWedge = svg.querySelector('.sector-osdc');
      if (osdcWedge) {
        osdcWedge.addEventListener('click', () => {

          positionOverlayIcons();
          const visible = osdcOverlay.style.opacity === '1';
          osdcOverlay.style.opacity = visible ? '0' : '1';

        });
      }
    })();
const loadingScreen = document.getElementById('loadingScreen');

setTimeout(() => {
  loadingScreen.style.opacity = 0;
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    document.getElementById('app').style.display = 'block';

    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }, 1000);
}, 3000);
