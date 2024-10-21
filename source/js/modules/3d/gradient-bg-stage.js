const THREE = require(`three`);
import AbstractView from './abstract-view';
import {setup3d} from "./utils/setup3d";
import ViewportRadialGradientMaterial from './materials/viewport-radial-gradient-material';

// класс создания фона с градиентом, наследует от абстрактного класса создания сцены
class GradientBgStage extends AbstractView {
  setupParameters() {
    // установка параметров (метод родительского класса)
    super.setupParameters();
    // Расстояние с которого камера будет смотреть на фон
    // Подбираем значение, чтобы скрыть края плоского Mesh
    this.zDepth = 150;
  }
  // сборка (метод родительского класса)
  construct() {
    // создаем элементы инфраструктуры Three.JS с помощью утилиты setup3d
    // внимание: у фона будет отдельная камера
    const {
      renderer,
      scene,
      camera
    } = setup3d(100, 100, this.zDepth * 1.1);
    // устанавливаем позицию камеры по оси Z
    camera.position.z = this.zDepth;
    // добавляем на сцену камеру
    scene.add(camera);
    // записываем переменные класса
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    // добавляем объект
    this.addMesh();
  }
  // добавление на сцену объекта плоскости
  addMesh() {
    const basicBackgroundColor = 0x060506;
    const centerBackgroundColor = 0x333130;
    const bgMesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(100, 100),
        new ViewportRadialGradientMaterial(basicBackgroundColor, centerBackgroundColor)
    );
    this.bgMesh = bgMesh;
    this.scene.add(bgMesh);
  }
}
export default GradientBgStage;
