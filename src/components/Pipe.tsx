import {memo, type SVGLineElementAttributes} from "react";
import type {Types} from "../types";

const Pipe = ({ type, colors }: { type: Types, colors: string[] }) => {
    // Если через трубу течет несколько цветов (для креста),
    // берем первый или можно сделать градиент. Для простоты возьмем активный.
    const activeColor = colors.length > 0 ? colors[0] : "transparent";
    const isFlowing = colors.length > 0;

    // Базовые настройки стиля
    const basePipeProps: SVGLineElementAttributes<SVGLineElement> = {
        stroke: "#334155", // slate-700 (пустая труба)
        strokeWidth: "20",
        fill: "none",
        strokeLinecap: "round"
    };

    const waterPipeProps: SVGLineElementAttributes<SVGLineElement> = {
        stroke: activeColor,
        strokeWidth: "12",
        fill: "none",
        strokeLinecap: "round",
        style: {
            transition: "stroke 0.5s ease, opacity 0.5s ease",
            opacity: isFlowing ? 1 : 0,
            filter: isFlowing ? `drop-shadow(0 0 5px ${activeColor})` : "none"
        }
    };

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full p-1">
            {/* Прямая труба */}
            {type === 'straight' && (
                <>
                    <line x1="50" y1="0" x2="50" y2="100" {...basePipeProps} />
                    <line x1="50" y1="0" x2="50" y2="100" {...waterPipeProps} />
                </>
            )}

            {/* Угловая труба (изначально соединяет право и низ) */}
            {type === 'corner' && (
                <>
                    <path d="M 100 50 Q 50 50 50 100" {...basePipeProps} />
                    <path d="M 100 50 Q 50 50 50 100" {...waterPipeProps} />
                </>
            )}

            {/* Крест */}
            {type === 'cross' && (
                <>
                    <line x1="0" y1="50" x2="100" y2="50" {...basePipeProps} />
                    <line x1="50" y1="0" x2="50" y2="100" {...basePipeProps} />
                    <line x1="0" y1="50" x2="100" y2="50" {...waterPipeProps} />
                    <line x1="50" y1="0" x2="50" y2="100" {...waterPipeProps} />
                </>
            )}
        </svg>
    );
};

export default memo(Pipe)
