import { ConfigurationInterface } from './interfaces/configuration.interface';
import { ImageLoader } from './image-loader';
import { HotspotInterface } from './interfaces/hotspot.interface';
const Hammer = require('hammerjs');

export default class ThreeSixty {

    /**
     * @type {string}
     */
    public static CONTAINER_CLASS = 'three-sixty-container';

    /**
     * @type {string}
     */
    public static HOTSPOT_CLASS = 'three-sixty__hotspot';

    /**
     * @type {string}
     */
    public static HOTSPOT_ACTIVE_CLASS = 'three-sixty__hotspot--active';

    /**
     * Array of image sprites
     *
     * @type {string[]}
     */
    private images: string[];

    /**
     * @type {Hammer}
     */
    private hammer: any;

    /**
     * @type {HTMLElement}
     */
    private containerElement: HTMLElement;

    /**
     * @type {HTMLElement[]}
     */
    private hotspotElements: HTMLElement[] = [];

    /**
     * @type {CanvasRenderingContext2D}
     */
    private canvas2dContext: CanvasRenderingContext2D;

    /**
     * @type {ImageLoader}
     */
    private imageLoader: ImageLoader;

    /**
     * Angle of the current image
     * Number between 0 and 1 in 0.01 steps
     *
     * @type {number}
     */
    private angle: number = 0;

    /**
     * Angle of the image before the drag process began
     *
     * @type {number}
     */
    private preDragAngle: number = 0;

    /**
     * @param {HTMLCanvasElement} canvasElement
     * @param {ConfigurationInterface} configuration
     */
    constructor(private canvasElement: HTMLCanvasElement, private configuration: ConfigurationInterface) {
        this.canvas2dContext = this.canvasElement.getContext('2d') as CanvasRenderingContext2D;
        this.imageLoader = new ImageLoader();
    }

    /**
     * Initialize the three sixty widget
     *
     * @param {string[]} images - Array of image sprites
     * @param {number} startAngle - The initial angle to show (number between 0 and 360)
     */
    public initialize(images: string[], startAngle: number = 0) {
        if (startAngle < 0 || startAngle > 360) {
            throw new Error('The specified start angle must be between 0 and 360.');
        }

        this.images = images;

        // Wrap the canvas element
        this.containerElement = document.createElement('div');
        this.containerElement.classList.add(ThreeSixty.CONTAINER_CLASS);
        (this.canvasElement.parentElement as HTMLElement).insertBefore(this.containerElement, this.canvasElement);
        this.containerElement.appendChild(this.canvasElement);

        this.initializeHotspots();
        this.initializeEventListeners();

        let targetImageIndex = Math.round(startAngle / (360 / this.configuration.angles)) - 1;
        let targetSpriteIndex = Math.floor(targetImageIndex / this.configuration.anglesPerImage) - 1;

        if (targetImageIndex < 0) {
            targetImageIndex = 0;
        }
        if (targetSpriteIndex < 0) {
            targetSpriteIndex = 0;
        }

        this.imageLoader.load(this.images[targetSpriteIndex])
            .then((image) => this.drawAngle(image, targetImageIndex % this.configuration.angles));
    }

    /**
     * Update the configuration and re-render the hotspots
     *
     * @param {ConfigurationInterface} configuration
     */
    public updateConfiguration(configuration: ConfigurationInterface) {
        this.configuration = configuration;

        this.hotspotElements.forEach((hotspotElement: HTMLElement) => hotspotElement.parentElement.removeChild(hotspotElement));
        this.hotspotElements = [];

        this.initializeHotspots();
    }

    /**
     * Update and re-render the images
     *
     * @param {string[]} images
     */
    public updateImages(images: string[]) {
        this.images.splice(0);
        this.images.push(...images);

        const imageIndexes = this.getImageIndexesForCurrentAngle();

        this.imageLoader.load(this.images[imageIndexes.targetSpriteIndex])
            .then((image) => this.drawAngle(image, imageIndexes.targetImageIndex));
    }

    /**
     * Preload all images
     *
     * @returns {Promise<null>}
     */
    public preload(): Promise<null> {
        return new Promise((resolve) => {
            let imagesLoaded = 0;

            /**
             * Preload a single image
             * Resolve the Promise if all images were loaded
             *
             * @param {string} url
             */
            const preloadImage = (url: string) => {
                this.imageLoader.load(url)
                    .then(() => {
                        imagesLoaded++;

                        if (imagesLoaded === this.images.length) {
                            resolve();
                        }
                    });
            };

            this.images.forEach(preloadImage.bind(this));
        });
    }

