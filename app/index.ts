import destr from "destr";
import { Player, Message } from "./types"
import type { ServerWebSocket } from "bun";

// Stocke l'état des joueurs
const players: Map<string, Player> = new Map();

// Stocke les connections en temps réel
const sockets: Set<ServerWebSocket<{ nom: string }>> = new Set();

// Stocke le nom du loup / chercheur / chat
let seeker: string | null = null;

Bun.serve({
    port: 5174,
    fetch(req, server) {
        // On passe en Websocket
        server.upgrade(req);
        return new Response('ok');
    },
    websocket: {
        message(ws, message: string) {
            // string -> Message
            const msg = destr<Message>(message)

            if(msg.type === 'joining') {
                ws.data = {
                    nom: msg.player.nom
                }
                players.set(msg.player.nom, msg.player);
                sockets.add(ws);
                

                for(const socket of sockets) {
                    if(socket.data.nom === msg.player.nom) {
                        continue
                    }
                    
                    socket.send(JSON.stringify({
                        type: 'joined',
                        player: msg.player
                    }))
                    const player = players.get(socket.data.nom)
                    if(player) {
                        ws.send(JSON.stringify({
                            type: 'joined',
                            player
                        }))
                    }
                }
                if(!seeker) {
                    seeker = msg.player.nom;
                }
                ws.send(JSON.stringify({
                    type: 'seeker',
                    nom: seeker
                }))
            } else if(msg.type === 'move') {
                const previous_seeker = seeker;
                const player = players.get(msg.player.nom);
                if(!player) return; 

                players.set(msg.player.nom, {
                    ...player,
                    x: msg.player.x,
                    y: msg.player.y
                });

                for(const socket of sockets) {
                    const nom = socket.data.nom;
                    if(nom == msg.player.nom) {
                        continue;
                    }

                    socket.send(JSON.stringify({
                        type: 'move',
                        player: msg.player
                    }))

                    const socket_player = players.get(nom);
                    if(!socket_player || seeker !== player.nom) continue;

                    if(Math.floor(socket_player.x) == Math.floor(player.x) && 
                        Math.floor(socket_player.y) == Math.floor(player.y)) {
                        seeker = nom;
                    }
                }

                if(previous_seeker !== seeker) {
                    for(const socket of sockets) {
                        socket.send(JSON.stringify({
                            type: 'seeker',
                            nom: seeker
                        }))
                    }
                }
            }
        },
        close(ws) {
            // On supprime les connections fermés
            for(const socket of sockets) {
                if(socket.readyState > 1) {
                    players.delete(socket.data.nom);
                    sockets.delete(socket);
                    continue;
                }
                socket.send(JSON.stringify({
                    type: 'disconnected',
                    nom: ws.data.nom
                }));

                if(seeker === ws.data.nom) {
                    seeker = null;
                }
            }
        }
    }
})


Bun.spawn({
    cmd: ['bun', 'dev', '--host'],
    stdout: 'pipe',
    stdin: 'pipe',
    onExit() {
        console.log(`Webserver stopped`)
    }
})
console.log(`📡 API at http://localhost:5174, Web at http://localhost:5173 !`)