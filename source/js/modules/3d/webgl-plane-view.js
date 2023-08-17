import AbstractView from "./abstract-view";
import {setup3d} from "./utils/setup3d";
import NoiseEffectMaterial from "./materials/noise-effect-material";

const THREE = require(`three`);

// создание объекта плоскости
const createPlaneLayer = () => {
  // Так как плоскость со скетчом нам нужна временно, текстуру заранее не грузим и процесс загрузки не отслеживаем
  // класс TextureLoader загружает текстуру по ссылке на изображение
  // load обычно используется для отслеживания загрузки, по её завершению создается материал
  const texture = new THREE.TextureLoader().load(
      `/img/3dPreviews/scene_1_hat_3.png`
  );
  // Также жестко прописываем размеры текстуры в геометрии
  // создаем геометрию с помощью класса PlaneBufferGeometry, отвечающего за плоскости
  const geometry = new THREE.PlaneBufferGeometry(1024, 512);
  // создаем материал с помощью собственного шейдера
  // этот шейдер создает эффект цифрового шума!
  const material = new NoiseEffectMaterial(2);
  // записываем в материал ранее созданную текстуру
  material.uniforms.tDiffuse.value = texture;

  // создаем плоскость, передаем в нее геометрию и материал
  const plane = new THREE.Mesh(geometry, material);

  // функция для обновления материала
  function update() {
    // запускаем обновление
    requestAnimationFrame(update);
    // записываем в uniform-переменную времени текущее
    material.uniforms.time.value = performance.now();
    // устанавливаем флаг обновления (встроенный), чтобы буфер обновлялся при изменении значений
    material.needsUpdate = true;
  }

  // запускаем функцию обновления после создания плоскости
  requestAnimationFrame(update);

  // возвращаем объект плоскости
  return plane;
};

// класс создания плоскости, наследует от абстрактного класса создания сцены
class PlaneView extends AbstractView {
  setupParameters() {
    super.setupParameters();

    // Расстояние с которого камера будет смотреть на скетч
    // Подбираем вручную, когда сцена готова и рендерится
    this.zDepth = 900;
  }

  // установка параметров
  construct() {
    // создаем элементы инфраструктуры Three.JS с помощью утилиты setup3d
    // в утилиту надо передать ширину и высоту вьюпорта и дальность
    const {renderer, scene, camera} = setup3d(
        this.width,
        this.height,
        this.zDepth + 50
    );
    // создаем плоскость
    const plane = createPlaneLayer();
    // устанавливаем позицию камеры по оси Z
    camera.position.z = this.zDepth;

    // добавляем на сцену объект плоскости (мэш)
    scene.add(plane);
    // добавляем на сцену камеру
    scene.add(camera);

    // записываем переменные класса
    this.plane = plane;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
  }

  // ресайз
  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Если размеры вьюпорта не инициализировались, ничего не делаем
    if (height < 1 || width < 1) {
      return this;
    }

    // 3.1. Настройка Camera
    if (this.width > this.height) {
      // При горизонтальных пропорциях оставляем '35мм'
      this.camera.fov = 35;
    } else {
      // При вертикальной ориентации приближаем сцену в зависимости от пропорций экрана вьюпорта
      this.camera.fov =
        (32 * this.height) / Math.min(this.width * 1.3, this.height);
    }
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    // 3.3. Настройка renderer
    this.renderer.setSize(this.width, this.height);

    return this;
  }
}

export default PlaneView;
