import { useEffect, useRef } from 'react';

// Animated floating particles background with smooth gradients
export default function AnimatedBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Create floating particles
        const PARTICLE_COUNT = 35;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 4 + 1,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.5 + 0.1,
                hue: Math.random() * 60 + 250, // Purple-cyan range
            });
        }

        // Floating orbs (large glowing circles)
        const orbs = [
            { x: 0.2, y: 0.3, size: 300, hue: 280, speed: 0.0003 },
            { x: 0.8, y: 0.7, size: 250, hue: 190, speed: 0.0004 },
            { x: 0.5, y: 0.5, size: 200, hue: 320, speed: 0.0002 },
        ];

        let time = 0;
        const animate = () => {
            time++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw floating orbs
            orbs.forEach(orb => {
                const ox = (orb.x + Math.sin(time * orb.speed) * 0.1) * canvas.width;
                const oy = (orb.y + Math.cos(time * orb.speed * 1.3) * 0.08) * canvas.height;
                const gradient = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.size);
                gradient.addColorStop(0, `hsla(${orb.hue}, 80%, 60%, 0.08)`);
                gradient.addColorStop(0.5, `hsla(${orb.hue}, 70%, 50%, 0.03)`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(ox - orb.size, oy - orb.size, orb.size * 2, orb.size * 2);
            });

            // Draw and update particles
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw particle with glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.opacity})`;
                ctx.shadowBlur = 15;
                ctx.shadowColor = `hsla(${p.hue}, 80%, 60%, ${p.opacity * 0.5})`;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Draw connections between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `hsla(270, 60%, 60%, ${0.08 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: 'transparent' }}
        />
    );
}
