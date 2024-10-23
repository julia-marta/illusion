import {WEBGL} from "three/examples/jsm/WebGL";
import WebglEffectRenderController from './3d/webgl-effect-render-controller';
import Stages3DView from './3d/stages-3d-view';
import GradientBgStage from './3d/gradient-bg-stage';
import CameraRigAddon, {set3dStagesPosition} from './3d/camera-rig-addon';

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
// Карты соответствия идентификаторов разделов сайта и применения эффектов
const effectStateSchema = {
  'top': `default`,
  'about': `default`,
  'numbers': `default`,
  'show': `default`,
  'mc': `off`,
  'map': `off`,
  'tickets': `off`
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
      // размещаем сцены в пространстве с помощью функции, определённой в Rig Addon
      // установка позиций и углов вращения сцен
      set3dStagesPosition(view3d);
      // добавляем внутрь класса создания 3D сцены дополнение к Rig-конструкции камеры с помощью встроенного метода
      view3d.installAddOn(new CameraRigAddon());

      // Для Desktop добавляем эффект шума
      if (!isLightMode) {
        // создаём контроллер применения к сцене эффекта шума
        const composerController = new WebglEffectRenderController(view3d.renderer, view3d.scene, view3d.camera);
        // устанавливаем для сцены кастомный рендер (метод из абстрактного родительского класса)
        view3d.setRenderFunction(() => {
            composerController.render();
        });
        // сохраняем контроллер
        this.composerController = composerController;
        // на мобильной версии добавляем фон с градиентом вместо шума
            }
            else {
              const bgView = new GradientBgStage();
              this.bgView = bgView;
              view3d.setRenderFunction(() => {
                view3d.renderer.render(bgView.scene, bgView.camera);
                view3d.renderer.autoClear = false;
                view3d.renderer.render(view3d.scene, view3d.camera);
                view3d.renderer.autoClear = true;
              });
            }

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
    const {view3d, composerController} = this;
    // Устанавливаем текущее состояние, соответствующее разделу
    view3d.setState(object3dSchema[globalStateStorage.screenName], globalStateStorage.slideId);
    // Добавляем слушателя кастомного события screenChanged
    document.body.addEventListener(`screenChanged`, (evt) => {
      // обновляем состояние
      updateGlobalState(evt);
      // Устанавливаем текущее состояние, соответствующее разделу
      view3d.setState(object3dSchema[globalStateStorage.screenName], globalStateStorage.slideId);
    });
      // Устанавливаем текущее состояние
      composerController.setState(effectStateSchema[globalStateStorage.screenName]);
      // Добавляем слушателя
      document.body.addEventListener(`screenChanged`, (evt) => {
        composerController.setState(effectStateSchema[evt.detail.screenName], -1);
      });
  }
}

export default ThreeBackground;
