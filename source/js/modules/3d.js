import {WEBGL} from "three/examples/jsm/WebGL";
import Stages3DView from './3d/stages-3d-view';

// Карты соответствия идентификаторов разделов сайта и состояний сцен 3d-фона
const object3dSchema = {
  'top': `stage1`,
  'about': `stage2`,
  'numbers': `stage3`,
  'show': `stage4`,
  'mc': `stage5`,
  'map': `stage6`,
  'tickets': `stage6`
};
// главное хранилище состояний (активный экран и номер слайда)
const globalStateStorage = {
  screenName: 'top',
  slideId: -1
};
// функция обновления глобального состояния
const updateGlobalState = (evt) => {
  const {screenName, slideId} = evt.detail;
  if (typeof screenName !== `undefined`) {
    globalStateStorage.screenName = screenName;
  }
  if (typeof slideId !== `undefined` && slideId > -1) {
    globalStateStorage.slideId = slideId;
  }
};
// добавляем функиию обновления состояния в качестве обработчика на событие смены экрана (для первичного срабатывания)
document.body.addEventListener(`screenChanged`, updateGlobalState);

// функция рендера в дом дерево
// передаем сюда экземпляр 3D сцены и div c классом animation-screen
const appendRendererToDOMElement = (object, targetNode) => {
  if (!object.renderer) {
    return;
  }
  // вызываем у экземпляра 3D сцены метод renderer
  // это рендерер, который мы создали в утилите setup3d с помощью THREE.WebGLRenderer
  // метод domElement данного рендерера автоматически создает канвас
  // мы присоединяем его к ноде, переданной в функцию
  targetNode.appendChild(object.renderer.domElement);
};

// класс создания фона с Three js сценами
class ThreeBackground {
  constructor() {
    // Флаг, определяющий версию сцен:
    // - с рендерингом материалов на основе данных о свете:
    // isLightMode = false;
    // - с материалами THREE.MeshMatcapMaterial:
    // isLightMode = true;
    const isLightMode = window.innerWidth < 1025 && window.innerHeight < 1025;
    // создаём экземпляр набора из 3D сцен
    const view3d = new Stages3DView({isLightMode});

    if (WEBGL.isWebGLAvailable()) {
      // Временно размещаем сцены в пространстве, одну над другой.
      // Мы рассчитаем их конечное расположение при настройке траекторий полета камеры.
      view3d.stage1.position.y = 0;
      view3d.stage2.position.y = 2000;
      view3d.stage3.position.y = 4000;
      view3d.stage5.position.y = 8000;
      // вызываем функцию рендера в ДОМ, в ней автоматом создастся канвас
      appendRendererToDOMElement(
          view3d,
          document.querySelector(`.animation-screen`)
      );
      // записываем в переменную 3D сцены
      this.view3d = view3d;
    }
  }
  // загрузка
  // у экземпляра 3D сцены вызывается метод load
  // он резолвится только после сборки всех параметрических фигур и загрузки моделей и материалов
  async load() {
    const {view3d} = this;
    await view3d.load();
  }
  // инициализация
  // у 3D сцен вызывается метод start
  // в нем вызывается ресайз и запускается проигрывание сцены
  // в проигрывании сцены play запускается анимация обновления а также вызывается рендерер, в него передаются сцена и камера
  start() {
    const {view3d} = this;
    // добавляем расширенный слушатель события screenChanged (после загрузки сцен), а первичный удаляем
    this.addListeners();
    document.body.removeEventListener(`screenChanged`, updateGlobalState);

    view3d.start();
  }
 // добавление слушателя на событие смены экрана, в котором меняем активный экран и позицию камеры
  addListeners() {
    const {view3d} = this;
    // Устанавливаем текущее состояние, соответствующее разделу
    view3d.setState(object3dSchema[globalStateStorage.screenName], globalStateStorage.slideId);
    // Добавляем слушателя кастомного события screenChanged
    document.body.addEventListener(`screenChanged`, (evt) => {
      // обновляем состояние
      updateGlobalState(evt);
      // Устанавливаем текущее состояние, соответствующее разделу
      view3d.setState(object3dSchema[globalStateStorage.screenName], globalStateStorage.slideId);
      // Временно задаем координаты камеры для каждого экрана, чтобы была возможность проверять расположение объектов в каждой группе
      const cameraPositionsY = {
        top: 1,
        about: 2000,
        numbers: 4000,
        show: 6000,
        mc: 8000,
      };
      // устанавливаем положение камеры, соответствующее экрану
      const position = cameraPositionsY[evt.detail.screenName];
      if (position) {
        view3d.camera.position.y = position;
      }
    });
  }
}

export default ThreeBackground;
