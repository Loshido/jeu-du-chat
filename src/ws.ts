import { Player } from "./types";

type movePlayer = (player: Omit<Player, 'couleur'>) => void
type disconnectedPlayer = (nom: string) => void
type joinedPlayer = (player: Player) => void
type seekerChanged = (nom: string) => void
 
type Callbacks = {
    move: movePlayer,
    disconnected: disconnectedPlayer,
    joined: joinedPlayer,
    seekerChanged: seekerChanged
}

export default (cb: Callbacks, url?: string) => {
    const ws = new WebSocket(url || 'http://172.16.126.125:5174');
    ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if(!('type' in data)) return;
        switch(data.type) {
            case 'move': 
                cb.move(data.player)
                break;
            case 'disconnected':
                cb.disconnected(data.nom)
                break;
            case 'joined':
                cb.joined(data.player)
                break
            case 'seeker':
                cb.seekerChanged(data.nom)
                break
        }
    })

    ws.addEventListener('open', () => {
        console.log(`Websocket opened 📡`)
    })

    ws.addEventListener('close', () => {
        console.log(`Websocket closed 🧯`)
    })
    return ws;
}