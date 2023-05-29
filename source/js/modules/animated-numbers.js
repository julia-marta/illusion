import {animateProgress} from "../helpers/animate";

// в options будут такие данные:
// { elements: `#js-features-list .features-list__item-value`, duration: 800, durationAttenuation: 150, delay: 200}
export default class AnimatedNumbers {
  constructor(options) {
    // массив со всеми анимациями
    this.animations = [];
    // ищем все теги с числами по селектору, переданному в options
    this.elements = document.querySelectorAll(options.elements);
    // задержка
    this.delay = options.delay || 0;
    // длительность
    this.duration = options.duration || 1000;
    // длительность затухания
    this.durationAttenuation = options.durationAttenuation || 0;
  }

  // глобальный метод анимации чисел
  animate() {
    // очищаем dom элементы
    this.clear();
    // останавливаем все анимации
    this.stopAllAnimations();
    // запускаем все анимации после задержки
    this.timeout = setTimeout(() => {
      this.startAllAnimtions();
    }, this.delay);
  }

  // метод очистки dom элементов
  clear() {
    // перебираем все теги с числами и очищаем содержимое
    this.elements.forEach((number) => {
      number.innerHTML = `0`;
    });
  }

  // метод запуска всех анимаций
  startAllAnimtions() {
    // останавливаем все анимации
    this.stopAllAnimations();
    // перебираем все DOM-элементы
    this.elements.forEach((number, index) => {
      // получаем из data-атрибута конечную цифру анимации
      const numberStopCount = parseInt(number.dataset.animateCount, 10) || 0;
      // запускаем анимацию перебора чисел, передаем параметры:
      this.startAnimationForNumber(
          // элемент
          number,
          // конечную цифру анимации
          numberStopCount,
          // продолжительность + продолжительность затухания, умноженная на индекс (то есть длительность анимации каждого последующего элемента будет дольше)
          this.duration + index * this.durationAttenuation,
          // количество кадров в секунду (получаем из data-атрибута, по умолчанию 12)
          parseInt(number.dataset.animateFps, 10) || 12
      );
    });
  }

  // метод запуска анимациии перебора чисел
  startAnimationForNumber(element, stopCount, duration, fps) {
    // интервал, через который надо перерисовывать DOM
    const fpsInterval = 1000 / fps;
    // текущее значение элемента
    let currentCount = 0;
    let now;
    // начало отсчета
    let then = Date.now();
    let elapsed;

    // запускаем вспомогательную функцию animateProgress, в которую передаем анонимную функцию
    // в эту анонимную функцию получаем прогресс из animateProgress
    const animation = animateProgress((progress) => {
      // текущее время
      now = Date.now();
      // прошедшее с начала анимации время
      elapsed = now - then;
      // если прошедшее время больше чем интервал
      if (elapsed > fpsInterval) {
        // меняем значение начала отсчета: вычитаем из текущего времени целый остаток от прошедшего времени деленного на интервал
        then = now - (elapsed % fpsInterval);
        // меняем значение элемента на текущее
        element.innerHTML = currentCount.toString();
        // записываем в текущее значение прогресс умноженный на конечное число анимации
        currentCount = Math.ceil(progress * stopCount);
      }
      // также передаем длительность анимации в animateProgress, на протяжении которого перевызывается встроенная зацикленная функция
    }, duration);

    // animateProgress по завершении вернет зарезолвленный промис
    // после этого устанавливаем в значение элемента конечное число анимации
    animation.then(() => {
      element.innerHTML = stopCount;
    });
  }

  // остановка всех анимаций
  stopAllAnimations() {
    // если задан таймаут
    if (this.timeout) {
      // очищаем таймаут
      clearTimeout(this.timeout);
      // устанавливаем значение null
      this.timeout = null;
    }

    // если массив с анимациями не пустой
    if (this.animations.length) {
      // останавливаем все анимации из массива
      this.animations.forEach((raf) => cancelAnimationFrame(raf));
    }

    // очищаем массив
    this.animations = [];
  }
}
