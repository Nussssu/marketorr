import { motion, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';

export default function MagneticButton({ children, strength = 10, className = '', onClick }) {
    const ref = useRef(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const reduce = useReducedMotion();

    return (
        <motion.div
            ref={ref}
            className={`inline-block ${className}`}
            animate={{ x: pos.x, y: pos.y }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseMove={(e) => {
                if (reduce) return;
                if (window.matchMedia('(max-width: 1023px), (pointer: coarse)').matches) return;
                const r = ref.current?.getBoundingClientRect();
                if (!r) return;
                const x = e.clientX - (r.left + r.width / 2);
                const y = e.clientY - (r.top + r.height / 2);
                setPos({
                    x: Math.max(-Math.min(strength, 6), Math.min(Math.min(strength, 6), x * 0.12)),
                    y: Math.max(-Math.min(strength, 6), Math.min(Math.min(strength, 6), y * 0.12)),
                });
            }}
            onMouseLeave={() => setPos({ x: 0, y: 0 })}
            onClick={onClick}
            whileTap={{ scale: 0.97 }}
        >
            {children}
        </motion.div>
    );
}
