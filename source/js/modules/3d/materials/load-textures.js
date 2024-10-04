const THREE = require(`three`);

// загрузчик текстур
const loadTextures = (paths) => {
  // возвращает промис (асинхронная функция)
  return new Promise((resolve) => {
    const textureLoader = new THREE.TextureLoader();
    const map = {};
    // получает на вход пути, загружает для каждого текстуру и записывает в мапу
    Promise.all(paths.map((path) => new Promise((textureResolve) => {
      textureLoader.load(
          path,
          (texture) => {
            map[path] = texture;
            textureResolve(texture);
          }
      );
    })))
      .then(() => {
        // после загрузки всех текстур резолвит промис и возвращает мапу с готовыми текстурами
        resolve(map);
      });
  });
};
export default loadTextures;
