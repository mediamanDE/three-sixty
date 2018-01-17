import { HotspotInterface } from './hotspot.interface';

export interface ConfigurationInterface {

    /**
     * @type {number}
     */
    angles: number;

    /**
     * @type {number}
     */
    anglesPerImage: number;

    /**
     * The factor which increases the drag speed
     * Default to 5
     *
     * @type {number}
     */
    speedFactor?: number;

    /**
     * @type {HotspotInterface[]}
     */
    hotspots?: HotspotInterface[];
}
