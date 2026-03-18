import type { Types } from "./types";
// @ts-ignore
import CarIcon from './assets/car.svg?react'
// @ts-ignore
import SwitchIcon from './assets/switch.svg?react'
// @ts-ignore
import CakeIcon from './assets/cake.svg?react'
// @ts-ignore
import HouseIcon from './assets/house.svg?react'

// Типы труб
export const TYPES: Record<string, Types> = {
    CORNER: 'corner',
    STRAIGHT: 'straight',
    CROSS: 'cross'
};

// Конфигурация соединений для вращения 0
// 0: верх, 1: право, 2: низ, 3: лево
export const CONNECTIONS = {
    [TYPES.STRAIGHT]: [0, 2], // Прямая: вертикально
    [TYPES.CORNER]: [1, 2],   // Угловая: право и низ (L-образная)
    [TYPES.CROSS]: [0, 1, 2, 3] // Крест: все стороны
};

// Твой список из 42 плиток (преобразованный в массив объектов)
export const TILE_DATA= [
    TYPES.CORNER, TYPES.CORNER, TYPES.CORNER, TYPES.CORNER, TYPES.CORNER, TYPES.CROSS, TYPES.CORNER, // 1-7
    TYPES.STRAIGHT, TYPES.CORNER, TYPES.STRAIGHT, TYPES.CORNER, TYPES.STRAIGHT, TYPES.STRAIGHT, TYPES.STRAIGHT, // 8-14
    TYPES.CORNER, TYPES.CORNER, TYPES.CORNER, TYPES.CROSS, TYPES.CORNER, TYPES.CORNER, TYPES.CORNER,  // 15-21
    TYPES.CORNER, TYPES.STRAIGHT, TYPES.STRAIGHT, TYPES.CORNER, TYPES.CROSS, TYPES.CORNER, TYPES.STRAIGHT, // 22-28
    TYPES.STRAIGHT, TYPES.STRAIGHT, TYPES.CROSS, TYPES.CORNER, TYPES.CORNER, TYPES.CROSS, TYPES.CORNER, // 25-35
    TYPES.CORNER, TYPES.CORNER, TYPES.CORNER, TYPES.CORNER, TYPES.CORNER, TYPES.CROSS, TYPES.CORNER // 36 -42
];

// Источники (сверху) и Цели (снизу)
export const SOURCES = [
    {col: 1, color: '#60a5fa', name: 'blue', letter: 'Г'},
    {col: 3, color: '#4ade80', name: 'green', letter: 'Н'},
    {col: 5, color: '#f87171', name: 'red', letter: 'С'},
];

export const TARGETS = [
    {col: 1, color: '#4ade80', name: 'green', icon: CakeIcon },
    {col: 3, color: '#f87171', name: 'red', icon: HouseIcon },
    {col: 5, color: '#60a5fa', name: 'blue', icon: SwitchIcon },
];
