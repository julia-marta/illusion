const THREE = require(`three`);

// утилитарная функция для установки 3D сцены
export const setup3d = (initialWidth = 100, initialHeight = 100, far = 100) => {
  // 1.1.1. Renderer
  // создаем объект, который отвечает за рендеринг
  const renderer = new THREE.WebGLRenderer({
    alpha: false,
    antialias: false,
    logarithmicDepthBuffer: true,
    powerPreference: `high-performance`,
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(initialWidth, initialHeight);
  renderer.setClearColor(0x000000);

  // 1.1.2. Scene
  // создаем объект класса THREE.Scene, содержащий все объекты, которые необходимо рендерить
  const scene = new THREE.Scene();

  // 1.1.3. Camera
  // создаем объект Camera, хранящий настройки для проецирования объектов на плоскость экрана
  /*
   fov — Camera frustum vertical field of view. Default - 35.
   aspect — Camera frustum aspect ratio.
   near = 1 — Camera frustum near plane.
   far — Camera frustum far plane.
  * */
  const camera = new THREE.PerspectiveCamera(
      // fov — угол перспективы, указывается в градусах
      35,
      // aspect ratio - соотношение сторон canvas
      initialWidth / initialHeight,
      // минимальная (ближняя) глубина, объекты ближе этой z-координаты рендериться нее будут
      1,
      // максимальная (дальняя) глубина, объекты дальше этой z-координаты рендериться нее будут
      far
  );

  return {
    renderer,
    scene,
    camera,
  };
};
