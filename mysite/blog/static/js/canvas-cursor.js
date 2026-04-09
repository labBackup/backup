// Node class for physics simulation
function Node() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
}

// Wave/oscillation helper
function Wave(config) {
    this.init(config || {});
}

Wave.prototype = {
    init: function(config) {
        this.phase = config.phase || 0;
        this.offset = config.offset || 0;
        this.frequency = config.frequency || 0.001;
        this.amplitude = config.amplitude || 1;
    },
    update: function() {
        this.phase += this.frequency;
        return this.offset + Math.sin(this.phase) * this.amplitude;
    },
    value: function() {
        return this.offset + Math.sin(this.phase) * this.amplitude;
    }
};

// Line/trail class with physics
function Line(config) {
    this.init(config || {});
}

Line.prototype = {
    init: function(config) {
        this.spring = config.spring + 0.1 * Math.random() - 0.02;
        this.friction = settings.friction + 0.01 * Math.random() - 0.002;
        this.nodes = [];
        
        for (let i = 0; i < settings.size; i++) {
            const node = new Node();
            node.x = pos.x;
            node.y = pos.y;
            this.nodes.push(node);
        }
    },
    update: function() {
        let springVal = this.spring;
        let node = this.nodes[0];
        
        node.vx += (pos.x - node.x) * springVal;
        node.vy += (pos.y - node.y) * springVal;

        for (let i = 0; i < this.nodes.length; i++) {
            node = this.nodes[i];

            if (i > 0) {
                const prevNode = this.nodes[i - 1];
                node.vx += (prevNode.x - node.x) * springVal;
                node.vy += (prevNode.y - node.y) * springVal;
                node.vx += prevNode.vx * settings.dampening;
                node.vy += prevNode.vy * settings.dampening;
            }

            node.vx *= this.friction;
            node.vy *= this.friction;
            node.x += node.vx;
            node.y += node.vy;

            springVal *= settings.tension;
        }
    },
    draw: function() {
        const nodes = this.nodes;
        let x = nodes[0].x;
        let y = nodes[0].y;

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (let i = 1; i < nodes.length - 2; i++) {
            const node1 = nodes[i];
            const node2 = nodes[i + 1];
            x = 0.5 * (node1.x + node2.x);
            y = 0.5 * (node1.y + node2.y);
            ctx.quadraticCurveTo(node1.x, node1.y, x, y);
        }

        const lastNode = nodes[nodes.length - 2];
        const finalNode = nodes[nodes.length - 1];
        ctx.quadraticCurveTo(lastNode.x, lastNode.y, finalNode.x, finalNode.y);
        ctx.stroke();
        ctx.closePath();
    }
};

// Configuration
const settings = {
    debug: false,
    friction: 0.5,
    trails: 20,
    size: 50,
    dampening: 0.25,
    tension: 0.98
};

let ctx;
let wave;
let pos = { x: 0, y: 0 };
let lines = [];
let isRunning = false;

// Handle mouse/touch movement
function onMouseMove(e) {
    if (e.touches) {
        pos.x = e.touches[0].pageX;
        pos.y = e.touches[0].pageY;
    } else {
        pos.x = e.clientX;
        pos.y = e.clientY;
    }

    if (!isRunning) {
        isRunning = true;
        // Initialize lines
        lines = [];
        for (let i = 0; i < settings.trails; i++) {
            lines.push(new Line({ spring: 0.4 + (i / settings.trails) * 0.025 }));
        }
        render();
    }
}

// Animation loop
function render() {
    if (!isRunning) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    // Update wave color
    ctx.strokeStyle = 'hsla(' + Math.round(wave.update()) + ',50%,50%,0.2)';
    ctx.lineWidth = 1;

    // Update and draw all trails
    for (let i = 0; i < lines.length; i++) {
        lines[i].update();
        lines[i].draw();
    }

    requestAnimationFrame(render);
}

// Handle window resize
function resizeCanvas() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

// Initialize
function initCanvasCursor() {
    const canvas = document.getElementById('canvas-cursor');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');

    // Create wave animation for color cycling
    wave = new Wave({
        phase: Math.random() * 2 * Math.PI,
        amplitude: 85,
        frequency: 0.0015,
        offset: 285
    });

    resizeCanvas();

    // Event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onMouseMove);
    window.addEventListener('resize', resizeCanvas);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCanvasCursor);
} else {
    initCanvasCursor();
}
