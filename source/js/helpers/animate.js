// animation using raf (render function parameter is value from easing function)
// функция принимает на вход:
// - функцию render, меняющая значение определенного параметра в зависимости от прогресса
// - длительность анимации duration
// - функцию easing, в которую надо передать отношение прошедшего с начала анимации времени к ее длительности
const animateEasing = (render, duration, easing) =>
  // создаем промис
  new Promise((resolve) => {
    // определяем время старта анимации
    const start = Date.now();
    // зацикленная функция
    (function loop() {
      // прогресс - из текущего времени вычитаем время старта (это сколько прошло с начала) и делим на длительность анимации
      const p = (Date.now() - start) / duration;
      // если прогресс больше 1
      if (p > 1) {
        // передаем 1 (а это максимальное значение прогресса) в функцию изменения параметров и анимация заканчивается
        render(1);
        // set that animation end
        // резолвим промис
        resolve();
        // если прогресс меньше 1
      } else {
        // вызываем снова зацикленную функцию
        requestAnimationFrame(loop);
        // в функцию easing передаем прогресс (отношение прошедшего с начала анимации времени к ее длительности)
        // она рассчитывает прогресс с учетом временной функции (параметры Безье были переданы в старшей функции)
        // этот финальный прогресс передаем в функцию изменения параметров
        render(easing(p));
      }
    })();
  });

// animation using raf (render function parameter is progress from 0 to 1)
// функция принимает на вход:
// функцию render, в которой пересчитывается и перерисовывается значение DOM элемента в зависимости от прогресса
// длительность анимации duration
const animateProgress = (render, duration) =>
  // создаем промис
  new Promise((resolve) => {
    // определяем время старта анимации
    const start = Date.now();
    // зацикленная функция
    (function loop() {
      // прогресс - из текущего времени вычитаем время старта (это сколько прошло с начала) и делим на длительность анимации
      const p = (Date.now() - start) / duration;
      // если прогресс больше 1
      if (p > 1) {
        // передаем 1 (а это максимальное значение прогресса) в функцию изменения параметров и анимация заканчивается
        render(1);
        // set that animation end
        // резолвим промис
        resolve();
        // если прогресс меньше 1
      } else {
        // вызываем снова зацикленную функцию
        requestAnimationFrame(loop);
        // прогресс передаем в функцию render
        render(p);
      }
    })();
  });

// animation using raf (render function parameter is progress from 0 to 1)
// функция принимает на вход:
// - функцию render, меняющая значение определенного параметра в зависимости от прогресса
// - длительность анимации duration
const animateDuration = (render, duration) =>
  // создаем промис
  new Promise((resolve) => {
    // определяем время старта анимации
    const start = Date.now();
    // зацикленная функция
    (function loop() {
      // прошедшее время - из текущего времени вычитаем время старта
      const p = Date.now() - start;
      // если прошедшее время больше длительности
      if (p > duration) {
        // передаем длительность в функцию изменения параметров и анимация заканчивается
        render(duration);
        // set that animation end
        // резолвим промис
        resolve();
        // если прошедшее время меньше длительности
      } else {
        // вызываем снова зацикленную функцию
        requestAnimationFrame(loop);
        // прошедшее время передаем в функцию изменения параметров
        render(p);
      }
    })();
  });

export {animateEasing, animateProgress, animateDuration};