    /**
     * Initialize the hotspots
     */
    private initializeHotspots() {
        if (this.configuration.hotspots) {
            this.configuration.hotspots.forEach((hotspot: HotspotInterface) => {
                const hotspotElement = document.createElement('div');

                hotspotElement.classList.add(ThreeSixty.HOTSPOT_CLASS);
                hotspotElement.innerText = hotspot.text;

                if (hotspot.top) {
                    hotspotElement.style.top = hotspot.top;
                }
                if (hotspot.left) {
                    hotspotElement.style.left = hotspot.left;
                }

                this.hotspotElements.push(hotspotElement);
            });
            this.hotspotElements.forEach((hotSpotElement) => this.containerElement.appendChild(hotSpotElement));

            this.showActiveHotspots();
        }
    }

    /**
     * Show the active hotspots
     */
    private showActiveHotspots() {
        if (this.configuration.hotspots) {
            this.configuration.hotspots.forEach((hotspot: HotspotInterface, i: number) => {
                if (hotspot.angle <= this.angle && hotspot.endAngle > this.angle) {
                    this.hotspotElements[i].classList.add(ThreeSixty.HOTSPOT_ACTIVE_CLASS);
                } else {
                    this.hotspotElements[i].classList.remove(ThreeSixty.HOTSPOT_ACTIVE_CLASS);
                }
            });
        }
    }

    /**
     * Initialize the event listeners
     */
    private initializeEventListeners() {
        this.hammer = new Hammer(this.canvasElement);

        this.hammer.get('pan').set({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 0});

        this.hammer.on('pan', this.onDrag.bind(this));
        this.hammer.on('panstart', this.onDragStart.bind(this));
    }

    /**
     * Get the target image indexes for the current angle
     */
    private getImageIndexesForCurrentAngle(): {targetImageIndex: number, targetSpriteIndex: number} {
        const sn = Math.sin(this.angle * Math.PI * 2);
        const cs = Math.cos(this.angle * Math.PI * 2);

        const targetImageIndex = (Math.floor((Math.atan2(sn, -cs) / (Math.PI * 2) + 0.5) * this.configuration.angles) % this.configuration.angles);
        const targetSpriteIndex = Math.floor(targetImageIndex / this.configuration.anglesPerImage);

        return {targetImageIndex: targetImageIndex % this.configuration.anglesPerImage, targetSpriteIndex};
    }

    /**
     * Draw a specific angle
     *
     * @param {Image} image
     * @param {number} imageIndex
     */
    private drawAngle(image: any, imageIndex: number) {
        let loaded = false;

        const _drawAngle = () => {
            this.canvas2dContext.drawImage(
                image,
                0,
                -this.canvasElement.height * imageIndex,
                this.canvasElement.width,
                this.canvasElement.height * this.configuration.anglesPerImage
            );

            if (!loaded) {
                window.requestAnimationFrame(_drawAngle.bind(this));

                loaded = true;
            }
        };

        window.requestAnimationFrame(_drawAngle.bind(this));
    }

    /**
     * Drag the angle
     *
     * @param {{deltaX: number}} e
     */
    private onDrag(e: {deltaX: number}) {

        // Calculate new image angle
        this.adaptAngle(e.deltaX);

        const imageIndexes = this.getImageIndexesForCurrentAngle();

        // Load and render new image angle
        this.imageLoader.load(this.images[imageIndexes.targetSpriteIndex])
            .then((image) => this.drawAngle(image, (imageIndexes.targetImageIndex)));

        this.showActiveHotspots();
    }

    /**
     * Cache the angle before the drag starts
     */
    private onDragStart() {
        this.preDragAngle = this.angle;
    }

    /**
     * Recalculate the canvas angle
     *
     * @param {number} distance
     */
    private adaptAngle(distance: number) {
        distance = Math.ceil(distance * (this.configuration.speedFactor ? this.configuration.speedFactor : 5));

        const width = window.innerWidth;
        const dx = (distance / width);

        this.angle = (this.preDragAngle + dx * 1.5);

        while (this.angle < 0) {
            this.angle++;
        }

        this.angle = this.angle % 1;
    }
}
