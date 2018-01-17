import { ImageLoader } from '../src/image-loader';

describe('ImageLoader', () => {
    let imageLoader: ImageLoader;
    let onload: Function;
    let src: string;

    // Mock class to test the Image properties
    class ImageDom {
        public set onload(value) {
            onload = value;
        }

        public set src(value) {
            src = value;
        }
    }

    beforeEach(() => {
        imageLoader = new ImageLoader();

        window['Image'] = ImageDom;
    });

    describe('::load', () => {
        it('should load the requested URL', (done) => {
            const url = 'http://example.com/image.jpg';

            imageLoader.load(url).then((image: any) => {
                expect(image instanceof Image).toBeTruthy();
                expect(src).toBe(url);

                done();
            });

            onload();
        });
    });
});
