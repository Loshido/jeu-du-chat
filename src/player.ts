export default class Player {
    x: number = 0
    y: number = 0
    nom: string
    couleur: string

    constructor(nom: string, couleur: string, x?: number, y?: number) {
        this.nom = nom;
        this.couleur = couleur;
        if(x) this.x = x;
        if(y) this.y = y;
    }
    changerCouleur(couleur: string) {
        this.couleur = couleur
    }
}

export class LocalPlayer extends Player {
    keys: { [key: string]: boolean }
    constructor(nom: string, couleur: string, x?: number, y?: number) {
        super(nom, couleur, x, y)
        this.keys = {}

        document.addEventListener('keydown', event => {
            event.preventDefault()
            if(event.key === 'z') {
                this.keys['z'] = true
            } else if(event.key === 's') {
                this.keys['s'] = true
            } else if(event.key === 'q') {
                this.keys['q'] = true
            } else if(event.key === 'd') {
                this.keys['d'] = true
            }
        });
        
        document.addEventListener('keyup', event => {
            event.preventDefault()
            if(event.key === 'z') {
                this.keys['z'] = false
            } else if(event.key === 's') {
                this.keys['s'] = false
            } else if(event.key === 'q') {
                this.keys['q'] = false
            } else if(event.key === 'd') {
                this.keys['d'] = false
            }
        })

        let [w, h] = [window.innerWidth, window.innerHeight];
        window.addEventListener('resize', () => {
            h = window.innerHeight,
            w = window.innerWidth
        })
        window.addEventListener('orientationchange', () => {
            h = window.innerHeight,
            w = window.innerWidth
        })
        document.addEventListener('touchstart', (ev) => {
            ev.preventDefault()
            if(ev.touches.length === 0) return;

            const touch = ev.touches[0];

            if(touch.clientX < w * 0.45) {
                this.keys['q'] = true
            } else if(touch.clientX > w * 0.55) {
                this.keys['d'] = true 
            }

            if(touch.clientY < h * 0.45) {
                this.keys['z'] = true
            } else if(touch.clientY > h * 0.55) {
                this.keys['s'] = true
            }
        })
        
        document.addEventListener('touchmove', (ev) => {
            ev.preventDefault()
            if(ev.touches.length === 0) return;
    
            if(ev.touches.length === 0) return;

            const touch = ev.touches[0];

            if(touch.clientX < w * 0.4) {
                this.keys['q'] = true
                this.keys['d'] = false
            } else if(touch.clientX > w * 0.6) {
                this.keys['d'] = true 
                this.keys['q'] = false
            } else {
                this.keys['q'] = false
                this.keys['d'] = false
            }

            if(touch.clientY < h * 0.4) {
                this.keys['z'] = true
                this.keys['s'] = false
            } else if(touch.clientY > h * 0.6) {
                this.keys['s'] = true
                this.keys['z'] = false
            } else {
                this.keys['z'] = false;
                this.keys['s'] = false;
            }
        })
        
        document.addEventListener('touchend', (ev) => {
            ev.preventDefault()
            if(ev.changedTouches.length === 0) return;
    
            this.keys['z'] = false;
            this.keys['s'] = false;
            this.keys['q'] = false;
            this.keys['d'] = false;
        })
    }
}