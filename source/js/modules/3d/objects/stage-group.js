const THREE = require(`three`);
// обновление положения объектов при колебаниях
const invalidateFluctuation = (
    {
      target,
      amplitudeX,
      amplitudeY,
      periodX,
      periodY,
      shiftX,
      shiftY
    },
    time
) => {
  const t = time * 0.001;
  if (amplitudeX > 0) {
    target.position.x = amplitudeX * Math.sin(((t - shiftX) * Math.PI * 2) / periodX);
  }
  if (amplitudeY > 0) {
    target.position.y = amplitudeY * Math.sin(((t - shiftY) * Math.PI * 2) / periodY);
  }
};
// модуль от которого наследуются все групповые сцены
class StageGroup extends THREE.Group {
  constructor() {
    super();
    this.setupParams();
    this.construct();
  }
  // установка параметров
  setupParams() {
    this.fluctuationConfigs = [];
    this.hasLoad = false;
    this.hasUpdateSizeMode = false;
    this.rotationY = 0;
    // Хранилище под-этапов: для подразделов мастер-классов
    this.substages = [];
    this.hasSubstages = false;
    this.currentSubstage = -1;
    // Хранилище ссылок на объекты скрытые при портретной ориентации
    this.invisibleOnPortrait = [];
  }
  // сборка
  construct() {
    const stagePoleG = new THREE.Group();
    this.add(stagePoleG);
    this.stagePoleG = stagePoleG;
  }
  // Добавляет настройки для анимации колебаний объектов на сцене Stage
  // Настройки используются в invalidate для обновления в соответствии с time
  addFluctuationConfig(target, amplitudeX = 0, amplitudeY = 5) {
    this.fluctuationConfigs.push({
      target,
      amplitudeX,
      amplitudeY,
      periodX: 2 + 5 * Math.random(),
      shiftX: 7 * Math.random(),
      periodY: 5 + 2 * Math.random(),
      shiftY: 7 * Math.random()
    });
  }
  // создание параметрических объектов
  constructParametric() {
    // Здесь в дочерних классах нужно разместить
    // создание параметрических объектов с переданными в параметре материалами
  }
  // загрузка моделей
  loadWithMaterials() {
    // Здесь в дочерних классах нужно разместить загрузку моделей
    return null;
  }
  // обновить размерный режим (ориентацию)
  updateSizeMode(isLandscape) {
    // 1) Видимость объектов
    if (this.invisibleOnPortrait) {
      this.invisibleOnPortrait.forEach((object) => {
        object.visible = isLandscape;
      });
    }
    // 2)
    // Здесь в дочерних классах можно добавить
    // логику размещения объектов в зависимости от ориентации вьюпорта,
    // если она требуется
  }
  // обновление параметров
  invalidate(dt, time) {
    // Обновляем положение объектов при колебаниях
    if (this.fluctuationConfigs) {
      this.fluctuationConfigs.forEach((config) => invalidateFluctuation(config, time));
    }
    if (this.visible) {
      // Подразделы размещаются вокруг одной оси раздела.
      // При переходе между подразделами вращаем stagePoleG, где находятся подраздела

      // Конвертируем значение из настроек в параметры 3D-группы
      this.stagePoleG.rotation.y = -this.rotationY;
    }
  }
}
export default StageGroup;
