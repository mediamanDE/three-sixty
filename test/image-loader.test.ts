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
        const url = 'http://example.com/image.jpg';

        it('should load the requested URL', (done) => {
            imageLoader.load(url).then((image: any) => {
                expect(image instanceof Image).toBeTruthy();
                expect(src).toBe(url);

                done();
            });

            onload();
        });

        it('should cache the requested URLs', (done) => {
            imageLoader.load(url).then((image: any) => {
                expect(image instanceof Image).toBeTruthy();
                expect(src).toBe(url);

                imageLoader.load(url).then((image: any) => {
                    expect(image instanceof Image).toBeTruthy();
                    expect(src).toBe(url);

                    done();
                });
            });

            onload();
        });

        it('should reject if the image URL is invalid', (done) => {
            imageLoader.load(null).then(() => null, done);

            onload();
        });
    });
});
