import {CONNECTIONS} from "./const";
import type {Types} from "./types";

export const getActiveSides = (type: Types, rotation:number) => {
    const baseSides = CONNECTIONS[type];
    // Вращаем индексы сторон: (сторона + поворот) % 4
    return baseSides.map(side => (side + rotation) % 4);
};
