# Jeu du Chat (/it /freeze tag in english)

It is a game, you have to tap other when you are the seeker. When you are not the seeker you have to escape the seeker!

---

![chat](/img/chat.png)
![chat](/img/phone.PNG)

## Features

- Uses Websocket
- Uses Deno, Typescript and Web standards
- Works on mobile
- Docker image
- Lightweight


## Development

The project is divided in two parts,
`/app` is the server logic operated using Deno's HTTP Server API.
`/src` is the client logic.


#### /app
We use `Deno.serve` as an entrypoint for requests

it **serves static files** located at `./dist` 
and **handles websocket requests**

The state of the game is kept using a `Map`.

#### /src

We use the Canvas API to render the app, it is based on a grid system and Websocket API to communicate with the backend.

I created tools (to keep a layer of abstraction) in separated files as Class. But the magic happens in a [function](./src/main.ts:95) that is executed every frame (`requestAnimationFrame`).

#### Commands

`deno install` -> install dependencies (vite & ts)
`deno task build` -> build the frontend (ts -> js + html to dist)
`deno run --allow-net --allow-read=./dist app/index.ts` -> start the server (serves static files & handle WS connections)
`docker build -t chat .` -> build the docker image
