import toImage from '../utils/toImage';
import Drawable from '../utils/Drawable';

const colorsByBrush = {
    foreground: 'rgb(255, 0, 0)',
    background: 'rgb(0, 255, 0)'
};

function App() {
    
    /**
     * @type {null | Image}
     */
    let loadedImage = null;

    /**
     * @type {null | HTMLCanvasElement}
     */
    let imageCanvas = null;

    /**
     * @type {null | HTMLCanvasElement}
     */
    let scribbleCanvas = null;
    
    /**
     * @type {null | Function}
     */
    let detachListener = null;

    /**
     * @type {null | Drawable}
     */
    let drawableCanvas = null;

    /**
     * @type {HTMLInputElement}
     */
    const fileUploader = document.querySelector('#file-upload');

    /**
     * @type {HTMLButtonElement}
     */
    const eraserButton = document.querySelector('#eraser');

    /**
     * @type {HTMLButtonElement}
     */
    const graphCutButton = document.querySelector('#graph-cut');

    /**
     * @type {HTMLDivElement}
     */
    const placeholder = document.querySelector('#placeholder');

    /**
     * @type {HTMLFieldSetElement}
     */
    const brushSelector = document.querySelector('#brush-selector');

    /**
     * @type {HTMLDivElement}
     */
    const scribbleContainer = document.querySelector('#scribble-container');

    /**
     * @type {HTMLDivElement}
     */
    const resultContainer = document.querySelector('#result-container');

    /**
     * @type {HTMLDivElement}
     */
    const spinner = document.querySelector('#spinner');

    function attachListeners() {
        fileUploader.addEventListener('change', handleFileUploaded);
        eraserButton.addEventListener('click', clearScribbles);
        graphCutButton.addEventListener('click', graphcut);
        brushSelector.addEventListener('change', handleSelectedBush);

        return () => {
            fileUploader.removeEventListener('change', handleFileUploaded)
            eraserButton.removeEventListener('click', clearScribbles);
            graphCutButton.removeEventListener('click', graphcut);
            brushSelector.removeEventListener('change', handleSelectedBush);
        }
    }

    /**
     * 
     * @param {Event} ev 
     */
    function handleFileUploaded(ev) {
        const files = ev.target.files;
        // TODO: provide feedback that no files were uploaded or simply fail silently
        if (files.length === 0) { return; }
        
        reset();
        toImage(files[0])
            .then((image) => {
                loadedImage = image;
                // hide placeholder
                hide(placeholder);
                // render image
                renderImage(image); 
                eraserButton.disabled = false;
                graphCutButton.disabled = false;
            });
    }

    function handleSelectedBush(ev) {
        drawableCanvas.setStrokeColor(colorsByBrush[ev.target.value]);
    }

    /**
     * removes hidden class on the given element
     * @param {HTMLElement} element 
     */
    function show(element) {
        element.classList.remove('hidden');
    }

    /**
     * adds hidden class on the given element
     * @param {HTMLElement} element 
     */
    function hide(element) {
        element.classList.add('hidden');
    }

    /**
     * renders the given image into a canvas element
     * @param {Image} image 
     */
    function renderImage(image) {
        imageCanvas = document.createElement('canvas');
        scribbleCanvas = document.createElement('canvas');

        scribbleCanvas.classList.add('absolute');
        scribbleCanvas.classList.add('top-0');

        // resize image canvas based on the given image
        imageCanvas.height = image.height;
        imageCanvas.width = image.width;

        // resize seeder canvas based on the given image
        scribbleCanvas.height = image.height;
        scribbleCanvas.width = image.width;

        imageCanvas.getContext('2d').drawImage(image, 0, 0);

        // attach drawable behavior
        drawableCanvas = Drawable(scribbleCanvas);
        scribbleContainer.appendChild(imageCanvas);
        scribbleContainer.appendChild(scribbleCanvas);
    }

    function clearScribbles() {
        if (drawableCanvas) {
            drawableCanvas.clear();
        }
    }

    function reset() {
        if (imageCanvas) { imageCanvas.remove(); }
        if (drawableCanvas) {
            drawableCanvas.dispose();
            drawableCanvas = null;
        }
        hide(resultContainer);
        show(scribbleContainer);
    }

    function run() {
        eraserButton.disabled = true;
        graphCutButton.disabled = true;
        detachListener = attachListeners();
    }

    function populateResults(originalImage, segmentedImage, processingTime) {
        resultContainer.querySelector('#output-original').src = originalImage.src;
        resultContainer.querySelector('#output-segmented').src = segmentedImage.replace(/'/g, '');
        resultContainer.querySelector('#output-dimension').innerText = `${imageCanvas.height} x ${imageCanvas.width}`;
        resultContainer.querySelector('#output-processing-time').innerText = `${processingTime} s`;
    }

    function graphcut() {
        // TODO: provide feedback when google (IPython is not available in the global scope)
        if (!window.google) { return; }

        let image = imageCanvas.toDataURL();
        let scribbledImage = scribbleCanvas.toDataURL();

        show(spinner)
        const start = new Date().getTime();
        window.google.colab.kernel.invokeFunction(
            'notebook.segment',
            [image, scribbledImage],
            {}
        ).then(response => {
            const end = new Date().getTime()
            populateResults(loadedImage, response.data['text/plain'], (end - start) / 1000);
            hide(scribbleContainer);
            show(resultContainer);
        }).catch(error => {
            // TODO: show error screen
            console.log('whoops something went wrong')
            console.log(error);
        })
        .finally(() => {
            hide(spinner)
        });
    }

    return {
        run,
        renderImage
    }
}

export default App;