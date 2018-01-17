import ThreeSixty from '../src/three-sixty';
import { ImageLoader } from '../src/image-loader';

describe('ThreeSixty', () => {
    const imageUrls = [
        'http://example.com/image-0.jpg',
        'http://example.com/image-1.jpg',
        'http://example.com/image-2.jpg',
        'http://example.com/image-3.jpg'
    ];
    const hotspots = [
        {text: 'Lorem ipsum', angle: 0.5, endAngle: 0.7, top: '30%', left: '50%'},
        {text: 'Dolor sit amet', angle: 0.2, endAngle: 0.3, top: '42%', left: '55%'}
    ];
    let canvasElement: HTMLCanvasElement;
    let canvas2dContextMock;

    beforeEach(() => {
        canvasElement = document.createElement('canvas');
        canvasElement.width = 1280;
        canvasElement.height = 720;

        document.body.appendChild(canvasElement);

        canvas2dContextMock = {drawImage: jasmine.createSpy('canvas2dContextMock.drawImage')};

        spyOn(canvasElement, 'getContext').and.returnValue(canvas2dContextMock);
    });

    afterEach(() => {
        const threeSixtyWrapperElement = document.querySelector(`.${ThreeSixty.CONTAINER_CLASS}`);

        document.body.removeChild(threeSixtyWrapperElement);
    });

    describe('::initialize', () => {
        it('should wrap the canvas', () => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9});

            threeSixty.initialize(imageUrls);

            const threeSixtyWrapperElement = document.querySelector(`.${ThreeSixty.CONTAINER_CLASS}`);

            expect(threeSixtyWrapperElement.contains(canvasElement)).toBeTruthy();
        });

        it('should add the configured hotspots to the DOM tree', () => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9, hotspots: hotspots});

            threeSixty.initialize(imageUrls);

            const threeSixtyWrapperElement = document.querySelector(`.${ThreeSixty.CONTAINER_CLASS}`);
            const hotspotElements = threeSixtyWrapperElement.querySelectorAll(`.${ThreeSixty.HOTSPOT_CLASS}`);

            expect(hotspotElements.length).toBe(2);
            expect(hotspotElements[0].innerText).toBe('Lorem ipsum');
            expect(hotspotElements[0].style.top).toBe('30%');
            expect(hotspotElements[0].style.left).toBe('50%');
            expect(hotspotElements[1].innerText).toBe('Dolor sit amet');
            expect(hotspotElements[1].style.top).toBe('42%');
            expect(hotspotElements[1].style.left).toBe('55%');
        });

        it('should accept hotspots without position values', () => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9, hotspots: [
                {text: 'Lorem ipsum', angle: 0.5, endAngle: 0.7},
                {text: 'Dolor sit amet', angle: 0.2, endAngle: 0.3}
            ]});

            threeSixty.initialize(imageUrls);

            const threeSixtyWrapperElement = document.querySelector(`.${ThreeSixty.CONTAINER_CLASS}`);
            const hotspotElements = threeSixtyWrapperElement.querySelectorAll(`.${ThreeSixty.HOTSPOT_CLASS}`);

            expect(hotspotElements[0].style.top).toBe('');
            expect(hotspotElements[0].style.left).toBe('');
            expect(hotspotElements[1].style.top).toBe('');
            expect(hotspotElements[1].style.left).toBe('');
        });

        it('should load the first image initially', (done) => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9});
            const imageLoader = threeSixty['imageLoader'] as ImageLoader;
            const initialImageMock = new Image();

            spyOn(imageLoader, 'load').and.returnValue(new Promise((resolve) => resolve(initialImageMock)));

            threeSixty.initialize(imageUrls);

            expect(imageLoader.load).toHaveBeenCalledWith(imageUrls[0]);

            setTimeout(() => {
                expect(canvas2dContextMock.drawImage).toHaveBeenCalledWith(
                    initialImageMock,
                    0,
                    -0,
                    canvasElement.width,
                    canvasElement.height * 9
                );

                done();
            }, 50);
        });

        it('should load the correct image on drag', (done) => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9});
            const imageLoader = threeSixty['imageLoader'] as ImageLoader;
            const initialImageMock = new Image();
            const dragImageMock = new Image();

            spyOn(imageLoader, 'load').and.returnValues(
                new Promise((resolve) => resolve(initialImageMock)),
                new Promise((resolve) => resolve(dragImageMock))
            );

            threeSixty.initialize(imageUrls);

            (threeSixty['hammer'] as any).emit('panstart', {});
            (threeSixty['hammer'] as any).emit('pan', {deltaX: 20, deltaY: 0});

            expect(imageLoader.load).toHaveBeenCalledWith(imageUrls[3]);

            setTimeout(() => {
                expect(canvas2dContextMock.drawImage).toHaveBeenCalledWith(
                    dragImageMock,
                    0,
                    -canvasElement.height * 3,
                    canvasElement.width,
                    canvasElement.height * 9
                );

                done();
            }, 50);
        });

        it('should consider the speedFactor', (done) => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9, speedFactor: 10});
            const imageLoader = threeSixty['imageLoader'] as ImageLoader;
            const initialImageMock = new Image();
            const dragImageMock = new Image();

            spyOn(imageLoader, 'load').and.returnValues(
                new Promise((resolve) => resolve(initialImageMock)),
                new Promise((resolve) => resolve(dragImageMock))
            );

            threeSixty.initialize(imageUrls);

            (threeSixty['hammer'] as any).emit('panstart', {});
            (threeSixty['hammer'] as any).emit('pan', {deltaX: 20, deltaY: 0});

            expect(imageLoader.load).toHaveBeenCalledWith(imageUrls[2]);

            setTimeout(() => {
                expect(canvas2dContextMock.drawImage).toHaveBeenCalledWith(
                    dragImageMock,
                    0,
                    -canvasElement.height * 7,
                    canvasElement.width,
                    canvasElement.height * 9
                );

                done();
            }, 50);
        });

        it('should always have a positive angle', (done) => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9});
            const imageLoader = threeSixty['imageLoader'] as ImageLoader;
            const initialImageMock = new Image();

            spyOn(imageLoader, 'load').and.returnValue(new Promise((resolve) => resolve(initialImageMock)));

            threeSixty.initialize(imageUrls);

            (threeSixty['hammer'] as any).emit('panstart', {});
            (threeSixty['hammer'] as any).emit('pan', {deltaX: -2, deltaY: 0});

            setTimeout(() => {
                expect(threeSixty['angle']).toBeGreaterThan(0);

                done();
            }, 50);
        });

        it('should show a hotspot when its configured angle gets reached', () => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9, hotspots: hotspots});
            const imageLoader = threeSixty['imageLoader'] as ImageLoader;

            threeSixty.initialize(imageUrls);

            (threeSixty['hammer'] as any).emit('panstart', {});
            (threeSixty['hammer'] as any).emit('pan', {deltaX: 40, deltaY: 0});

            const threeSixtyWrapperElement = document.querySelector(`.${ThreeSixty.CONTAINER_CLASS}`);
            const hotspotElements = threeSixtyWrapperElement.querySelectorAll(`.${ThreeSixty.HOTSPOT_CLASS}`);

            expect(hotspotElements[1].classList).toContain(ThreeSixty.HOTSPOT_ACTIVE_CLASS);
        });

        it('should hide a hotspot when its configured end angle is reached', () => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9, hotspots: hotspots});
            const imageLoader = threeSixty['imageLoader'] as ImageLoader;

            threeSixty.initialize(imageUrls);

            (threeSixty['hammer'] as any).emit('panstart', {});
            (threeSixty['hammer'] as any).emit('pan', {deltaX: 40, deltaY: 0});
            (threeSixty['hammer'] as any).emit('pan', {deltaX: 80, deltaY: 0});

            const threeSixtyWrapperElement = document.querySelector(`.${ThreeSixty.CONTAINER_CLASS}`);
            const hotspotElements = threeSixtyWrapperElement.querySelectorAll(`.${ThreeSixty.HOTSPOT_CLASS}`);

            expect(hotspotElements[1].classList).not.toContain(ThreeSixty.HOTSPOT_ACTIVE_CLASS);
        });
    });

    describe('::preload', () => {
        it('should preload all images', (done) => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9});
            const imageLoader = threeSixty['imageLoader'] as ImageLoader;
            const imageMock = new Image();

            spyOn(imageLoader, 'load').and.returnValue(new Promise((resolve) => resolve(imageMock)));

            threeSixty.initialize(imageUrls);
            threeSixty.preload().then(() => {
                expect(imageLoader.load).toHaveBeenCalledWith(imageUrls[0]);
                expect(imageLoader.load).toHaveBeenCalledWith(imageUrls[1]);
                expect(imageLoader.load).toHaveBeenCalledWith(imageUrls[2]);
                expect(imageLoader.load).toHaveBeenCalledWith(imageUrls[3]);

                done();
            });
        });
    });
});
