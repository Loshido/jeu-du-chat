export interface Player {
    x: number,
    y: number,
    nom: string,
    couleur: string
}

export interface Moved {
    type: 'move',
    player: Omit<Player, 'couleur'>
}

export interface Disconnected {
    type: 'disconnected',
    nom: string
}

export interface Joined {
    type: 'joined',
    player: Player
}

export interface Seeker {
    type: 'seeker',
    nom: string
}


export type Message = Moved | Disconnected | Joined;