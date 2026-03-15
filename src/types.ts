
export type Types = 'corner' | 'straight' | 'cross';

export type Tile = {
    id: number,
    type: Types,
    rotation: number,
    activeColors: string[]
}
