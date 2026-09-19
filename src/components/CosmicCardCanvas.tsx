import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  maxLife: number;
  life: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  active: boolean;
}

export default function CosmicCardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const updateDimensions = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    updateDimensions();

    // 1. Background Micro-Stars
    const starCount = Math.floor(Math.min(width, 1200) / 25);
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.4 + Math.random() * 0.9,
      alpha: 0.2 + Math.random() * 0.5,
      twinkleSpeed: 0.015 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2,
    }));

    // 2. Space Cruiser (深空巡航舰)
    const cruiser = {
      x: width * 0.2,
      y: height * 0.65,
      vx: 1.4,
      vy: -0.35,
      angle: Math.atan2(-0.35, 1.4),
      speed: 1.45,
      turnRate: 0.025,
      particles: [] as Particle[],
      time: 0,
      targetX: width * 0.8,
      targetY: height * 0.3,
    };

    // 3. Orbital Satellite (开普勒轨道巡航卫星)
    const satellite = {
      centerX: width * 0.5,
      centerY: height * 0.45,
      radiusX: width * 0.42,
      radiusY: height * 0.36,
      angle: 0.5,
      angularSpeed: 0.0038,
      beaconTimer: 0,
    };

    // 4. Comet (深空彗星)
    const comet = {
      x: -120,
      y: height * 0.2,
      vx: 1.8,
      vy: 0.45,
      active: true,
      respawnTimer: 60,
      tailParticles: [] as Particle[],
    };

    // 5. Meteors (背景偶发流星)
    const meteors: Meteor[] = [];
    let meteorCooldown = 120;

    // Mouse tracking for subtle gravitational assist
    let mouseX = -9999;
    let mouseY = -9999;
    let isHovered = false;

    const parent = canvas.parentElement;
    const handleMouseMove = (e: MouseEvent) => {
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovered = true;
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
      isHovered = false;
    };

    parent?.addEventListener('mousemove', handleMouseMove, { passive: true });
    parent?.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    if (parent) resizeObserver.observe(parent);

    // Intersection observer for zero CPU when offscreen
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          animationFrameId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(canvas);

    // ===========================================
    // MAIN PHYSICAL SIMULATION & RENDER LOOP
    // ===========================================
    const render = () => {
      if (!isVisible) {
        animationFrameId = 0;
        return;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const now = performance.now() * 0.001;

      // -------------------------------------------
      // A. Distant Twinkling Micro-Stars
      // -------------------------------------------
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.phase += star.twinkleSpeed;
        const currentAlpha = star.alpha * (0.6 + 0.4 * Math.sin(star.phase));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 231, 255, ${currentAlpha.toFixed(3)})`;
        ctx.fill();
      }

      // -------------------------------------------
      // B. Sporadic High-Speed Meteors
      // -------------------------------------------
      meteorCooldown--;
      if (meteorCooldown <= 0) {
        meteors.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * (height * 0.4),
          vx: 7 + Math.random() * 5,
          vy: 3 + Math.random() * 3,
          length: 50 + Math.random() * 40,
          alpha: 0.85,
          active: true,
        });
        meteorCooldown = Math.floor(180 + Math.random() * 240); // every 3-7s
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.alpha *= 0.94;

        if (m.alpha < 0.03 || m.x > width + 100 || m.y > height + 100) {
          meteors.splice(i, 1);
          continue;
        }

        const headX = m.x;
        const headY = m.y;
        const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.length;
        const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.length;

        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        grad.addColorStop(0, 'rgba(147, 197, 253, 0)');
        grad.addColorStop(0.7, `rgba(186, 230, 253, ${(m.alpha * 0.5).toFixed(3)})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha.toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // -------------------------------------------
      // C. Comet (Icy Nucleus + Atmospheric Ion Tail)
      // -------------------------------------------
      if (comet.active) {
        comet.x += comet.vx;
        comet.y += comet.vy;

        // Emit tail particles opposite to velocity vector
        if (Math.random() < 0.85) {
          const speed = Math.hypot(comet.vx, comet.vy);
          const dirX = -comet.vx / speed;
          const dirY = -comet.vy / speed;
          comet.tailParticles.push({
            x: comet.x + (Math.random() - 0.5) * 2,
            y: comet.y + (Math.random() - 0.5) * 2,
            vx: dirX * (0.8 + Math.random() * 0.6) + (Math.random() - 0.5) * 0.25,
            vy: dirY * (0.8 + Math.random() * 0.6) + (Math.random() - 0.5) * 0.25,
            alpha: 0.65,
            size: 1.8 + Math.random() * 1.5,
            color: Math.random() > 0.4 ? 'rgba(56, 189, 248,' : 'rgba(192, 132, 252,',
            maxLife: 45,
            life: 0,
          });
        }

        // Draw Comet Nucleus
        ctx.save();
        const cometGlow = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 14);
        cometGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        cometGlow.addColorStop(0.3, 'rgba(147, 197, 253, 0.65)');
        cometGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = cometGlow;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Check bounds
        if (comet.x > width + 100 || comet.y > height + 100) {
          comet.active = false;
          comet.respawnTimer = 240 + Math.floor(Math.random() * 180);
        }
      } else {
        comet.respawnTimer--;
        if (comet.respawnTimer <= 0) {
          comet.x = -80;
          comet.y = Math.random() * (height * 0.4);
          const angle = (15 + Math.random() * 20) * (Math.PI / 180);
          const speed = 1.3 + Math.random() * 0.6;
          comet.vx = Math.cos(angle) * speed;
          comet.vy = Math.sin(angle) * speed;
          comet.active = true;
        }
      }

      // Render & Update Comet Tail Particles
      for (let i = comet.tailParticles.length - 1; i >= 0; i--) {
        const p = comet.tailParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const currentAlpha = p.alpha * (1 - p.life / p.maxLife);

        if (p.life >= p.maxLife) {
          comet.tailParticles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${currentAlpha.toFixed(3)})`;
        ctx.fill();
      }

      // -------------------------------------------
      // D. Keplerian Orbital Satellite (轨道空间卫星)
      // -------------------------------------------
      satellite.angle += satellite.angularSpeed;
      satellite.centerX = width * 0.5;
      satellite.centerY = height * 0.48;
      satellite.radiusX = width * 0.43;
      satellite.radiusY = height * 0.32;

      // Slight orbital tilt
      const satAngle = satellite.angle;
      const cosTilt = Math.cos(-0.18);
      const sinTilt = Math.sin(-0.18);

      const unrotatedX = Math.cos(satAngle) * satellite.radiusX;
      const unrotatedY = Math.sin(satAngle) * satellite.radiusY;

      const satX = satellite.centerX + unrotatedX * cosTilt - unrotatedY * sinTilt;
      const satY = satellite.centerY + unrotatedX * sinTilt + unrotatedY * cosTilt;

      // Tangent direction for flight orientation
      const satVx = -Math.sin(satAngle) * satellite.radiusX;
      const satVy = Math.cos(satAngle) * satellite.radiusY;
      const satRot = Math.atan2(
        satVx * sinTilt + satVy * cosTilt,
        satVx * cosTilt - satVy * sinTilt
      );

      ctx.save();
      ctx.translate(satX, satY);
      ctx.rotate(satRot);

      // 1. Draw Solar Panels (双翼太阳能电池板)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.fillRect(-14, -2.5, 8, 5); // Left array
      ctx.fillRect(6, -2.5, 8, 5);  // Right array

      // Solar panel metallic frame
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(-14, -2.5, 8, 5);
      ctx.strokeRect(6, -2.5, 8, 5);

      // Connecting booms
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 2. Central Satellite Bus (卫星核心舱体)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -3, 6, 6);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-3, -3, 6, 6);

      // 3. High-gain Dish Antenna (定向天线)
      ctx.beginPath();
      ctx.arc(0, -4.5, 2.5, 0, Math.PI, true);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // 4. Telecommunication Beacon Pulse (周期性航空脉冲信标)
      satellite.beaconTimer += 0.045;
      const isPulse = Math.sin(satellite.beaconTimer * 3.5) > 0.75;
      if (isPulse) {
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(52, 211, 153, 0.45)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = '#34d399';
        ctx.fill();
      }

      ctx.restore();

      // -------------------------------------------
      // E. Deep-Space Cruiser (双发离子动力巡航舰)
      // -------------------------------------------
      cruiser.time += 0.02;

      // Target navigation logic: natural sweeping space trajectory
      if (isHovered && mouseX > 0 && mouseY > 0) {
        // Gravitational steering towards cursor
        const dx = mouseX - cruiser.x;
        const dy = mouseY - cruiser.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 40) {
          const targetHeading = Math.atan2(dy, dx);
          let angleDiff = targetHeading - cruiser.angle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          cruiser.angle += Math.max(-cruiser.turnRate, Math.min(cruiser.turnRate, angleDiff * 0.1));
        }
      } else {
        // Autonomous waypoint patrolling
        const targetHeading = Math.atan2(cruiser.targetY - cruiser.y, cruiser.targetX - cruiser.x);
        let angleDiff = targetHeading - cruiser.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        cruiser.angle += Math.max(-cruiser.turnRate * 0.6, Math.min(cruiser.turnRate * 0.6, angleDiff * 0.05));

        const distToTarget = Math.hypot(cruiser.targetX - cruiser.x, cruiser.targetY - cruiser.y);
        if (distToTarget < 60) {
          cruiser.targetX = width * (0.15 + Math.random() * 0.7);
          cruiser.targetY = height * (0.2 + Math.random() * 0.6);
        }
      }

      // Newtonian motion
      cruiser.vx = Math.cos(cruiser.angle) * cruiser.speed;
      cruiser.vy = Math.sin(cruiser.angle) * cruiser.speed;
      cruiser.x += cruiser.vx;
      cruiser.y += cruiser.vy;

      // Wrap smoothly around sector bounds
      if (cruiser.x < -40) cruiser.x = width + 30;
      else if (cruiser.x > width + 40) cruiser.x = -30;
      if (cruiser.y < -40) cruiser.y = height + 30;
      else if (cruiser.y > height + 40) cruiser.y = -30;

      // Dual Ion Thruster Emission (双发量子离子尾焰)
      const cosA = Math.cos(cruiser.angle);
      const sinA = Math.sin(cruiser.angle);
      const leftEngineX = cruiser.x - cosA * 8 - sinA * 3.5;
      const leftEngineY = cruiser.y - sinA * 8 + cosA * 3.5;
      const rightEngineX = cruiser.x - cosA * 8 + sinA * 3.5;
      const rightEngineY = cruiser.y - sinA * 8 - cosA * 3.5;

      // Spawn ion particles
      for (const [ex, ey] of [[leftEngineX, leftEngineY], [rightEngineX, rightEngineY]]) {
        cruiser.particles.push({
          x: ex,
          y: ey,
          vx: -cosA * (1.8 + Math.random() * 0.9) + (Math.random() - 0.5) * 0.35,
          vy: -sinA * (1.8 + Math.random() * 0.9) + (Math.random() - 0.5) * 0.35,
          alpha: 0.85,
          size: 1.6 + Math.random() * 1.2,
          color: Math.random() > 0.25 ? 'rgba(56, 189, 248,' : 'rgba(192, 132, 252,',
          maxLife: 22,
          life: 0,
        });
      }

      // Draw Ion Particles
      for (let i = cruiser.particles.length - 1; i >= 0; i--) {
        const p = cruiser.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const currentAlpha = p.alpha * (1 - p.life / p.maxLife);

        if (p.life >= p.maxLife) {
          cruiser.particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - (p.life / p.maxLife) * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${currentAlpha.toFixed(3)})`;
        ctx.fill();
      }

      // Draw Spaceship Hull (钛合金升力体箭形航天巡航舰)
      ctx.save();
      ctx.translate(cruiser.x, cruiser.y);
      ctx.rotate(cruiser.angle);

      // Engine Exhaust Glow Aura
      const engineGlow = ctx.createRadialGradient(-8, 0, 0, -8, 0, 10);
      engineGlow.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
      engineGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = engineGlow;
      ctx.beginPath();
      ctx.arc(-8, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Main Fuselage
      ctx.beginPath();
      ctx.moveTo(9, 0);               // Bow nose cone
      ctx.lineTo(-7, 6);              // Port delta wing
      ctx.lineTo(-5, 2.5);            // Port engine fairing
      ctx.lineTo(-7.5, 2.5);          // Port nozzle
      ctx.lineTo(-7.5, -2.5);         // Starboard nozzle
      ctx.lineTo(-5, -2.5);           // Starboard engine fairing
      ctx.lineTo(-7, -6);             // Starboard delta wing
      ctx.closePath();

      ctx.fillStyle = 'rgba(235, 242, 254, 0.95)';
      ctx.fill();

      // Wing Edge Trim & Specular Rim Light
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Cockpit Sensor Strip (幽紫冷光驾驶视窗)
      ctx.beginPath();
      ctx.moveTo(2.5, 0);
      ctx.lineTo(-1.5, 1.2);
      ctx.lineTo(-1.5, -1.2);
      ctx.closePath();
      ctx.fillStyle = '#818cf8';
      ctx.fill();

      ctx.restore();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      parent?.removeEventListener('mousemove', handleMouseMove);
      parent?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="cosmic-card-canvas" aria-hidden="true" />;
}
