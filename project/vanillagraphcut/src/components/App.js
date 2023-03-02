import toImage from '../utils/toImage';
import Drawable from '../utils/Drawable';


const colorsByBrush = {
    foreground: 'red',
    background: 'green'
};

function App() {
    // class properties

    /**
     * @type {null | Function}
     */
    let detachListener = null;

    /**
     * @type {null | Drawable}
     */
    let drawableCanvas = null;

    // HTML elements

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
     * @type {HTMLCanvasElement}
     */
    const imageCanvas = document.querySelector('#image-canvas');
    /**
     * @type {HTMLCanvasElement}
     */
    const seederCanvas = document.querySelector('#seeder-canvas');
    /**
     * @type {HTMLFieldSetElement}
     */
    const brushSelector = document.querySelector('#brush-selector');

    detachListener = attachListeners();

    function attachListeners() {
        fileUploader.addEventListener('change', handleFileUploaded);
        eraserButton.addEventListener('click', clear);
        graphCutButton.addEventListener('click', send);
        brushSelector.addEventListener('change', handleSelectedBush);

        return () => {
            fileUploader.removeEventListener('change', handleFileUploaded)
            eraserButton.removeEventListener('click', clear);
            graphCutButton.removeEventListener('click', send);
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
        
        toImage(files[0])
            .then((image) => {
                // hide placeholder
                hide(placeholder);
                // render image
                renderImage(image); 
                // TODO: refactor into its own function
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
        // resize image canvas based on the given image
        imageCanvas.height = image.height;
        imageCanvas.width = image.width;

        // resize seeder canvas based on the given image
        seederCanvas.height = image.height;
        seederCanvas.width = image.width;

        imageCanvas.getContext('2d').drawImage(image, 0, 0);

        // attach drawable behavior
        drawableCanvas = Drawable(seederCanvas);
    }

    function clear() {
        drawableCanvas.clear();
    }

    function run() {
        eraserButton.disabled = true;
        graphCutButton.disabled = true;
        // disabled all button
    }

    function send() {
        // TODO: provide feedback when google (IPython is not available in the global scope)
        if (!window.google) { return; }

        let image = imageCanvas.toDataURL();
        let seedImage = seederCanvas.toDataURL();
        // TODO: show spinner
        window.google.colab.kernel.invokeFunction(
            'notebook.graphCut',
            [image, seedImage],
            {}
        ).then(() => {
            console.log('successfully sent')
        }).catch(error => {
            // TODO: show error screen
            console.log('whoops something went wrong')
            console.log(error);
        })
        .finally(() => {
            // TODO: hidden spinner
            console.log('finished')
        });

    }

    function dispose() {
        if (detachListener) { detachListener(); }
    }

    return {
        run,
        send,
        renderImage,
        dispose,
        clear
    }
}

export default App;