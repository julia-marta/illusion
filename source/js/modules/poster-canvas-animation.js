import {bezierEasing} from "../helpers/cubic-bezier";
import {animateDuration, animateEasing} from "../helpers/animate";
import {runSerial} from "../helpers/promise";

// глобальные переменные размеров окна
let ww = window.innerWidth;
let wh = window.innerHeight;

// соотношение ширины окна к размеру десктопа
let wd = window.innerWidth / 1440;

// в options будут такие данные:
// { canvas: `#poster-canvas`, bgCanvas: `#poster-bg-canvas`}
// это айдишники постера и его фона

export default class Poster {
  constructor(options) {
    // глобальные переменные canvas
    this.canvas = document.querySelector(options.canvas);
    this.ctx = this.canvas.getContext(`2d`);
    this.bgCanvas = document.querySelector(options.bgCanvas);
    this.bgCtx = this.bgCanvas.getContext(`2d`);

    // глобальные переменные размеров и позиции постера
    this.width = 0;
    this.height = 0;
    this.L = 0; // Left
    this.T = 0; // Top
    this.R = 0; // Right
    this.B = 0; // Bottom

    // переменные параметры отворота края постера
    // угол в градусах и его ширина (прилежащий к углу катет)
    this.cornerAlpha = 0;
    this.cornerWidth = 150;

    // переменные параметры для анимации постера
    // масштаб по вертикали
    this.scaleY = 1;
    // скручивание по горизонтали
    this.skewX = 0;
    // передвижение по горизонтали
    this.translateX = 0;
    // угол вращения
    this.rotateAngle = 0;

    // массив с запущенными анимациями
    // нужен, чтобы не перетасовывать анимации внутри глобального метода
    this.startAnimations = [];

    // флаг анимации, устанавливается при запуске, но зачем нужен непонятно (нет проверок на него)
    this.isAnimated = false;

    // вызываем в конструкторе функцию получения размера постера
    this.updateSize();

    // создаём объект для изображения постера
    this.img = new Image();

    // когда изображение загружено, рисуем его на холсте
    this.img.onload = () => {
      this.draw();
    };
    // задаём ссылку для изображения постера
    this.img.src = `/img/pic1.jpg`;
  }

