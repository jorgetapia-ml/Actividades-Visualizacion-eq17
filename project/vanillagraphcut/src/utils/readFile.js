/**
 * 
 * @param {File} file 
 * @returns {Promise<Image>}
 */
function readFile(file) {
    const image = new window.Image();
    image.src = window.URL.createObjectURL(file);
    return new Promise((resolve) => {
        image.onload = () => {
            resolve(image)
        }
    })
}