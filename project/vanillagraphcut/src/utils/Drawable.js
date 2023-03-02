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
    canvas.addEventListener('mousemove', function(e) {
        lastMouse.x = mouse.x;
        lastMouse.y = mouse.y;
        mouse.x = e.layerX;
        mouse.y = e.layerY;
    }, false);

    // brush properties
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'blue';

    canvas.addEventListener('mousedown', function(e) {
        canvas.addEventListener('mousemove', onPaint, false);
    }, false);

    canvas.addEventListener('mouseup', function() {
        canvas.removeEventListener('mousemove', onPaint, false);
    }, false);

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

    return {
        setStrokeColor,
        clear
    }
}


export default Drawable;