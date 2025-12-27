import { useEffect, useState } from 'react';

export function useCountUp(end: number, duration: number = 2000) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const update = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Easing function (easeOutQuart)
            const ease = 1 - Math.pow(1 - percentage, 4);

            setValue(end * ease);

            if (progress < duration) {
                animationFrame = requestAnimationFrame(update);
            } else {
                setValue(end);
            }
        };

        animationFrame = requestAnimationFrame(update);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return parseFloat(value.toFixed(2));
}
