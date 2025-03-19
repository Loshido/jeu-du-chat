export interface Player {
    x: number,
    y: number,
    nom: string,
    couleur: string
}

export interface Joining {
    type: 'joining',
    player: Player
}

export interface Move {
    type: 'move',
    player: Omit<Player, 'couleur'>
}

export type Message = Move | Joining;