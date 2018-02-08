export class ImageLoader {

    /**
     * @type {{[string]: Image}}
     */
    private cache: any = {};

    /**
     * Load an image
     *
     * @param {string} url
     * @returns {Promise<Image>}
     */
    public load(url: string): Promise<any> {
        return new Promise((resolve) => {
            if (this.cache.hasOwnProperty(url)) {
                return resolve(this.cache[url]);
            }

            const image = new Image();

            image.onload = () => {
                this.cache[url] = image;

                resolve(image);
            };

            image.src = url;
        });
    }
}
