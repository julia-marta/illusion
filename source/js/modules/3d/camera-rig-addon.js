import Tween from './utils/Tween';
import CameraRig, {cameraRigSettings} from './camera-rig';

// функция для установки позиций и углов вращения сцен, в зависимости от параметров рига
// Определяем, как нужно расставить сцены Stage, чтобы потом пролетать запрограммированным ригом от одной сцены к другой
export const set3dStagesPosition = (viewObject) => {
  // на вход получается объект со сценами, каждой сцене присваивается индекс
  let index = 0;
  let stage;
  stage = viewObject.stage1;
  // меняем параметры исходя из индекса каждой сцены и настроек конструкции Rigв
  stage.position.z = -index * cameraRigSettings.deltaDepth;
  stage.rotation.z = index * cameraRigSettings.deltaHorizonAngle;
  stage.stagePoleG.position.y = cameraRigSettings.radius0;
  index = 1;
  stage = viewObject.stage2;
  stage.position.z = -index * cameraRigSettings.deltaDepth;
  stage.rotation.z = index * cameraRigSettings.deltaHorizonAngle;
  stage.stagePoleG.position.y = cameraRigSettings.radius0;
  index = 2;
  stage = viewObject.stage3;
  stage.position.z = -index * cameraRigSettings.deltaDepth;
  stage.rotation.z = index * cameraRigSettings.deltaHorizonAngle;
  stage.stagePoleG.position.y = cameraRigSettings.radius0;
  index = 4;
  stage = viewObject.stage5;
  stage.position.z = -index * cameraRigSettings.deltaDepth + cameraRigSettings.distance;
  stage.rotation.z = index * cameraRigSettings.deltaHorizonAngle;
  stage.stagePoleG.position.y = cameraRigSettings.radius1;
};
// Определяем логику пролета в соответствии с тем, как расставили сцены Stage
const changeState = (rig, stateName, substage, onComplete, enforce = false) => {
  let index = parseInt(stateName.substring(5), 10) - 1;
  if (Number.isNaN(index)) {
    index = 0;
  }
  let radius = cameraRigSettings.radius0;
  const duration = 1.5;
  if (stateName === `stage5`) {
    radius = cameraRigSettings.radius1;
  } else if (stateName === `stage6`) {
    radius = 0;
  }
  if (enforce) {
    rig.depth = index * cameraRigSettings.deltaDepth;
    rig.polePosition = radius;
    rig.horizonAngle = index * cameraRigSettings.deltaHorizonAngle;
    return new Tween(rig, {
      dollyLength: cameraRigSettings.distance
    }, duration, onComplete);
  }
  // возвращает анимацию Rig-конструкции с нужными параметрами, в зависимости от сцены
  return new Tween(
      rig,
      {
        depth: index * cameraRigSettings.deltaDepth,
        dollyLength: cameraRigSettings.distance,
        polePosition: radius,
        horizonAngle: index * cameraRigSettings.deltaHorizonAngle
      },
      duration,
      onComplete
  );
};
// дополнение к классу Rig-конструкции камеры, в котором:
// - задаются анимации
// - добавляются слушатели событий
// - меняется положение конструкции Rig камеры
class CameraRigAddon {
  constructor() {
    this.tween = null;
    this.rig = new CameraRig();
  }
  // смена параметров анимации, если она уже существует
  invalidate(dt, t) {
    if (this.tween !== null) {
      this.tween.invalidate(dt, t);
    }
    // Lazy инициализация слушателя mousemove
    this.addMouseListeners();
    // смена параметров конструкции Rig
    this.rig.invalidate();
  }
  // добавление слушателей событий мыши
  addMouseListeners() {
    if (this.hasMousemoveHandler) {
      return;
    }

    const {rig} = this;
    // функция-обработчик события, меняющая в зависимости от положения мыши целевые углы,
    // используемые при расчёте углов вращения корневой группы Rig-а по осям X и Y
    const mousemoveHandler = (event) => {
      let pX = event.pageX;
      let pY = event.pageY;
      const winW = window.innerWidth;
      const winH = window.innerWidth;

      pX /= winW * 0.5;
      pX -= 1;

      pY /= winH * 0.5;
      pY -= 1;

      rig.targetAroundAngle = cameraRigSettings.aroundAmplitude * pX;
      rig.targetPitchAngle = cameraRigSettings.pitchAmplitude * pY;
    };
    // Добавляем слушателя
    window.addEventListener(`mousemove`, mousemoveHandler);

    // Сохраняем ссылку на слушателя, чтобы иметь возможность удалить его
    this.mousemoveHandler = mousemoveHandler;
    // Выставляем флаг
    this.hasMousemoveHandler = true;
  }
  // смена состояния Rig-конструкции камеры
  changeState(stateName, substage, onComplete, enforce = false) {
    // создаём анимацию Rig-а при помощи функции, определяющей логику пролёта (выше) и возвращающей новый Tween
    this.tween = changeState(
        this.rig,
        stateName,
        substage,
        () => {
          this.tween = null;
          if (typeof onComplete === `function`) {
            onComplete.call(null);
          }
        },
        enforce
    );
    return this.tween;
  }
}
export default CameraRigAddon;
