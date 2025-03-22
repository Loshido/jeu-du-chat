import { Player } from "./types.ts";
import { serveDir } from "jsr:@std/http/file-server"

// Stocke l'état des joueurs
const players: Map<string, {
    player: Player;
    socket: WebSocket;
}> = new Map();

// Stocke le nom du loup / chercheur / chat
let seeker: string | null = null;

const handleMessages = (event: MessageEvent, ws: WebSocket) => {
    // string -> Message
    const msg = JSON.parse(event.data);
    // when a player joins
    if (msg.type === "joining") {
        // save data
        players.set(msg.player.nom, {
            player: msg.player,
            socket: ws,
        });

        players.forEach(({ player, socket }) => {
            if (player.nom === msg.player.nom) {
                return;
            }

            // sending to everyone that someone joined
            socket.send(JSON.stringify({
                type: "joined",
                player: msg.player,
            }));

            // sending him every other player
            ws.send(JSON.stringify({
                type: "joined",
                player,
            }));
        });

        // assign new seeker
        if (!seeker) {
            seeker = msg.player.nom;
        }
        // send seeker's name
        ws.send(JSON.stringify({
            type: "seeker",
            nom: seeker,
        }));
    } else if (msg.type === "move") {
        const previous_seeker = seeker;
        const data = players.get(msg.player.nom);
        if (!data) return;

        players.set(msg.player.nom, {
            player: {
                ...data.player,
                x: msg.player.x,
                y: msg.player.y,
            },
            socket: data.socket,
        });

        players.forEach(({ player, socket }) => {
            if (player.nom === msg.player.nom) {
                return;
            }

            socket.send(JSON.stringify({
                type: "move",
                player: msg.player,
            }));

            if (seeker !== msg.player.nom) return;

            if (
                Math.floor(msg.player.x) == Math.floor(player.x) &&
                Math.floor(msg.player.y) == Math.floor(player.y)
            ) {
                seeker = player.nom;
            }
        });

        // we tell everyone who is the new seeker
        if (previous_seeker !== seeker) {
            players.forEach(({ socket }) => {
                socket.send(JSON.stringify({
                    type: "seeker",
                    nom: seeker,
                }));
            });
        }
    }
};

const handleCloses = () => {
    // deletes disconnected sessions
    players.forEach(({ player, socket }) => {
    if (socket.readyState > 1) {
        players.delete(player.nom);
        players.forEach((subplayer) => {
            subplayer.socket.send(JSON.stringify({
                type: "disconnected",
                nom: player.nom,
            }));
        });
        if (seeker === player.nom) {
            seeker = null;
        }
        return;
    }
});
}

Deno.serve((req) => {
    if (req.headers.get("upgrade") != "websocket") {
        return serveDir(req, {
            fsRoot: './dist'
        })
    }
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.addEventListener("message", (event) => {
        handleMessages(event, socket);
    });

    socket.addEventListener("close", () => {
        handleCloses()
    });

    return response;
});
