import ThreeSixty from '../src/three-sixty';
import { ImageLoader } from '../src/image-loader';

describe('ThreeSixty', () => {
    const imageUrls = [
        'http://example.com/image-0.jpg',
        'http://example.com/image-1.jpg',
        'http://example.com/image-2.jpg',
        'http://example.com/image-3.jpg',
        'http://example.com/image-4.jpg',
        'http://example.com/image-5.jpg'
    ];
    const hotspots = [
        {text: 'Lorem ipsum', angle: 20, endAngle: 60, top: '30%', left: '50%'},
        {text: 'Dolor sit amet', angle: 180, endAngle: 200, top: '42%', left: '55%'}
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

        if (threeSixtyWrapperElement) {
            document.body.removeChild(threeSixtyWrapperElement);
        }
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

        it('should load the specified start angle', (done) => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9});
            const imageLoader = threeSixty['imageLoader'] as ImageLoader;
            const initialImageMock = new Image();

            spyOn(imageLoader, 'load').and.returnValue(new Promise((resolve) => resolve(initialImageMock)));

            threeSixty.initialize(imageUrls, 185);

            expect(imageLoader.load).toHaveBeenCalledWith(imageUrls[2]);

            setTimeout(() => {
                expect(canvas2dContextMock.drawImage).toHaveBeenCalledWith(
                    initialImageMock,
                    0,
                    -canvasElement.height,
                    canvasElement.width,
                    canvasElement.height * 9
                );

                done();
            }, 50);
        });

        it('should throw an error if an invalid start angle was specified', () => {
            const expectedErrorMessage = 'The specified start angle must be between 0 and 360.';
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9});

            expect(() => threeSixty.initialize(imageUrls, -1)).toThrow(expectedErrorMessage);
            expect(() => threeSixty.initialize(imageUrls, 361)).toThrow(expectedErrorMessage);
        });

        it('should show a hotspot when its configured angle is the start angle', () => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9, hotspots: [
                {text: 'Lorem ipsum', angle: 180, endAngle: 320, top: '30%', left: '50%'},
                {text: 'Dolor sit amet', angle: 0, endAngle: 10, top: '42%', left: '55%'}
            ]});

            threeSixty.initialize(imageUrls);

            const threeSixtyWrapperElement = document.querySelector(`.${ThreeSixty.CONTAINER_CLASS}`);
            const hotspotElements = threeSixtyWrapperElement.querySelectorAll(`.${ThreeSixty.HOTSPOT_CLASS}`);

            expect(hotspotElements[1].classList).toContain(ThreeSixty.HOTSPOT_ACTIVE_CLASS);
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
            (threeSixty['hammer'] as any).emit('pan', {deltaX: -20, deltaY: 0});

            expect(imageLoader.load).toHaveBeenCalledWith(imageUrls[3]);

            setTimeout(() => {
                expect(canvas2dContextMock.drawImage).toHaveBeenCalledWith(
                    dragImageMock,
                    0,
                    -canvasElement.height * 4,
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
            (threeSixty['hammer'] as any).emit('pan', {deltaX: -20, deltaY: 0});

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
            (threeSixty['hammer'] as any).emit('pan', {deltaX: 150, deltaY: 0});

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
            (threeSixty['hammer'] as any).emit('pan', {deltaX: -65, deltaY: 0});

            const threeSixtyWrapperElement = document.querySelector(`.${ThreeSixty.CONTAINER_CLASS}`);
            const hotspotElements = threeSixtyWrapperElement.querySelectorAll(`.${ThreeSixty.HOTSPOT_CLASS}`);

            expect(hotspotElements[1].classList).toContain(ThreeSixty.HOTSPOT_ACTIVE_CLASS);
        });

        it('should hide a hotspot when its configured end angle is reached', () => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9, hotspots: hotspots});
            const imageLoader = threeSixty['imageLoader'] as ImageLoader;

            threeSixty.initialize(imageUrls);

            (threeSixty['hammer'] as any).emit('panstart', {});
            (threeSixty['hammer'] as any).emit('pan', {deltaX: -40, deltaY: 0});
            (threeSixty['hammer'] as any).emit('pan', {deltaX: -80, deltaY: 0});

            const threeSixtyWrapperElement = document.querySelector(`.${ThreeSixty.CONTAINER_CLASS}`);
            const hotspotElements = threeSixtyWrapperElement.querySelectorAll(`.${ThreeSixty.HOTSPOT_CLASS}`);

            expect(hotspotElements[1].classList).not.toContain(ThreeSixty.HOTSPOT_ACTIVE_CLASS);
        });
    });

    describe('::updateConfiguration', () => {
        it('should update the hotspots in the DOM tree', () => {
            const configuration = {angles: 36, anglesPerImage: 9, hotspots: [
                {text: 'Lorem ipsum', angle: 180, endAngle: 320},
                {text: 'Dolor sit amet', angle: 50, endAngle: 80}
            ]};
            const newConfiguration = {
                angles: 18, anglesPerImage: 1, hotspots: [
                    {text: 'foo', angle: 180, endAngle: 300, top: '30%', left: '50%'},
                    {text: 'bar', angle: 20, endAngle: 40, top: '42%', left: '55%'}
                ]
            };

            const threeSixty = new ThreeSixty(canvasElement, configuration);
            threeSixty.initialize(imageUrls);

            threeSixty.updateConfiguration(newConfiguration);

            const threeSixtyWrapperElement = document.querySelector(`.${ThreeSixty.CONTAINER_CLASS}`);
            const hotspotElements = threeSixtyWrapperElement.querySelectorAll(`.${ThreeSixty.HOTSPOT_CLASS}`);

            expect(hotspotElements.length).toBe(2);
            expect(hotspotElements[0].innerText).toBe('foo');
            expect(hotspotElements[0].style.top).toBe('30%');
            expect(hotspotElements[0].style.left).toBe('50%');
            expect(hotspotElements[1].innerText).toBe('bar');
            expect(hotspotElements[1].style.top).toBe('42%');
            expect(hotspotElements[1].style.left).toBe('55%');
        });
    });

    describe('updateImages', () => {
        const newImageUrls = [
            'http://example.com/newImage-0.jpg',
            'http://example.com/newImage-1.jpg',
            'http://example.com/newImage-2.jpg',
            'http://example.com/newImage-3.jpg',
            'http://example.com/newImage-4.jpg',
            'http://example.com/newImage-5.jpg'
        ];

        it('should re-render the images', (done) => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9});
            const imageLoader = threeSixty['imageLoader'] as ImageLoader;
            const initialImageMock = new Image();
            const newInitialImageMock = new Image();

            spyOn(imageLoader, 'load').and.returnValues(
                new Promise((resolve) => resolve(initialImageMock)),
                new Promise((resolve) => resolve(newInitialImageMock))
            );

            threeSixty.initialize(imageUrls);

            threeSixty.updateImages(newImageUrls);

            expect(imageLoader.load).toHaveBeenCalledWith(newImageUrls[0]);

            setTimeout(() => {
                expect(canvas2dContextMock.drawImage).toHaveBeenCalledWith(
                    newInitialImageMock,
                    0,
                    -0,
                    canvasElement.width,
                    canvasElement.height * 9
                );

                done();
            }, 50);
        });

        it('should show the correct angle after re-rendering', (done) => {
            const threeSixty = new ThreeSixty(canvasElement, {angles: 36, anglesPerImage: 9});
            const imageLoader = threeSixty['imageLoader'] as ImageLoader;
            const initialImageMock = new Image();
            const newInitialImageMock = new Image();

            spyOn(imageLoader, 'load').and.returnValues(
                new Promise((resolve) => resolve(initialImageMock)),
                new Promise((resolve) => resolve(initialImageMock)),
                new Promise((resolve) => resolve(newInitialImageMock))
            );

            threeSixty.initialize(imageUrls);

            (threeSixty['hammer'] as any).emit('panstart', {});
            (threeSixty['hammer'] as any).emit('pan', {deltaX: -20, deltaY: 0});

            threeSixty.updateImages(newImageUrls);

            expect(imageLoader.load).toHaveBeenCalledWith(newImageUrls[3]);

            setTimeout(() => {
                expect(canvas2dContextMock.drawImage).toHaveBeenCalledWith(
                    newInitialImageMock,
                    0,
                    -canvasElement.height * 4,
                    canvasElement.width,
                    canvasElement.height * 9
                );

                done();
            }, 50);
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
