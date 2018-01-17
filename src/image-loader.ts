export class ImageLoader {
  /**
     * Load an image
     *
     * @param {string} url
     * @returns {Promise<Image>}
     */
  public load(url: string): Promise<any> {
    return new Promise(resolve => {
      const image = new Image()

      image.onload = () => resolve(image)

      image.src = url
    })
  }
}
