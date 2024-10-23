const THREE = require(`three`);
import StageGroup from './stage-group';
import loadObjectModel from './load-object-model';
import {degToRadians} from '../utils/math';

// сцена с ключом для первого слайда пятого экрана
class KeyStage extends StageGroup {
  // настройка параметров (метод родительского класса)
  setupParams() {
    super.setupParams();
    this.hasLoad = true;
  }
  // сборка (метод родительского класса)
  construct() {
    super.construct();
    // Группа для анимации вращения ключа
    // Внутри мы разместим ключ под углом, а вращать будем группу относительно оси Y
    const keyPoleG = new THREE.Group();
    keyPoleG.position.y = -50;
    this.mainObject = keyPoleG;
    this.stagePoleG.add(keyPoleG);
  }
  // загрузка моделей (метод родительского класса)
  async loadWithMaterials(config) {
    // Ключик
    const mesh = await loadObjectModel(`key`, config);
    mesh.rotation.copy(new THREE.Euler(degToRadians(-10), degToRadians(-25), degToRadians(-18), `XZY`));
    this.mainObject.add(mesh);
  }
  // обновление параметров (метод родительского класса)
  invalidate(dt, time) {
    super.invalidate(dt, time);
     // decrement: 17 градусов в секунду
    this.mainObject.rotation.y += degToRadians(17 * dt * 0.001);
  }
}
export default KeyStage;
