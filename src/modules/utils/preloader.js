export default class Preloader {
    constructor({ manager }) {
        this.preloaderElement = document.getElementById('preloader');
        if (!this.preloaderElement) return;

        if (manager) {

            console.log(this.preloaderElement);

            manager.onStart = (url, itemsLoaded, itemsTotal) => {
                console.log('[preloader] > onStart: ', url, itemsLoaded, itemsTotal);
                this.preloaderElement.classList.add('show');
                this.preloaderElement.style.width = 0;
            }
            manager.onProgress = (url, itemsLoaded, itemsTotal) => {
                console.log('[preloader] > onProgress: ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
                this.preloaderElement.style.width = `${itemsLoaded / itemsTotal * 100}%`;
            };

            manager.onLoad = () => {
                console.log('[preloader] > onLoad: Loading complete!');
                setTimeout(() => {
                    this.preloaderElement.classList.remove('show');
                }, 350);
            };

            manager.onError = (url) => {
                console.error('[preloader] > onError: There was an error loading ' + url);
            };
            
        }
    }
}