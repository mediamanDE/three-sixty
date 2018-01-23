# 360° library

A library that makes creating a 360° viewer extremely easy.

[![Build Status](https://travis-ci.org/mediamanDE/three-sixty.svg?branch=master)](https://travis-ci.org/mediamanDE/three-sixty)
[![npm version](https://badge.fury.io/js/%40mediaman%2Fthree-sixty.svg)](https://badge.fury.io/js/%40mediaman%2Fthree-sixty)

## Features

  - Works on desktop and on touch devices
  - As many angles as you want
  - Single image per angle or multiple angles in multiple sprites possible
  - Adjustable speed
  - Hotspots for a specified angle range
 
## Installation

```bash
npm install --save @mediaman/three-sixty
```

## Importing library

You can import the bundle to use the whole library:

```javascript
import ThreeSixty from '@mediaman/three-sixty';
```

### Inside the browser

You can also use the bundled version directly inside the browser:

```html
<script src="node_modules/@mediaman/three-sixty/dist/three-sixty.bundle.js"></script>
```

## Usage

### Basic usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>360°</title>
    
    <link rel="stylesheet" href="node_modules/@mediaman/three-sixty/dist/three-sixty.css">
</head>
<body>
<canvas width="1280" height="720"></canvas>
</body>
</html>
```

```javascript
const threeSixty = new ThreeSixty(document.getElementsByTagName('canvas')[0], {
    angles: 36,
    anglesPerImage: 6
});

threeSixty.initialize([
    'http://example.com/images/360/image-0.jpg',
    'http://example.com/images/360/image-1.jpg',
    'http://example.com/images/360/image-2.jpg',
    'http://example.com/images/360/image-3.jpg',
    'http://example.com/images/360/image-4.jpg',
    'http://example.com/images/360/image-5.jpg'
]);
```

### Preloading

You can preload all angle images so that the animation is even smoother when using it the first time.

```javascript
const threeSixty = new ThreeSixty(document.getElementsByTagName('canvas')[0], {
    angles: 36,
    anglesPerImage: 6
});

threeSixty.initialize([
    'http://example.com/images/360/image-0.jpg',
    'http://example.com/images/360/image-1.jpg',
    'http://example.com/images/360/image-2.jpg',
    'http://example.com/images/360/image-3.jpg',
    'http://example.com/images/360/image-4.jpg',
    'http://example.com/images/360/image-5.jpg'
]);

threeSixty.preload().then(() => console.log('ready to go'));
```

### One angle per image

If you have only one angle per image, instead of multiple image sprites, you can just set the `anglesPerImage` setting to `1`.

```javascript
const threeSixty = new ThreeSixty(document.getElementsByTagName('canvas')[0], {
    angles: 10,
    anglesPerImage: 1
});

threeSixty.initialize([
    'http://example.com/images/360/image-0.jpg',
    'http://example.com/images/360/image-1.jpg',
    'http://example.com/images/360/image-2.jpg',
    'http://example.com/images/360/image-3.jpg',
    'http://example.com/images/360/image-4.jpg',
    'http://example.com/images/360/image-5.jpg',
    'http://example.com/images/360/image-6.jpg',
    'http://example.com/images/360/image-7.jpg',
    'http://example.com/images/360/image-8.jpg',
    'http://example.com/images/360/image-9.jpg'
]);
```

### Alter the speed

The default speed factor is set to `5`. You can change it with the `speedFactor` setting.

```javascript
const threeSixty = new ThreeSixty(document.getElementsByTagName('canvas')[0], {
    angles: 36,
    anglesPerImage: 6,
    speedFactor: 1
});

threeSixty.initialize([
    'http://example.com/images/360/image-0.jpg',
    'http://example.com/images/360/image-1.jpg',
    'http://example.com/images/360/image-2.jpg',
    'http://example.com/images/360/image-3.jpg',
    'http://example.com/images/360/image-4.jpg',
    'http://example.com/images/360/image-5.jpg'
]);
```

### Hotspots

You can show hotspots at defined angles to advertise the viewed product better.

```javascript
const threeSixty = new ThreeSixty(document.getElementsByTagName('canvas')[0], {
    angles: 36,
    anglesPerImage: 6,
    hotspots: [
        {
            text: 'Lorem ipsum 1',
            angle: 0,
            endAngle: 90,
            top: '25%',
            left: '27.5%'
        },
        {
            text: 'Lorem ipsum 2',
            angle: 180,
            endAngle: 240,
            top: '65%',
            left: '60%'
        }
    ]
});

threeSixty.initialize([
    'http://example.com/images/360/image-0.jpg',
    'http://example.com/images/360/image-1.jpg',
    'http://example.com/images/360/image-2.jpg',
    'http://example.com/images/360/image-3.jpg',
    'http://example.com/images/360/image-4.jpg',
    'http://example.com/images/360/image-5.jpg'
]);
```
