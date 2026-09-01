import React, { useEffect, useRef } from 'react';
import './fireworks.css';

export default function FireworksEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Rich 5-star Tet fireworks palette
    const colors = [
      '#ffd700', // Metallic Gold
      '#ff4d4d', // Imperial Red
      '#ff9900', // Warm Amber
      '#ffffff', // Diamond Sparkle
      '#fef08a', // Champagne Gold
      '#ff85c0', // Peach Blossom Pink
      '#ffc069'  // Warm Gold
    ];

    class Rocket {
      constructor(fromLeft) {
        this.fromLeft = fromLeft;
        this.x = fromLeft ? canvas.width * 0.08 : canvas.width * 0.92;
        this.y = canvas.height * 0.95;
        this.targetX = fromLeft ? canvas.width * (0.36 + Math.random() * 0.1) : canvas.width * (0.54 + Math.random() * 0.1);
        this.targetY = canvas.height * (0.2 + Math.random() * 0.18);
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.angle = Math.atan2(dy, dx);
        // Tốc độ phóng chậm lại uốn lượn mượt mà (3.8px/frame)
        this.speed = 3.8 + Math.random() * 1.2;
        
        this.trail = [];
        this.alive = true;
      }

      update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 18) this.trail.shift();
        this.trail.forEach(t => t.alpha -= 0.055);

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        const remainingDist = Math.hypot(this.targetX - this.x, this.targetY - this.y);
        if (remainingDist < 10 || this.y <= this.targetY) {
          this.alive = false;
        }
      }

      draw() {
        // Vệt sáng tên lửa dài lung linh
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          const radius = (i / this.trail.length) * 3;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 215, 0, ${Math.max(0, pt.alpha)})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ffd700';
          ctx.fill();
        }

        // Đầu pháo hoa phát sáng
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffd700';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        // Bán kính hoa xoè rộng và nhiều lớp hạt (từ 0.8 đến 7.2)
        this.speed = 0.8 + Math.random() * 6.5;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = 1;
        // Pháo hoa giữ sáng lâu hơn (decay chậm)
        this.decay = 0.008 + Math.random() * 0.012;
        this.gravity = 0.06;
        this.size = 1.8 + Math.random() * 2.8;
        this.flicker = Math.random() > 0.4;
      }

      update() {
        this.vy += this.gravity;
        this.vx *= 0.98; // Lực cản không khí nhẹ
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        const drawAlpha = this.flicker && Math.random() > 0.5 ? this.alpha * 0.5 : this.alpha;
        ctx.globalAlpha = Math.max(0, drawAlpha);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    let rockets = [];
    let particles = [];
    let lastLaunchTime = 0;

    const loop = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Phóng định kỳ cách nhau 2.4s với vệt bay chậm thanh lịch
      if (timestamp - lastLaunchTime > 2400) {
        rockets.push(new Rocket(true));
        setTimeout(() => {
          if (canvas) rockets.push(new Rocket(false));
        }, 450);
        lastLaunchTime = timestamp;
      }

      // Cập nhật tên lửa bay
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update();
        r.draw();

        if (!r.alive) {
          // Bùng nổ 130+ hạt pháo hoa toả rộng như bông hoa khai xuân rực rỡ
          for (let p = 0; p < 135; p++) {
            particles.push(new Particle(r.x, r.y));
          }
          rockets.splice(i, 1);
        }
      }

      // Cập nhật các hạt pháo hoa phát sáng
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.update();
        pt.draw();
        if (pt.alpha <= 0) {
          particles.splice(p, 1);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    // Phóng phát đầu tiên
    rockets.push(new Rocket(true));
    setTimeout(() => rockets.push(new Rocket(false)), 450);

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-fireworks-canvas" />;
}
