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
            transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.6 }}
            onMouseMove={(e) => {
                if (reduce) return;
                const r = ref.current?.getBoundingClientRect();
                if (!r) return;
                const x = e.clientX - (r.left + r.width / 2);
                const y = e.clientY - (r.top + r.height / 2);
                setPos({
                    x: Math.max(-strength, Math.min(strength, x * 0.18)),
                    y: Math.max(-strength, Math.min(strength, y * 0.18)),
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
