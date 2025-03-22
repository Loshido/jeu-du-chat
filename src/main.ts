import Canvas from "./canvas";
import Debug from "./debug";
import Player, { LocalPlayer } from "./player";
import connect from "./ws";
export const CELL = 64; // Taille des carrés
const GRID_BOTTOM = CELL * 128;
const GRID_RIGHT = CELL * 128;
const TICK = 45;

const CELL_GAP = window.innerWidth > 1000 ? 16 : 8;

let seeker: string | null = null;
const c = new Canvas();
const d = new Debug()
const milieu = {
    x: c.w / 2 - CELL / 2,
    y: c.h / 2 - CELL / 2 
}

window.addEventListener('resize', () => {
    milieu.x = c.w / 2 - CELL / 2;
    milieu.y = c.h / 2 - CELL / 2;
})

// Tableau des joueurs
const players: Map<string, Player> = new Map();

// Joueur local
const i = Math.floor(Math.random() * 360);
const local = new LocalPlayer(
    Math.floor(Math.random() * 9999999).toString(36), 
    `hsla(${i}deg, 100%, 50%, 1.0)`,
    Math.floor(GRID_BOTTOM / 2),
    Math.floor(GRID_RIGHT / 2)
);

// Connection avec le serveur
const ws = connect({
    move: (remotePlayer) => {
        if(players.has(remotePlayer.nom)) {
            const localPlayer = players.get(remotePlayer.nom)!;

            localPlayer.x = remotePlayer.x;
            localPlayer.y = remotePlayer.y;
        }
    },
    joined: (remotePlayer) => {
        if(players.has(remotePlayer.nom)) {
            return;
        }
        
        const localPlayer = new Player(remotePlayer.nom, remotePlayer.couleur, remotePlayer.x, remotePlayer.y);
        players.set(localPlayer.nom, localPlayer);
    },
    disconnected: (nom) => {
        if(players.has(nom)) {
            const player = players.get(nom);
            if(!player) return;

            players.delete(nom)
        }
    },
    seekerChanged(nom) {
        seeker = nom;
        d.set('seeker', local.nom === seeker ? 'Tu es le chat! 🐈' : `Le chat est '${seeker}' 🐈‍⬛`)
    },
}, location.origin)

ws.addEventListener('open', () => {
    // On se présente lorsqu'on est connecté
    ws.send(JSON.stringify({
        type: 'joining',
        player: {
            nom: local.nom,
            couleur: local.couleur,
            x: local.x,
            y: local.y
        }
    }))
    d.set('ws', `📡 Connecté`)
})

ws.addEventListener('close', () => d.set('ws', '🧯 Déconnecté'))

ws.addEventListener('error', (err) => {
    console.error(err)
})

if(seeker) {
    d.set('seeker', `Le chat est '${seeker}'`)
}

let t = Date.now()
let last_tick = Date.now();
function draw() {
    t = Date.now()

    c.clear();
    for(let x = -local.x; x <= GRID_RIGHT - local.x; x = x + CELL * CELL_GAP) {
        for(let y = -local.y; y <= GRID_BOTTOM - local.y; y = y + CELL * CELL_GAP) {
            c.rect(
                [
                    x + milieu.x,
                    y + milieu.y
                ],
                [CELL, CELL],
                '#0001'
            )
        }
    }
    if(milieu.x - local.x > 0) {
        c.rect(
            [ 0, 0 ],
            [
                milieu.x - local.x,
                c.h
            ],
            '#FF000005'
        )
    } else if(local.x + milieu.x - GRID_RIGHT >= 0) {
        const right = CELL - local.x + milieu.x + GRID_RIGHT
        c.rect(
            [ right, 0 ],
            [ c.w - right, c.h ],
            '#FF000005'
        )
    }
    if(milieu.y - local.y > 0) {
        c.rect(
            [ 0, 0 ],
            [
                c.w,
                milieu.y - local.y
            ],
            '#FF000005'
        )
    } else if(local.y + milieu.y - GRID_BOTTOM >= 0) {
        const top = CELL -local.y + milieu.y + GRID_BOTTOM
        c.rect(
            [ 0, top ],
            [ c.w, c.h - top ],
            '#FF000005'
        )
    }

    players.forEach(player => {
        const couleur = seeker == player.nom
            ? 'red'
            : player.couleur
        let [x, y] = [
            player.x - local.x + milieu.x,
            player.y - local.y + milieu.y,
        ]

        const [left, right, top, bottom] = [
            x < 0,
            x > c.w,
            y < 0,
            y > c.h
        ]
        
        if(left || right || top || bottom) {
            if(left) {
                x = 0;
            } else if(right) {
                x = c.w - CELL;
            }
            if(top) {
                y = 0;
            } else if(bottom) {
                y = c.h - CELL;
            }

            const facteur = (0.5 + 0.5 * Math.abs(Math.cos(t / 500)))
            c.circle(
                [x + CELL * 0.5 * (1 - facteur), y + CELL * 0.5 * (1 - facteur)],
                [CELL * facteur, CELL * facteur],
                couleur,
            );
            return;
        }

        c.rect(
            [x, y],
            [CELL, CELL],
            couleur,
        )
    })

    c.rect(
        [milieu.x, milieu.y],
        [CELL, CELL],
        seeker === local.nom ? 'red' : local.couleur
    )

    if(t > last_tick + TICK) {
        if(local.keys['z'] === true && local.y - CELL >= 0) {
            local.y -= CELL;
        }
        if(local.keys['s'] === true && local.y + CELL <= GRID_BOTTOM) {
            local.y += CELL;
        }
        if(local.keys['d'] === true && local.x + CELL <= GRID_RIGHT) {
            local.x += CELL;
        }
        if(local.keys['q'] === true && local.x - CELL >= 0) {
            local.x -= CELL;
        }
        if(Object.values(local.keys).some(key => key === true)) {
            ws.send(JSON.stringify({
                type: 'move',
                player: {
                    nom: local.nom,
                    x: local.x,
                    y: local.y
                }
            }))
        }
        last_tick = t;
    }

    window.requestAnimationFrame(draw)
}

draw()