  // метод обновления переменных с размерами окна
  updateWindowSize() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    wd = window.innerWidth / 1440;
  }

  // метод обновления размеров канваса, реализация адаптивности
  updateSize() {
    // получаем текущие значения размеров окна
    this.updateWindowSize();

    // соотношение сторон постера друг к другу (большую сторону делим на меньшую)
    const posterRatio = 1.45; // 494 / 340
    // флаг мобилки
    const isMobile = window.innerWidth <= 600;

    // если мобилка
    if (isMobile) {
      // соотношение размеров окна
      const windowRatio = ww / wh;

      // получаем ширину и высоту постера
      // если соотношение сторон постера меньше чем соотношение размеров окна
      if (posterRatio < windowRatio) {
        // ширина равна ширине окна
        this.width = ww;
        // высота равна ширине умноженной на соотношение сторон постера
        // почему прибавляется 2 - непонятно, это только на мобилке
        this.height = Math.round(this.width * posterRatio) + 2;
        // если соотношение сторон постера больше чем соотношение размеров окна
      } else {
        // высота равна высоте окна
        this.height = wh;
        // ширина равна высоте деленной на соотношение сторон постера
        // почему прибавляется 2 - непонятно, это только на мобилке
        this.width = Math.round(this.height / posterRatio) + 2;
      }

      // получаем позиции постера
      // левый край: из ширины окна вычитаем ширину постера, оставшееся место делим на 2
      // таким образом постер будет расположен посередине
      this.L = Math.round((ww - this.width) / 2);
      // верхний край: из высоты окна вычитаем высоту постера, оставшееся место делим на 2
      // таким образом постер будет расположен посередине
      this.T = Math.round((wh - this.height) / 2);
      // правый край: к позиции левого края прибавляем ширину постера
      this.R = this.L + this.width;
      // нижний край: к позиции верхнего края прибавляем высоту постера
      this.B = this.T + this.height;
      // если не мобилка
    } else {
      // ширина равна обычной ширине постера (340) умноженной на соотношение ширины окна к размеру десктопа
      this.width = Math.round(340 * wd);
      // высота равна ширине умноженной на соотношение сторон постера
      this.height = Math.round(this.width * posterRatio);
      // левый край постера: из ширины окна вычитаем ширину постера, оставшееся место делим на 2
      this.L = Math.round((ww - this.width) / 2);
      // верхний край постера: из высоты окна вычитаем высоту постера, оставшееся место делим на 2
      // также тут прибавляется 17 умноженное на соотношение ширины окна к размеру десктопа - непонятно
      this.T = Math.round((wh - this.height) / 2 + 17 * wd);
      // правый край: к позиции левого края прибавляем ширину постера
      this.R = this.L + this.width;
      // нижний край: к позиции верхнего края прибавляем высоту постера
      this.B = this.T + this.height;
    }
  }

  // метод отрисовки постера
  draw() {
    // задаём размеры холста
    this.canvas.width = ww;
    this.canvas.height = wh;

    // очистка контекста, удаляет всё ранее нарисованное
    this.ctx.clearRect(0, 0, ww, wh);
    // трансформация постера
    // матрица преобразований канваса transform (scaleX, skewX, skewY, scaleY, translateX, translateY)
    // по умолчанию: (1, 0, 0, 1, 0, 0)
    this.ctx.transform(1, this.skewX, 0, this.scaleY, this.translateX, 0);
    // ВЫЗЫВАЕМ МЕТОД: вращение: передаем угол вращения, координату опорной точки X, координату опорной точки Y
    this.rotate(this.rotateAngle, ww / 2, 0);
    // рисуем изображение на постере с помощью метода Canvas 2D API
    // принимает следующие параметры drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    // image - картинка
    // sx - x-координата верхнего левого угла на исходном изображении
    // sy - y-координата верхнего левого угла на исходном изображении
    // sWidth - ширина, которую надо взять из исходного изображения
    // sHeight - высота, которую надо взять из исходного изображения
    // dx - x-координата на канвасе, куда надо поместить верхний левый угол изображения
    // dy - y-координата на канвасе, куда надо поместить верхний левый угол изображения
    // dWidth - ширина изображения, которую надо отрисовать на канвасе
    // dHeight - высота изображения, которую надо отрисовать на канвасе
    // все source параметры опциональны, в нашем случае они опускаются
    this.ctx.drawImage(this.img, this.L, this.T, this.width, this.height);
    // ВЫЗЫВАЕМ МЕТОД: рисуем на холсте отворот постера по заданным параметрам
    this.drawCorner(this.cornerAlpha, this.cornerWidth);
  }

  // метод отрисовки фона под постером
  drawBg() {
    // задаём размеры холста
    this.bgCanvas.width = ww;
    this.bgCanvas.height = wh;
    // очистка контекста, удаляет всё ранее нарисованное
    this.bgCtx.clearRect(0, 0, ww, wh);
    // задаем цвет заливки фона
    this.bgCtx.fillStyle = `#c78fff`;
    // метода канваса fillRect принимает координаты x и y, где начинается прямоугольник, а также его ширину и высоту
    // координата x: левая точка постера + 1 (чтобы не выходила за края)
    // координата y: верхняя точка постера + 1 (чтобы не выходила за края)
    // ширина: ширина постера - 2 (чтобы не выходила за края)
    // высота: высота постера - 2 (чтобы не выходила за края)
    this.bgCtx.fillRect(
        this.L + 1,
        this.T + 1,
        this.width - 2,
        this.height - 2
    );
  }

  // метод для рисования отворота края постера (серый треугольник)
  // принимает угол в градусах и ширину
  drawCorner(alpha, deltaWidth) {
    // сначала переводим угол в радианы
    const radian = (alpha * Math.PI) / 180;
    // теперь надо найти высоту угла (противолежащий углу катет)
    // для этого понадобится тангенс угла (отношение противолежащего катета к прилежащему)
    // прилежащий катет - это ширина угла
    // то есть тангенс = deltaHeight / deltaWidth
    // чтобы найти deltaHeight надо deltaWidth умножить на тангенс
    const deltaHeight = deltaWidth * Math.tan(radian);

    // рисуем ОТВОРОТ края постера (не фон!)
    // этот метод канваса начинает создание контура
    // теперь надо переместить перо в точку, откуда будем рисовать
    this.ctx.beginPath();

    // если ширина угла меньше или равна ширине постера, то надо нарисовать треугольник
    if (deltaWidth <= this.width) {
      // L
      // обозначаем координату левой нижней точки треугольника
      // координата X: крайняя правая точка постера минус ширина треугольника
      // координата Y: нижняя точка постера
      // эта точка совпадает с нижней точкой угла, который виден из-под отворота
      this.ctx.moveTo(this.R - deltaWidth, this.B);

      // R
      // обозначаем координату правой нижней точки треугольника
      // координата X: крайняя правая точка постера
      // координата Y: нижняя точка постера минус высота треугольника
      // потому что отворот начинается там, где заканчивается высота треугольника, грубо говоря
      // рисуем линию с помощью метода lineTo
      this.ctx.lineTo(this.R, this.B - deltaHeight);

      // T
      // обозначаем координату правой верхней точки треугольника
      // это у нас будет координата прямого угла, противоположного углу самого постера (верхний угол отворота)

      // объяснение по координате X
      // нам надо найти расстояние от правого края постера до вершины угла отворота
      // для этого построим воображаемый прямоугольный треугольник от края, у которого гипотенуза будет - наша высота треугольника
      // определим угол края отворота сверху (пусть будет угол отворота снизу умноженный на 2)
      // теперь нам надо найти противолежащий катет, зная угол и гипотенузу
      // для этого понадобится синус угла (отношение противолежащего катет к гипотенузе)
      // то есть противолежащий катет равен гипотенузе (наша высота угла) умноженной на синус угла умноженного на 2
      // а потом получившуюся длину вычитаем из крайней правой точки
      // координата X: крайняя правая точка постера минус высота угла умноженна на синус двойного угла

      // объяснение по координате Y
      // нам надо найти расстояние от нижнего края постера до вершины этого угла
      // в том же воображаемом прямоугольном треугольнике нас теперь интересует прилежащий катет (это будет высота отворота)
      // для этого понадобится косинус угла (отношение прилежащего катета к гипотенузе)
      // то есть прилежащий катет равен гипотенузе (наша высота угла) умноженной на косинус угла умноженного на 2
      // не до конца ясно по каком принципу тут прибавляется единица к косинусу,
      // но если этого не сделать, у нас прилежащий катет получится почти идентичен высоте оригинального треугольника
      // соответственно координата будет по высоте лежать на границе отворота и высота отворота будет нулевая
      // теперь вычитаем получившееся значение из крайней нижней точки постера
      // координата Y: крайняя нижняя точка постера минус высота угла умноженная на косинус двойного угла + 1
      this.ctx.lineTo(
          this.R - deltaHeight * Math.sin(2 * radian),
          this.B - deltaHeight * (Math.cos(2 * radian) + 1)
      );
      // если ширина угла больше ширины постера, то надо нарисовать трапецию
    } else {
      // outer trapezoid points
      // ширина отворота, выходящая за пределы постера: разница между шириной угла и шириной постера
      const outerDeltaWidth = deltaWidth - this.width;
      // теперь найдем высоту отворота, выходящая за пределы постера
      // надо построить воображаемый треугольник с заданным углом и прилежащим катетом шире, чем ширина постера
      // отсекаем все, что внутри постера, остается маленький треугольник, где прилежащий катет - это outerDeltaWidth, а противолежащий - outerDeltaHeight
      // тангенс угла - отношение противолежащего катета к прилежащему
      // то есть тангенс = outerDeltaHeight / outerDeltaWidth
      // чтобы найти высоту отворота, выходящего за пределы, надо ширину отворота, выходящего за пределы, умножить на тангенс
      const outerDeltaHeight = outerDeltaWidth * Math.tan(radian);

      // LB
      // обозначаем координату левой нижней точки трапеции
      // координата X: левый край постера
      // координата Y: нижний край постера минус высота отворота, выходящего за его пределы (вычислили выше)
      // перемещаем перо в эту точку
      this.ctx.moveTo(this.L, this.B - outerDeltaHeight);

      // RB
      // обозначаем координату правой нижней точки трапеции
      // координата X: правый край постера
      // координата Y: нижний край постера минус высота треугольника
      // потому что отворот начинается там, где заканчивается высота треугольника, грубо говоря
      // рисуем линию с помощью метода lineTo
      this.ctx.lineTo(this.R, this.B - deltaHeight);

      // RT
      // обозначаем координату правой верхней точки трапеции

      // рисуем линию с помощью метода lineTo
      this.ctx.lineTo(
          this.R - deltaHeight * Math.sin(2 * radian),
          this.B - deltaHeight * (1 + Math.cos(2 * radian))
      );
      // LT
      // обозначаем координату левой верхней точки трапеции

      // рисуем линию с помощью метода lineTo
      this.ctx.lineTo(
          this.L - outerDeltaHeight * Math.sin(2 * radian),
          this.B - outerDeltaHeight * (1 + Math.cos(2 * radian))
      );
    }

    // закрываем и стилизируем отворот
    this.ctx.closePath();
    this.ctx.fillStyle = `#ccc`;
    this.ctx.fill();

    // теперь надо показать часть фона за отворотом
    // сохраняем свойства контекста
    this.ctx.save();
    // mask poster corner
    // поворачиваем холст на угол отворота, только отрицательный (чтобы холст повернулся против часовой стрелки)
    this.rotate(-alpha, this.R - deltaWidth, this.B);
    // restore context transform
    // очищаем фрагмент повернутого холста
    // надо очистить кусок холста, который попадает в отворот
    // метода канваса clearRect принимает координаты x и y, где начинается прямоугольник, а также его ширину и высоту
    // координата X: левый край минус 1 / 4 ширины постера (!не понятно почему именно 1 / 4)
    // координата Y: нижний край
    // ширина: ширина постера + 1 / 2 ширины (!не понятно почему именно 1 / 2)
    // высота: высота угла отворота

    this.ctx.clearRect(
        this.L - this.width / 4,
        this.B,
        this.width + this.width / 2,
        deltaHeight
    );
    // восстанавливаем последние сохраненные свойства контекста (тут не особо ясно зачем)
    this.ctx.restore();
  }

  // метод для вращения холста
  rotate(angle, cx, cy) {
    // перемещаем холст в опорную точку поворота
    this.ctx.translate(cx, cy);
    // метод rotate принимает число в радианах, так что надо сначала перевести градусы в радианы по формуле
    this.ctx.rotate((angle * Math.PI) / 180);
    // возвращаем холст на место
    this.ctx.translate(-cx, -cy);
  }

  // все следующие методы - вспомогательные функции изменения параметров:

  // смена параметров отворота постера
  // принимает значения угла от и до, значения ширины угла от и до (опционально)
  getCornerAnimationTick(fromAlpha, toAlpha, fromWidth, toWidth) {
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    return (progress) => {
      // меняем значение угла: как получить текущее значение?
      // логика: разница между конечным и начальным значением угла + начальное значение - это конечное значение угла
      // мы постепенно меняем в процессе анимации разницу между начальным и конечным значением
      // значит, чтобы получить текущее значение надо взять текущий прогресс, умножить на него разницу и прибавить к начальному значению
      this.cornerAlpha = fromAlpha + progress * (toAlpha - fromAlpha);

      // если приходят параметры ширины угла
      if (fromWidth && toWidth) {
        // текущая ширина вычисляется аналогично текущему углу:
        // к начальному значению прибавляется разница между конечным и начальным, умноженная на прогресс
        this.cornerWidth = fromWidth + progress * (toWidth - fromWidth);
      }
    };
  }

  // смена масштабирования постера по оси Y
  // принимает значения масштабирования от и до
  getScaleYAnimationTick(from, to) {
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    return (progress) => {
      // текущий масштаб равен начальному значению + разнице между конечным и начальным, умноженная на прогресс
      this.scaleY = from + progress * (to - from);
    };
  }

  // смена скручивания постера по оси X
  // принимает значения скручивания от и до
  getSkewXAnimationTick(from, to) {
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    return (progress) => {
      // текущее скручивание равно начальному значению + разнице между конечным и начальным, умноженная на прогресс
      this.skewX = from + progress * (to - from);
    };
  }

  // смена перемещения постера по оси X
  // принимает значения перемещения от и до
  getTranslateXAnimationTick(from, to) {
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    return (progress) => {
      // текущее перемещение равно начальному значению + разнице между конечным и начальным, умноженная на прогресс
      this.translateX = from + progress * (to - from);
    };
  }

  // смена угла поворота постера
  // принимает значения угла поворота от и до
  getRotateAnimationTick(from, to) {
    return (progress) => {
      this.rotateAngle = from + progress * (to - from);
    };
  }

  // все следующие методы - для запуска анимации

  // составная анимация для изменения параметров отворота постера
  animateCornerFluid() {
    // анимируем ширину и угол отворота
    // bezierEasing - сложная математическая вспомогательная функция, которая возвращает вложенную функцию
    // в эту вложенную функцию надо передать отношение прошедшего с начала анимации времени к ее длительности
    const cornerFluidEasing = bezierEasing(0.33, 0, 0.67, 1);
    // определяем значения ширины угла, конечное и начальное
    const cornerWidthTo = this.cornerWidth - 10;
    const cornerWidthFrom = this.cornerWidth;

    // таймлайн для анимации отворота постера
    // это массив из функций, в каждой из которых вызывается функция animateEasing
    // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прогресс анимации с учетом временной функции Безье и на протяжении ее длительности он передается в функцию изменеенния параметров
    // в нашем случае вызывается смена параметров отворота постера
    // получается у нас 6 анимаций отворота постера
    const cornerAlphaAnimations = [
      () =>
        animateEasing(
            this.getCornerAnimationTick(0, 7),
            500,
            cornerFluidEasing
        ),
      () =>
        animateEasing(
            this.getCornerAnimationTick(7, 0),
            500,
            cornerFluidEasing
        ),
      () =>
        animateEasing(
            this.getCornerAnimationTick(0, 6),
            667,
            cornerFluidEasing
        ),
      () =>
        animateEasing(
            this.getCornerAnimationTick(6, 2),
            367,
            cornerFluidEasing
        ),
      () =>
        animateEasing(
            this.getCornerAnimationTick(2, 17, cornerWidthFrom, cornerWidthTo),
            617,
            cornerFluidEasing
        ),
      () =>
        animateEasing(
            this.getCornerAnimationTick(17, 0, cornerWidthTo, cornerWidthFrom),
            417,
            cornerFluidEasing
        ),
    ];

    // запуск (друг за другом) анимации отворота постера
    // в этой вспомогательной функции создается цепочка промисов, которые резолвятся по очереди
    runSerial(cornerAlphaAnimations);
  }

  // составная анимация для изменения остальных параметров, чтобы реализовать отрыв постера
  animatePosterTearOff() {
    // тут все анимации запускаются одновременно, а не с помощью runSerial по очереди
    // потому что эта анимация запускается только после того, как закончатся все анимации отворота
    // bezierEasing - сложная математическая вспомогательная функция, которая возвращает вложенную функцию
    // в эту вложенную функцию надо передать отношение прошедшего с начала анимации времени к ее длительности
    // animateEasing - это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прогресс анимации с учетом временной функции Безье и на протяжении ее длительности он передается в функцию изменеенния параметров

    // смена параметров отворота постера (начало отрыва, резкое увеличение ширины угла)
    const cornerEasing = bezierEasing(0.41, 0, 0.05, 1);
    const cornerWidthTo = this.cornerWidth + 250;
    animateEasing(
        this.getCornerAnimationTick(0, 15, this.cornerWidth, cornerWidthTo),
        500,
        cornerEasing
    );

    // смена параметров скручивания постера (постер сползает)
    const skewXEasing = bezierEasing(0.33, 0, 0, 1);
    animateEasing(this.getSkewXAnimationTick(0, 15 / wh), 633, skewXEasing);

    // смена параметров масштабирования постера (постер сжимается)
    const scaleYEasing = bezierEasing(0.33, 0, 0, 1);
    animateEasing(this.getScaleYAnimationTick(1, 0.9), 633, scaleYEasing);

    // смена параметров поворота постера (постер резко отлетает влево с поворотом)
    const rotateEasing = bezierEasing(0.2, 0, 0, 1);
    animateEasing(this.getRotateAnimationTick(0, 35), 1200, rotateEasing);

    // смена параметров перемещения постера (постер улетает влево за пределы экрана)
    const translateXEasing = bezierEasing(0.2, 0, 0, 1);
    animateEasing(
        this.getTranslateXAnimationTick(0, -976),
        1800,
        translateXEasing
    );
  }

  // глобальный метод запуска всех анимаций
  startAnimation(app) {
    if (!this.isAnimated) {
      // включаем флаг isAnimated
      this.isAnimated = true;

      // вспомогательные функции для отрисовки каждого кадра
      // отворот постера
      // на вход принимает прошедшее время анимации
      const globalFluidAnimationTick = (globalProgress) => {
        // если прошедшее время больше нуля и массив запущенных анимаций не содержит анимацию отворота
        if (
          globalProgress >= 0 &&
          this.startAnimations.indexOf(`fluid`) === -1
        ) {
          // добавляем в массив запущенных анимаций анимацию отворота
          this.startAnimations.push(`fluid`);
          // запускаем смену параметров отворота постера
          this.animateCornerFluid();
        }
        // отрисовываем сцену с новыми параметрами, высчитанными animateCornerFluid()
        this.draw();
      };

      // отрыв постера
      // на вход принимает прошедшее время анимации
      const globalTearOffAnimationTick = (globalProgress) => {
        // если прошедшее время больше нуля и массив запущенных анимаций не содержит анимацию отрыва
        if (
          globalProgress >= 0 &&
          this.startAnimations.indexOf(`tear-off`) === -1
        ) {
          // добавляем в массив запущенных анимаций анимацию отрыва
          this.startAnimations.push(`tear-off`);
          // запускаем смену параметров отрыва постера
          this.animatePosterTearOff();

          // одновременно с анимацией отрыва постера запускаем сцену с китом!
          // берем ее из параметра app, передаваемого при вызове глобального метода startAnimation()
          app.whaleScene.startAnimation({
            posterT: this.T,
            posterL: this.L,
            posterHeight: this.height,
            posterWidth: this.width
          });
        }
        // отрисовываем сцену с новыми параметрами, высчитанными animatePosterTearOff()
        this.draw();
      };

      // таймлайн всех анимаций постера
      // это массив из функций, в каждой из которых вызывается функция animateDuration
      // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
      // рассчитывается прошедшее время анимации и на протяжении ее длительности он передается в функцию анимации постера
      // чтобы не перетасовывать анимацию внутри себя, используется вспомогательный массив, в который добавлены идентификаторы уже запущенных анимаций
      // соответственно у нас ТОЛЬКО один раз запустится функция смены параметров, а в остальные вызовы будет только отрисовка с измененными параметрами
      const posterAnimations = [
        () => animateDuration(globalFluidAnimationTick, 3068),
        () => animateDuration(globalTearOffAnimationTick, 1800),
      ];

      // запуск (друг за другом) всех анимаций постера
      // в этой вспомогательной функции создается цепочка промисов, которые резолвятся по очереди
      runSerial(posterAnimations);
    }
  }
}
