const THREE = require(`three`);
import StageGroup from './stage-group';
import loadObjectModel from './load-object-model';
import {degToRadians} from '../utils/math';

// сцена с кроликом для второго слайда пятого экрана
class RabbitStage extends StageGroup {
  // настройка параметров (метод родительского класса)
  setupParams() {
    super.setupParams();
    this.hasLoad = true;
  }
  // загрузка моделей (метод родительского класса)
  async loadWithMaterials(config) {
    // Кролик
    const mesh = await loadObjectModel(`rabbit`, config);
    this.mainObject = mesh;
    mesh.position.copy(new THREE.Vector3(0, -275, -55));
    mesh.rotation.copy(new THREE.Euler(0, degToRadians(145), 0, `YXZ`));
    this.stagePoleG.add(mesh);
  }
}
export default RabbitStage;
