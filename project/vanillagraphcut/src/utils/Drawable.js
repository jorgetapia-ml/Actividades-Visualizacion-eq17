/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @returns {{setStrokeColor: Function, clear: Function }}
 */
function Drawable(canvas) {
    // properites
    /**
     * @type {CanvasRenderingContext2D}
     */
    const ctx = canvas.getContext('2d');
    /**
     * @type {{ x: Number, y: Number }}
     */
    const mouse = { x: 0, y: 0 };
    /**
     * @type {{ x: Number, y: Number }}
     */
    const lastMouse = { x: 0, y: 0 };

    /**
     * @type {Boolean}
     */
    let interactive = false;

    /* Mouse Capturing Work */
    canvas.addEventListener('mousemove', trackMouse, false);

    // brush properties
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'blue';

    canvas.addEventListener('mousedown', function() {
        canvas.addEventListener('mousemove', onPaint, false);
    }, false);

    canvas.addEventListener('mouseup', function() {
        canvas.removeEventListener('mousemove', onPaint, false);
    }, false);

    function trackMouse(ev) {
        lastMouse.x = mouse.x;
        lastMouse.y = mouse.y;
        mouse.x = ev.layerX;
        mouse.y = ev.layerY;
    }

    function onPaint() {
        // do not draw it is not interactive
        if (!interactive) { return; }

        ctx.beginPath();
        ctx.moveTo(lastMouse.x, lastMouse.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.closePath();
        ctx.stroke();
    }

    /**
     * sets the stroke color
     * @param {string} color 
     */
    function setStrokeColor(color) {
        interactive = true;
        ctx.strokeStyle = color;
    }

    /**
     * clears the given canvas
     */
    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function dispose() {
        clear();
        canvas.removeEventListener('mousemove', trackMouse, false);
        canvas.remove();
    }

    return {
        setStrokeColor,
        clear,
        dispose
    }
}


export default Drawable;