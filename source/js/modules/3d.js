import {WEBGL} from "three/examples/jsm/WebGL";
import PlaneScene from "./3d/webgl-plane-view";

// функция рендера в дом дерево
// передаем сюда экземпляр плоскости и div c классом animation-screen
const appendRendererToDOMElement = (object, targetNode) => {
  if (!object.renderer) {
    return;
  }
  // вызываем у экземпляра плоскости метод renderer
  // это рендерер, который мы создали в утилите setup3d с помощью THREE.WebGLRenderer
  // метод domElement данного рендерера автоматически создает канвас
  // мы присоединяем его к ноде, переданной в функцию
  targetNode.appendChild(object.renderer.domElement);
};

// класс создания фона с Three
class ThreeBackground {
  constructor() {
    // создаем экземпляр плоскости
    const view3d = new PlaneScene();

    if (WEBGL.isWebGLAvailable()) {
      // вызываем функцию рендера в ДОМ, в ней автоматом создастся канвас
      appendRendererToDOMElement(
          view3d,
          document.querySelector(`.animation-screen`)
      );
      // записываем в переменную экземпляр плоскости
      this.view3d = view3d;
    }
  }

  // инициализация
  // у экземпляра плоскости вызывается метод start
  // в нем вызывается ресайз и запускается проигрывание сцены
  // в проигрывании сцены play запускается анимация обновления а также вызывается рендерер, в него передаются сцена и камера
  start() {
    const {view3d} = this;

    view3d.start();
  }
}

export default ThreeBackground;
