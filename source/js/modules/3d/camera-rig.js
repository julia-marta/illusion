const THREE = require(`three`);
import {degToRadians} from './utils/math';

// Camera Rig Settings (настройки конструкции Rig)
export const cameraRigSettings = {
  deltaDepth: 1750,
  distance: 1500,
  startDistance: 1800,
  radius0: 550,
  radius1: 1050,
  deltaHorizonAngle: degToRadians(120),
  aroundAmplitude: degToRadians(6),
  pitchAmplitude: degToRadians(2)
};
// класс для Rig-конструкции камеры
class CameraRig {
  constructor() {
    this.setupInternalParameters();
    this.construct();
    this.invalidate();
  }
  // установка изначальных значений параметров
  setupInternalParameters() {
    this._depth = 0;
    this._dollyLength = cameraRigSettings.startDistance;
    this._polePosition = cameraRigSettings.radius0;
    this._horizonAngle = 0;
    this._aroundAngle = 0;
    this._pitchAngle = 0;
    this._targetAroundAngle = 0;
    this._targetPitchAngle = 0;
    this._depthChanged = true;
    this._dollyLengthChanged = true;
    this._polePositionChanged = true;
    this._horizonAngleChanged = true;
    this._aroundAngleChanged = true;
    this._pitchAngleChanged = true;
  }
  // сборка
  construct() {
    // 1.1. Части
    // корневая группа
    const root = new THREE.Group();
    // группа Долли (приближение, удаление, вращение)
    // меняет позицию и угол вращения по оси Z
    const dollyBend = new THREE.Group();
    // группа движения по вертикали
    // меняет позицию по оси Y
    const poleHand = new THREE.Group();
    // нулевая группа, внутрь которой помещается камера, без манипуляций
    const cameraNull = new THREE.Group();
    // 1.2. Соединения
    root.add(dollyBend);
    dollyBend.add(poleHand);
    poleHand.add(cameraNull);
    // Ссылки
    this.root = root;
    this.dollyBend = dollyBend;
    this.poleHand = poleHand;
    this.cameraNull = cameraNull;
  }
  // установка значения позиции корневой группы по оси Z
  set depth(value) {
    if (value === this._depth) {
      return;
    }
    this._depth = value;
    this._depthChanged = true;
  }
  // получение значения позиции корневой группы по оси Z
  get depth() {
    return this._depth;
  }
  // установка позиции группы Долли по оси Z
  set dollyLength(value) {
    if (value === this._dollyLength) {
      return;
    }
    // dollyLength must be positive
    if (value < 0) {
      this._dollyLength = 0;
      this._dollyLengthChanged = true;
      return;
    }
    this._dollyLength = value;
    this._dollyLengthChanged = true;
  }
  // получение позиции группы Долли по оси Z
  get dollyLength() {
    return this._dollyLength;
  }
  // установка позиции группы движения по вертикали по оси Y
  set polePosition(value) {
    if (value === this._polePosition) {
      return;
    }
    this._polePosition = value;
    this._polePositionChanged = true;
  }
  // получение позиции группы движения по вертикали по оси Y
  get polePosition() {
    return this._polePosition;
  }
  // установка угла вращения группы Долли по оси Z
  set horizonAngle(value) {
    if (value === this._horizonAngle) {
      return;
    }
    this._horizonAngle = value;
    this._horizonAngleChanged = true;
  }
  // получение угла вращения группы Долли по оси Z
  get horizonAngle() {
    return this._horizonAngle;
  }
  // Параметры для реакции на движение курсора
  // установка угла вращения корневой группы по оси Y
  set aroundAngle(value) {
    if (value === this._aroundAngle) {
      return;
    }
    this._aroundAngle = value;
    this._aroundAngleChanged = true;
  }
  // получение угла вращения корневой группы по оси Y
  get aroundAngle() {
    return this._aroundAngle;
  }
  // установка угла вращения корневой группы по оси X
  set pitchAngle(value) {
    if (value === this._pitchAngle) {
      return;
    }
    this._pitchAngle = value;
    this._pitchAngleChanged = true;
  }
  // получение угла вращения корневой группы по оси X
  get pitchAngle() {
    return this._pitchAngle;
  }
  // установка целевого угла, используемого при расчёте угла вращения корневой группы по оси Y
  set targetAroundAngle(value) {
    if (value === this._targetAroundAngle) {
      return;
    }
    this._targetAroundAngle = value;
    this._aroundAngleChanged = true;
  }
  // получение целевого угла, используемого при расчёте угла вращения корневой группы по оси Y
  get targetAroundAngle() {
    return this._targetAroundAngle;
  }
  // установка целевого угла, используемого при расчёте угла вращения корневой группы по оси X
  set targetPitchAngle(value) {
    if (value === this._targetPitchAngle) {
      return;
    }
    this._targetPitchAngle = value;
    this._pitchAngleChanged = true;
  }
  // получение целевого угла, используемого при расчёте угла вращения корневой группы по оси X
  get targetPitchAngle() {
    return this._targetPitchAngle;
  }
  // проверка флагов изменений, смена параметров и сброс флагов
  invalidate() {
    // меняет позицию корневой группы по Z
    if (this._depthChanged) {
      this.root.position.z = -this._depth;
      this._depthChanged = false;
    }
    // меняют позицию и угол вращения группы Долли по Z
    if (this._dollyLengthChanged || this._horizonAngleChanged) {
      // Set new position
      this.dollyBend.position.z = this._dollyLength;
      this.dollyBend.rotation.z = this._horizonAngle;
      this._dollyLengthChanged = false;
      this._horizonAngleChanged = false;
    }
    // меняет позицизю группы движения по вертикали по Y
    if (this._polePositionChanged) {
      // Set new position
      this.poleHand.position.y = this._polePosition;
      this._polePositionChanged = false;
    }
    // меняют угол вращения корневой группы по Y
    if (this._aroundAngleChanged || this._targetAroundAngle !== this._aroundAngle) {
      if (Math.abs(this._targetAroundAngle - this._aroundAngle) < 0.001) {
        this._aroundAngle = this._targetAroundAngle;
      } else {
        // расчитываем угол в зависимости от целевого угла
        this._aroundAngle += (this._targetAroundAngle - this._aroundAngle) * 0.25;
      }
      this.root.rotation.y = this._aroundAngle;
      this._aroundAngleChanged = false;
    }
    // меняют угол вращения корневой группы по X
    if (this._pitchAngleChanged || this._targetPitchAngle !== this._pitchAngle) {
      if (Math.abs(this._targetPitchAngle - this._pitchAngle) < 0.001) {
        this._pitchAngle = this._targetPitchAngle;
      } else {
        // расчитываем угол в зависимости от целевого угла
        this._pitchAngle += (this._targetPitchAngle - this._pitchAngle) * 0.25;
      }
      this.root.rotation.x = this._pitchAngle;
      this._pitchAngleChanged = false;
    }
  }
}
export default CameraRig;
