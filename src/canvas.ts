export default class Carte {
    private canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    w: number
    h: number

    constructor() {
        const canvas = document.querySelector('canvas');
        if(canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.canvas = canvas;
        } else {
            const canvas = document.createElement('canvas');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            document.body.append(canvas);
            this.canvas = canvas;
            
        }
        
        const ctx = this.canvas.getContext('2d');
        if(!ctx) throw new Error("Impossible d'intéragir avec le canvas!");
        this.ctx = ctx;
        this.ctx.imageSmoothingEnabled = false
        
        this.w = canvas?.width || window.innerWidth;
        this.h = canvas?.height || window.innerHeight;
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.w = window.innerWidth;
            this.h = window.innerHeight;
        })
    }
    
    clear() {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.w, this.h);
    }
    rect(position: [number, number], taille: [number, number], color: string) {
        const [x, y] = position;
        const [w, h] = taille;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h)
    }
    circle(position: [number, number], taille: [number, number], color: string) {
        const [x, y] = position;
        const [w, h] = taille;
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath()
        this.ctx.ellipse(x + w / 2, y + h / 2, w / 4, h / 4, 0, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.closePath()
    }
    
}