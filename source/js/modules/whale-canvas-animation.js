// whale canvas animation
import {bezierEasing} from "../helpers/cubic-bezier";
import {animateDuration, animateEasing} from "../helpers/animate";
import {runSerial, runSerialLoop} from "../helpers/promise";

// ширина окна
let winW;
// высота окна
let winH;
// соотношение ширины окна к ширине десктопа
let wFactor;
// соотношение высоты окна к высоте десктопа
let hFactor;

// параметры звезд
const STARS_OPTIONS = [
  // b 6
  {t: `b`, x: 1150, y: 273, s: 4.15, h: 4.15 + 0.4},
  // b 5
  {t: `b`, x: 1090, y: 525, s: 5.17, h: 5.17 + 0.4},
  // b 3
  {t: `b`, x: 324, y: 329, s: 4.52, h: 4.52 + 0.4},
  // b 2
  {t: `b`, x: 962, y: 543, s: 3.39, h: 3.39 + 0.4},
  // b 0
  {t: `b`, x: 466, y: 253, s: 3.28, h: 3.28 + 0.4},
  // s 16
  {t: `s`, x: 1079, y: 240, s: 5.41, h: 6.23},
  // s 15
  {t: `s`, x: 1203, y: 275, s: 5.08, h: 5.54},
  // s 19
  {t: `s`, x: 350, y: 368, s: 3.27, h: 4.07},
  // s 14
  {t: `s`, x: 350, y: 368, s: 6.02, h: 6.23},
  // s 13
  {t: `s`, x: 496, y: 344, s: 5.23, h: 6.21},
  // s 12
  {t: `s`, x: 1043, y: 170, s: 4.56, h: 5.57},
  // s 11
  {t: `s`, x: 1071, y: 495, s: 4.28, h: 5.02},
  // s 10
  {t: `s`, x: 382, y: 272, s: 4.4, h: 5.41},
  // s 9
  {t: `s`, x: 462, y: 372, s: 4.22, h: 5.16},
  // s 4
  {t: `s`, x: 925, y: 526, s: 3.49, h: 4.31},
  // s 3
  {t: `s`, x: 1123, y: 249, s: 3.27, h: 4.21},
  // s 2
  {t: `s`, x: 494, y: 284, s: 3.4, h: 4.19},
  // s 0
  {t: `s`, x: 426, y: 232, s: 3.33, h: 4.14},
];

// в options будут такие данные:
// { canvas: `#whale-canvas`}
// это айдишник холста для сцены с китом

export default class WhaleScene {
  constructor(options) {
    // глобальные переменные canvas
    this.canvas = document.querySelector(options.canvas);
    this.ctx = this.canvas.getContext(`2d`);

    // создаем объекты изображений для сцены с китом
    // тело кита
    this.bodyImg = new Image();
    // плавник кита
    this.finImg = new Image();
    // хвост кита
    this.tailImg = new Image();
    // левое облако
    this.cloudLeftImg = new Image();
    // правое облако
    this.cloudRightImg = new Image();
    // левый воздушный шар
    this.balloonLeftImg = new Image();
    // правый воздушный шар
    this.balloonRightImg = new Image();

    // счетчик загрузки изображений
    this.loadingCounter = 0;

    // флаги мобилки и анимации
    this.isMobile = false;
    this.isAnimated = false;

    // массив с запущенными анимациями
    // нужен, чтобы не перетасовывать анимации внутри глобального метода
    this.startAnimations = [];

    // переменные размеров и позиции постера (верхняя позиция, левая позиция, высота и ширина)
    this.posterT = 0;
    this.posterL = 0;
    this.posterHeight = 0;
    this.posterWidth = 0;

    // переменные размеров и позиции тела кита
    this.bodyWidth = undefined;
    this.bodyHeight = undefined;
    this.bodyL = undefined; // Left
    this.bodyT = undefined; // Top

    // переменные размеров и позиции плавника + угол поворота
    this.finWidth = undefined;
    this.finHeight = undefined;
    this.finL = undefined;
    this.finT = undefined;
    this.finAngle = 0;

    // переменные размеров и позиции хвоста + угол поворота
    this.tailWidth = undefined;
    this.tailHeight = undefined;
    this.tailL = undefined;
    this.tailT = undefined;
    this.tailAngle = 0;

    // переменные размеров и позиции левого облака
    this.cloudLeftWidth = undefined;
    this.cloudLeftHeight = undefined;
    this.cloudLeftL = undefined;
    this.cloudLeftT = undefined;

    // переменные размеров и позиции правого облака
    this.cloudRightWidth = undefined;
    this.cloudRightHeight = undefined;
    this.cloudRightL = undefined;
    this.cloudRightT = undefined;

    // переменные размеров и позиции левого воздушного шара
    this.balloonLeftWidth = undefined;
    this.balloonLeftHeight = undefined;
    this.balloonLeftL = undefined;
    this.balloonLeftT = undefined;

    // переменные размеров и позиции правого воздушного шара
    this.balloonRightWidth = undefined;
    this.balloonRightHeight = undefined;
    this.balloonRightL = undefined;
    this.balloonRightT = undefined;

    // непрозрачность облаков, изначально нулевая
    this.cloudsOpacity = 0;

    // позиция и угол поворота всей сцены (перепроверить позже)
    this.sceneX = 0;
    this.sceneY = 0;
    this.sceneAngle = 0;

    // переменные луны-полумесяца, изначально все нулевые, так что луны не видно
    // радиус луны
    this.moonRadius = 0;
    // дельта между внешней и внутренней стороной полумесяца
    this.moonDx = 0;
    // координата конца луны (по горизонтали)
    this.moonEndX = 0;
    // координата луны по вертикали
    this.moonY = 0;
    // угол поворота луны
    this.moonRotateAngle = 0;

    // параметры звезд
    this.starsOptions = STARS_OPTIONS;

    // вызываем в конструкторе:
    // метод добавления обработчиков на загрузку фото
    this.initEventListeners();
    // метод обновления размеров сцены
    this.updateSceneSizing();
    // метод загрузки фотографий
    this.loadImages();
  }

  // метод увеличения счетчика загрузки изображений
  increaseLoadingCounter() {
    this.loadingCounter++;
    // когда все 7 картинок загружены, вызываем метод отрисовки сцены на холсте
    if (this.loadingCounter === 7) {
      this.drawScene();
    }
  }

  // метод добавления обработчиков на загрузку фото
  // когда изображение загружено, вызываем увеличение счетчика
  initEventListeners() {
    this.bodyImg.onload = () => {
      this.increaseLoadingCounter();
    };

    this.finImg.onload = () => {
      this.increaseLoadingCounter();
    };

    this.tailImg.onload = () => {
      this.increaseLoadingCounter();
    };

    this.cloudLeftImg.onload = () => {
      this.increaseLoadingCounter();
    };

    this.cloudRightImg.onload = () => {
      this.increaseLoadingCounter();
    };

    this.balloonLeftImg.onload = () => {
      this.increaseLoadingCounter();
    };

    this.balloonRightImg.onload = () => {
      this.increaseLoadingCounter();
    };
  }

  // метод загрузки фотографий
  // задаём ссылки для всех созданных в конструкторе Image
  loadImages() {
    this.bodyImg.src = `/img/whaleBody.png`;
    this.finImg.src = `/img/whaleFin.png`;
    this.tailImg.src = `/img/whaleTail.png`;
    this.cloudLeftImg.src = `/img/cloudLeft.png`;
    this.cloudRightImg.src = `/img/cloudRight.png`;
    this.balloonLeftImg.src = `/img/balloonLeft.png`;
    this.balloonRightImg.src = `/img/balloonRight.png`;
  }

  // метод обновления размеров сцены и её составляющих
  updateSceneSizing() {
    // задаем глобальные переменные размеров окна
    winW = window.innerWidth;
    winH = window.innerHeight;
    wFactor = window.innerWidth / 1440;
    hFactor = window.innerHeight / 760;

    // устанавливаем флаг мобилки
    this.isMobile = winW <= 600;

    // обновляем размеры разных составляющих сцены
    this.updateWhaleSizing();
    this.updateCloudsSizing();
    this.updateBalloonsSizing();
  }

  // метод обновления размеров кита
  updateWhaleSizing() {
    // соотношение ширины окна и ширины десктопа
    let factor = wFactor;

    if (this.isMobile) {
      factor *= 1.5;
    }
    // задаем размеры и позиции тела кита
    // ширина равна ширине картинки (880) умноженной на соотношение ширин окна и десктопа
    this.bodyWidth = Math.round(880 * factor);
    // высота равна ширине умноженной на 295 и деленной на 783 (непонятно что это за цифры)
    this.bodyHeight = Math.round((this.bodyWidth * 295) / 783);
    // левая позиция: из ширины окна вычитаем ширину тела, оставшееся место делим на 2
    this.bodyL = Math.round((winW - this.bodyWidth) / 2);
    // если мобилка
    if (this.isMobile) {
      // верхняя позиция: из высоты окна вычитаем высоту тела, оставшееся место делим на 2
      // также тут вычитается 120 умноженное на соотношение ширин окна и десктопа - непонятно
      // предполагаю что эти значения берутся из AE
      this.bodyT = Math.round((winH - this.bodyHeight) / 2 - 120 * factor);
      // если не мобилка
    } else {
      // верхняя позиция как на мобилке, но тут прибавляется 17 умноженное на соотношение ширин окна и десктопа - непонятно
      this.bodyT = Math.round((winH - this.bodyHeight) / 2 + 17 * factor);
    }

    // задаем размеры и позиции плавника
    // ширина равна ширине картинки (200) умноженной на соотношение ширин окна и десктопа
    this.finWidth = Math.round(200 * factor);
    // высота равна ширине умноженной на 133 и деленной на 216 (непонятно что это за цифры)
    this.finHeight = Math.round((this.finWidth * 133) / 216);
    // левая позиция: левая позиция тела + 310 умноженное на соотношение ширин окна и десктопа
    this.finL = Math.round(this.bodyL + 310 * factor);
    // верхняя позиция: верхняя позиция тела + 200 умноженное на соотношение ширин окна и десктопа
    this.finT = Math.round(this.bodyT + 200 * factor);

    // задаем размеры и позиции хвоста
    // ширина равна ширине картинки (119) умноженной на соотношение ширин окна и десктопа
    this.tailWidth = Math.round(119 * factor);
    // высота равна ширине умноженной на 79 и деленной на 119 (непонятно что это за цифры)
    this.tailHeight = Math.round((this.tailWidth * 79) / 119);
    // левая позиция: левая позиция тела + ширина тела - 145 умноженное на соотношение ширин окна и десктопа
    this.tailL = Math.round(this.bodyL + this.bodyWidth - 145 * factor);
    // верхняя позиция: верхняя позиция тела + 35 умноженное на соотношение ширин окна и десктопа
    this.tailT = Math.round(this.bodyT + 35 * factor);
  }

  // метод обновления размеров облаков
  updateCloudsSizing() {
    // если мобилка
    if (this.isMobile) {
      // левое облако
      // ширина равна ширине картинки (612) умноженной на соотношение ширин окна и десктопа и умноженная на 3 (непонятно)
      this.cloudLeftWidth = Math.round(612 * wFactor * 3);
      // высота равна ширине умноженной на 344 и деленной на 612 (непонятно что это за цифры)
      this.cloudLeftHeight = Math.round((this.cloudLeftWidth * 344) / 612);
      // левая позиция: левая позиция тела + 180 умноженное на соотношение ширин окна и десктопа
      this.cloudLeftL = Math.round(this.bodyL + 180 * wFactor);
      // верхняя позиция: верхняя позиция тела + 100 умноженное на соотношение ширин окна и десктопа
      this.cloudLeftT = Math.round(this.bodyT + 100 * wFactor);

      // правое облако
      // ширина равна ширине картинки (644) умноженной на соотношение ширин окна и десктопа и умноженная на 3.5 (непонятно)
      this.cloudRightWidth = Math.round(644 * wFactor * 3.5);
      // высота равна ширине умноженной на 270 и деленной на 644 (непонятно что это за цифры)
      this.cloudRightHeight = Math.round((this.cloudRightWidth * 270) / 644);
      // левая позиция: левая позиция тела минус ширина тела - 540 умноженное на соотношение ширин окна и десктопа
      this.cloudRightL = Math.round(
          this.bodyL - this.bodyWidth - 540 * wFactor
      );
      // верхняя позиция: верхняя позиция тела - 10 умноженное на соотношение ширин окна и десктопа и умноженное на 55 (непонятно)
      this.cloudRightT = Math.round(this.bodyT - 10 * wFactor * 55);
      // если не мобилка
    } else {
      // левое облако
      // ширина равна ширине картинки (612) умноженной на соотношение ширин окна и десктопа
      // в отличие от мобилки не умножается на 3
      this.cloudLeftWidth = Math.round(612 * wFactor);
      // высота равна ширине умноженной на 344 и деленной на 612 (непонятно что это за цифры)
      this.cloudLeftHeight = Math.round((this.cloudLeftWidth * 344) / 612);
      // левая позиция: левая позиция тела - 180 умноженное на соотношение ширин окна и десктопа
      // в отличие от мобилки 180 вычитается, а не прибавляется
      this.cloudLeftL = Math.round(this.bodyL - 180 * wFactor);
      // верхняя позиция: верхняя позиция тела + 100 умноженное на соотношение ширин окна и десктопа
      this.cloudLeftT = Math.round(this.bodyT + 100 * wFactor);

      // правое облако
      // ширина равна ширине картинки (644) умноженной на соотношение ширин окна и десктопа
      // в отличие от мобилки не умножается на 3.5
      this.cloudRightWidth = Math.round(644 * wFactor);
      // высота равна ширине умноженной на 270 и деленной на 644 (непонятно что это за цифры)
      this.cloudRightHeight = Math.round((this.cloudRightWidth * 270) / 644);
      // левая позиция: левая позиция тела минус ширина тела - 540 умноженное на соотношение ширин окна и десктопа
      this.cloudRightL = Math.round(
          this.bodyL + this.bodyWidth - 540 * wFactor
      );
      // верхняя позиция: верхняя позиция тела - 10 умноженное на соотношение ширин окна и десктопа
      // в отличие от мобилки не умножается на 55 и 10 прибавляется а не вычитается
      this.cloudRightT = Math.round(this.bodyT + 10 * wFactor);
    }
  }

  // метод обновления размеров воздушных шаров
  updateBalloonsSizing() {
    // соотношение ширины окна и ширины десктопа
    let factor = wFactor;

    if (this.isMobile) {
      factor *= 1.5;
    }
    // левый воздушный шар
    // ширина равна ширине картинки (149) умноженной на соотношение ширин окна и десктопа
    this.balloonLeftWidth = Math.round(149 * factor);
    // высота равна ширине умноженной на 162 и деленной на 149 (непонятно что это за цифры)
    this.balloonLeftHeight = Math.round((this.balloonLeftWidth * 162) / 149);
    // левая позиция: левая позиция тела + 140 умноженное на соотношение ширин окна и десктопа
    this.balloonLeftL = Math.round(this.bodyL + 140 * factor);
    // верхняя позиция: верхняя позиция тела + 145 умноженное на соотношение ширин окна и десктопа
    this.balloonLeftT = Math.round(this.bodyT - 145 * factor);
    // правый воздушный шар
    // ширина равна ширине картинки (152) умноженной на соотношение ширин окна и десктопа
    this.balloonRightWidth = Math.round(152 * factor);
    // высота равна ширине умноженной на 182 и деленной на 152 (непонятно что это за цифры)
    this.balloonRightHeight = Math.round((this.balloonRightWidth * 182) / 152);
    // левая позиция: левая позиция тела + 208 умноженное на соотношение ширин окна и десктопа
    this.balloonRightL = Math.round(this.bodyL + 208 * factor);
    // верхняя позиция: верхняя позиция тела - 185 умноженное на соотношение ширин окна и десктопа
    this.balloonRightT = Math.round(this.bodyT - 185 * factor);
  }

  // все следующие методы - вспомогательные функции для отрисовки разных элементов сцены

  // метод отрисовки звезд
  // принимает на вход: тип, координаты, масштаб
  drawStar(type, x, y, scale) {
    // координаты умножаем на соотношения ширины и высоты окна к размерам деска
    x *= wFactor;
    y *= hFactor;
    // начинает создание контура
    this.ctx.beginPath();

    // отрисовка в зависимости от типа звезды
    switch (type) {
      // small star
      // t: `s`
      case `s`: {
        // размер маленькой звезды: 7 * масштаб
        const size = 7 * scale;
        // перемещаем перо в исходную точку
        this.ctx.moveTo(x, y);
        // рисуем линию на 7 пикс вправо и вниз
        this.ctx.lineTo(x + size, y + size);
        // перемещаем перо вверх
        this.ctx.moveTo(x + size, y);
        // рисуем линию на 7 пикс влево и вниз
        this.ctx.lineTo(x, y + size);

        break;
      }
      // big star
      // t: `b`
      case `b`: {
        // ширина большой звезды: 20 * масштаб
        const sizeX = 20 * scale;
        // высота большой звезды: 28 * масштаб
        const sizeY = 28 * scale;
        // рисуем большие звезды с помощью метода канваса bezierCurveTo
        // этот отрисовка кубической кривой Безье из текущей позиции «пера» в конечную точку с координатами x и y
        // с использованием двух контрольных точек с координатами (cp1x, cp1y) и (cp2x, cp2y)
        // итого параметры выглядят так bezierCurveTo (cp1x, cp1y, cp2x, cp2y, x, y)
        // в нашем случае каждая звезда состоит из 4 линий

        // контрольная точка cp1 первой кривой и конечная точка четвертой (левая точка)
        // отталкивается от координат звезды
        // находится левее на половину ширины звезды
        // совпадает с начальной точкой рисования
        const lx = x - sizeX / 2;
        const ly = y;
        // конечная точка первой кривой и контрольная точка cp1 второй (верхняя точка)
        // отталкивается от начальной точки рисования
        // находится правее на половину ширины звезды и выше на половину высоты звезды
        const tx = lx + sizeX / 2;
        const ty = ly - sizeY / 2;
        // конечная точка второй кривой и контрольная точка cp1 третьей (правая точка)
        // отталкивается от начальной точки рисования
        // находится правее на всю ширину звезды
        const rx = lx + sizeX;
        const ry = ly;
        // конечная точка третьей кривой и контрольная точка cp1 четвертой (нижняя точка)
        // отталкивается от начальной точки рисования
        // находится правее на половину ширины звезды и ниже на половину высоты звезды
        const bx = lx + sizeX / 2;
        const by = ly + sizeY / 2;
        // контрольная точка cp2 рассчитывается из координат cx и cy
        // они совпадают с координатами звезды (центр звезды)
        // для каждой кривой двигается либо вправо/влево/вниз/вверх, а размеры звезды умножаются на коэф 0.06 и 0.15
        const cx = lx + sizeX / 2;
        const cy = ly;

        // перемещаем перо в исходную точку
        this.ctx.moveTo(lx, ly);
        // первая кривая - левая верхняя часть звезды
        // вторая контрольная точка левее и выше центра
        this.ctx.bezierCurveTo(
            lx,
            ly,
            cx - sizeX * 0.06,
            cy - sizeY * 0.15,
            tx,
            ty
        );
        // вторая кривая - правая верхняя часть звезды
        // вторая контрольная точка правее и выше центра
        this.ctx.bezierCurveTo(
            tx,
            ty,
            cx + sizeX * 0.06,
            cy - sizeY * 0.15,
            rx,
            ry
        );
        // третья кривая - правая нижняя часть звезды
        // вторая контрольная точка правее иниже центра
        this.ctx.bezierCurveTo(
            rx,
            ry,
            cx + sizeX * 0.06,
            cy + sizeY * 0.15,
            bx,
            by
        );
        // четвертая кривая - левая нижняя часть звезды
        // вторая контрольная точка левее и ниже центра
        this.ctx.bezierCurveTo(
            bx,
            by,
            cx - sizeX * 0.06,
            cy + sizeY * 0.15,
            lx,
            ly
        );

        break;
      }
    }

    // делае углы закругленными
    this.ctx.lineJoin = `round`;
    // задаем цвет
    this.ctx.strokeStyle = `#fff`;
    // задаем обводку
    this.ctx.stroke();
  }

  // метод для вращения холста
  rotateCtx(angle, cx, cy) {
    // перемещаем холст в опорную точку поворота
    this.ctx.translate(cx, cy);
    // метод rotate принимает число в радианах, так что надо сначала перевести градусы в радианы по формуле
    this.ctx.rotate((angle * Math.PI) / 180);
    // возвращаем холст на место
    this.ctx.translate(-cx, -cy);
  }

  // метод отрисовки луны
  // приниает на вход: координаты луны, радиус, дельту между внешней и внутренней стороной полумесяца, угол поворота
  drawMoon(x, y, radius, dx, angle) {
    // координаты умножаем на соотношения ширины и высоты окна к размерам деска
    x *= wFactor;
    y *= hFactor;

    // сохраняем контекст
    this.ctx.save();
    // поворачиваем холст на угол поворота луны
    this.rotateCtx(angle, x, y);

    // луну-полумесяц рисуем с помощью двух дуг (внешней и внутренней), рисуются с помощью метода arc
    // принимает координты центра дуги, радиус, угол начала дуги и угол завершения дуги
    // итого ctx.arc(x, y, radius, startAngle, endAngle);

    // outer arc
    // рисуем внешнюю арку
    // начинает создание контура
    this.ctx.beginPath();
    // определяем начальный угол как пи / 8 (непонятно почему)
    // конечный угол будет полный круг (2 пи) - пи / 8 (непонятно почему)
    let startAngle = Math.PI / 8;
    // рисуем арку, по итогу выйдет незаконченный круг с пробелом как раз на 2 угла по пи / 8 ( внешняя сторона полумесяца)
    this.ctx.arc(x, y, radius, startAngle, 2 * Math.PI - startAngle);
    // задаем цвет контура
    this.ctx.strokeStyle = `#fff`;
    // обводим контур
    this.ctx.stroke();
    // завершаем контур
    this.ctx.closePath();

    // inner arc
    // рисуем внутренню арку
    // начинает создание контура
    this.ctx.beginPath();
    // переопределяем начальный угол: добавляем к пи / 8 угол пи / 24 (непонятно почему, но возможно это значения из AE)
    startAngle += Math.PI / 24;
    // рисуем арку, только к х координате добавляем еще дельту и 1, а из радиуса дельту вычитаем
    // конечный угол будет снова полный круг (2 пи) за минусом начального угла
    // по итогу выйдет внутренняя сторона полумесяца
    this.ctx.arc(
        x + dx + 1,
        y,
        radius - dx,
        startAngle,
        2 * Math.PI - startAngle
    );
    // обводим контур
    this.ctx.stroke();
    // завершаем контур
    this.ctx.closePath();
    // восстанавливаем контекст
    // тут хорошо понятно зачем восстанавливать контекст, который мы сохранили до поворота
    // если этого не сделать, весь холст со всеми остальными элементами будет повернут вместе с луной
    this.ctx.restore();
  }

  // метод отрисовки облаков
  drawClouds() {
    // сохраняем свойства контекста
    this.ctx.save();
    // этот метод канваса начинает создание контура
    this.ctx.beginPath();
    // перемещаем перо в верхнюю левую точку холста
    this.ctx.moveTo(0, 0);
    // рисуем линию в правую крайнюю точку постера (левая позиция + его ширина)
    this.ctx.lineTo(this.posterL + this.posterWidth, 0);
    // рисуем линию в нижнюю точку окна (высота окна)
    this.ctx.lineTo(this.posterL + this.posterWidth, winH);
    // рисуем линию в нулевую левую точку холста
    this.ctx.lineTo(0, winH);
    // закрываем контур
    this.ctx.closePath();
    // этод метод канваса обрезает область любой формы и размера, находящуюся вне указанного контура
    // в нашем случае контур мы нарисовали выше
    this.ctx.clip();
    // рисуем изображение левого облака на канвасе с помощью метода drawImage, используя ранее расчитанные координаты и размеры
    this.ctx.drawImage(
        this.cloudLeftImg,
        this.cloudLeftL,
        this.cloudLeftT,
        this.cloudLeftWidth,
        this.cloudLeftHeight
    );
    // восстанавливаем свойства контекста
    this.ctx.restore();
    // сохраняем свойства контекста
    this.ctx.save();
    // этот метод канваса начинает создание контура
    this.ctx.beginPath();
    // перемещаем перо в левую крайнюю точку постера, вернюю точку окна
    this.ctx.moveTo(this.posterL, 0);
    // рисуем линию в правую точку окна (ширина окна)
    this.ctx.lineTo(winW, 0);
    // рисуем линию в нижнюю точку окна (высота окна)
    this.ctx.lineTo(winW, winH);
    // рисуем линию в левую крайнюю точку постера
    this.ctx.lineTo(this.posterL, winH);
    // закрываем контур
    this.ctx.closePath();
    // вырезаем область
    this.ctx.clip();
    // рисуем изображение правого облака на канвасе с помощью метода drawImage, используя ранее расчитанные координаты и размеры
    this.ctx.drawImage(
        this.cloudRightImg,
        this.cloudRightL,
        this.cloudRightT,
        this.cloudRightWidth,
        this.cloudRightHeight
    );
    // восстанавливаем свойства контекста
    this.ctx.restore();
    // манипуляции с обрезкой областей тут нужны, чтобы облака как бы выезжали из розового окна (фона постера)
    // область вокруг постера не видно, поэтому создается такой эффект
  }

  // метод отрисовки кита
  drawWhale() {
    // задаем непрозрачность холста
    this.ctx.globalAlpha = 1;
    // перемещаем холст в начальную координату сцены (координаты помножены на отношение ширин экрана и десктопа)
    this.ctx.translate(this.sceneX * wFactor, this.sceneY * wFactor);
    // поворачиваем холст на угол поворота сцены, опорная точка поворота - середина экрана (ширина и высота деленные на 2)
    this.rotateCtx(this.sceneAngle, winW / 2, winH / 2);
    // рисуем изображение тела кита на канвасе с помощью метода drawImage, используя ранее расчитанные координаты и размеры
    this.ctx.drawImage(
        this.bodyImg,
        this.bodyL,
        this.bodyT,
        this.bodyWidth,
        this.bodyHeight
    );
    // сохраняем свойства контекста и рисуем плавник
    this.ctx.save();
    // поворачиваем холст на угол поворота плавника, опорная точка поворота (скорее всего координаты взяты из AE):
    // X: левая позиция плавника + 21 умноженное на отношение ширин экрана и десктопа
    // Y: верхняя позиция плавника + 31 умноженное на отношение ширин экрана и десктопа
    this.rotateCtx(
        this.finAngle,
        this.finL + 21 * wFactor,
        this.finT + 31 * wFactor
    );
    // рисуем изображение плавника на канвасе с помощью метода drawImage, используя ранее расчитанные координаты и размеры
    this.ctx.drawImage(
        this.finImg,
        this.finL,
        this.finT,
        this.finWidth,
        this.finHeight
    );
    // восстанавливаем свойства контекста
    this.ctx.restore();

    // сохраняем свойства контекста и рисуем хвост
    this.ctx.save();
    // поворачиваем холст на угол поворота хвоста, опорная точка поворота (скорее всего координаты взяты из AE):
    // X: левая позиция хвоста + 10 умноженное на отношение ширин экрана и десктопа
    // Y: верхняя позиция хвоста + 12 умноженное на отношение ширин экрана и десктопа
    this.rotateCtx(
        this.tailAngle,
        this.tailL + 10 * wFactor,
        this.tailT + 12 * wFactor
    );
    // рисуем изображение хвоста на канвасе с помощью метода drawImage, используя ранее расчитанные координаты и размеры
    this.ctx.drawImage(
        this.tailImg,
        this.tailL,
        this.tailT,
        this.tailWidth,
        this.tailHeight
    );
    // восстанавливаем свойства контекста
    this.ctx.restore();
  }

  // метод отрисовки нитей шаров
  drawThreads() {
    // соотношение ширины окна и ширины десктопа
    let factor = wFactor;

    if (this.isMobile) {
      factor *= 1.5;
    }

    // нити рисуются с помощью метода канваса bezierCurveTo
    // этот отрисовка кубической кривой Безье из текущей позиции «пера» в конечную точку с координатами x и y
    // с использованием двух контрольных точек с координатами (cp1x, cp1y) и (cp2x, cp2y)
    // итого параметры выглядят так bezierCurveTo (cp1x, cp1y, cp2x, cp2y, x, y)
    // в нашем случае каждая нитка будет строится из двух кривых, по разному изогнутых

    // draw thread left
    // отрисовка нити слева
    // задаем цвет линии
    this.ctx.strokeStyle = `#fff`;
    // начинает создание контура
    this.ctx.beginPath();

    // определяем параметры кривых
    // конечная точка второй кривой
    // отталкивается от левой и верхней позиции тела кита
    // находится правее на 370 пикс и ниже на 222 пикс
    const threadLeftBBX = this.bodyL + 370 * factor;
    const threadLeftBBY = this.bodyT + 222 * factor;
    // конечная точка первой кривой
    // отталкивается от конечной точки второй кривой
    // находится левее на 84 пикс и выше на 98 пикс
    const threadLeftMX = threadLeftBBX - 84 * factor;
    const threadLeftMY = threadLeftBBY - 98 * factor;
    // контрольная точка cp1 второй кривой
    // отталкивается от конечной точки первой кривой
    // находится правее на 43 и ниже на 35
    const threadLeftBTX = threadLeftMX + 43 * factor;
    const threadLeftBTY = threadLeftMY + 35 * factor;
    // контрольная точка cp2 второй кривой
    // отталкивается от конечной точки первой кривой
    // находится правее на 84 и ниже на 92
    const threadLeftBMX = threadLeftMX + 84 * factor;
    const threadLeftBMY = threadLeftMY + 92 * factor;
    // контрольная точка cp1 первой кривой
    // отталкивается от конечной точки первой кривой
    // находится левее на 68 пикс и выше на 110 пикс
    // совпадает с начальной точкой рисования
    const threadLeftL = threadLeftMX - 68 * factor;
    const threadLeftT = threadLeftMY - 110 * factor;
    // контрольная точка cp2 первой кривой
    // отталкивается от точки cp1 первой кривой
    // находится правее на 75 пикс и ниже на 25 пикс
    const threadLeftLTY = threadLeftT + 75 * factor;
    const threadLeftLTX = threadLeftL + 25 * factor;

    // задаем начальную точку рисования кривой Безье (перемещаем перо)
    this.ctx.moveTo(threadLeftL, threadLeftT);
    // рисуем первую кривую
    this.ctx.bezierCurveTo(
        threadLeftL,
        threadLeftT,
        threadLeftLTX,
        threadLeftLTY,
        threadLeftMX,
        threadLeftMY
    );
    // рисуем вторую кривую
    this.ctx.bezierCurveTo(
        threadLeftBTX,
        threadLeftBTY,
        threadLeftBMX,
        threadLeftBMY,
        threadLeftBBX,
        threadLeftBBY
    );
    // обводим контур
    this.ctx.stroke();
    // замыкаем контур
    this.ctx.closePath();

    // draw thread right
    // отрисовка нити справа

    // определяем параметры кривых
    // конечная точка второй кривой
    // отталкивается от левой и верхней позиции тела кита
    // находится правее на 312 пикс и ниже на 234 пикс
    const threadRightBBX = this.bodyL + 312 * factor;
    const threadRightBBY = this.bodyT + 234 * factor;
    // контрольная точка cp1 первой кривой
    // отталкивается от конечной точки второй кривой
    // находится левее на 30 пикс и выше на 262 пикс
    // совпадает с начальной точкой рисования
    const threadRightL = threadRightBBX - 30 * factor;
    const threadRightT = threadRightBBY - 262 * factor;
    // контрольная точка cp2 первой кривой
    // отталкивается от точки cp1 первой кривой
    // находится правее на 16 пикс и ниже на 39 пикс
    const threadRightLTX = threadRightL + 16 * factor;
    const threadRightLTY = threadRightT + 39 * factor;
    // конечная точка первой кривой
    // отталкивается от точки cp1 первой кривой
    // находится правее на 11 пикс и ниже на 117 пикс
    const threadRightMX = threadRightL + 11 * factor;
    const threadRightMY = threadRightT + 117 * factor;
    // контрольная точка cp1 второй кривой
    // отталкивается от точки cp1 первой кривой
    // находится правее на 6 и ниже на 190
    const threadRightBTX = threadRightL + 6 * factor;
    const threadRightBTY = threadRightT + 190 * factor;
    // контрольная точка cp2 второй кривой
    // отталкивается от точки cp1 первой кривой
    // находится правее на 25 и ниже на 256
    const threadRightBMX = threadRightL + 25 * factor;
    const threadRightBMY = threadRightT + 256 * factor;

    // начинает создание контура
    this.ctx.beginPath();
    // задаем начальную точку рисования кривой Безье (перемещаем перо)
    this.ctx.moveTo(threadRightL, threadRightT);
    // рисуем первую кривую
    this.ctx.bezierCurveTo(
        threadRightL,
        threadRightT,
        threadRightLTX,
        threadRightLTY,
        threadRightMX,
        threadRightMY
    );
    // рисуем вторую кривую
    this.ctx.bezierCurveTo(
        threadRightBTX,
        threadRightBTY,
        threadRightBMX,
        threadRightBMY,
        threadRightBBX,
        threadRightBBY
    );
    // обводим контур
    this.ctx.stroke();
    // замыкаем контур
    this.ctx.closePath();
  }

  // метод отрисовки воздушных шаров
  drawBaloons() {
    // рисуем изображение левого шара на канвасе с помощью метода drawImage, используя ранее расчитанные координаты и размеры
    this.ctx.drawImage(
        this.balloonLeftImg,
        this.balloonLeftL,
        this.balloonLeftT,
        this.balloonLeftWidth,
        this.balloonLeftHeight
    );

    // рисуем изображение правого шара на канвасе с помощью метода drawImage, используя ранее расчитанные координаты и размеры
    this.ctx.drawImage(
        this.balloonRightImg,
        this.balloonRightL,
        this.balloonRightT,
        this.balloonRightWidth,
        this.balloonRightHeight
    );
  }

  // метод отрисовки всей сцены
  drawScene() {
    // задаём размеры холста
    this.canvas.width = winW;
    this.canvas.height = winH;

    // очистка контекста, удаляет всё ранее нарисованное
    this.ctx.clearRect(0, 0, winW, winH);

    // в отличие от постера тут понятно зачем нужен флаг анимации: отрисовываем всё только когда стартует анимация
    // потому что кит появляется только после анимации постера
    if (this.isAnimated) {
      // соотношение ширины окна и ширины десктопа
      const factor = wFactor < 1 ? wFactor : 1;
      // вычисление координаты x луны
      // из координаты конца луны вычитаем длину дуги
      // длина дуги - это радиус умноженный на центральный угол, на который опирается дуга
      // почему тут он отрицательный и из него вычитается 32 - непонятно
      // отрицательный скорее всего потому, что угол изначально отрицательный (это сделано для вращения луны по часовой стрелке)
      // то есть когда мы ставим минус в этом расчете, минус на минус дает плюс
      // moonRotateAngle - это угол, на который повернута луна
      // примечание: * Math.PI / 180 - это перевод в радианы по формуле, для длины дуги нужны радианы

      // на самом деле тут та же схема, что была в выкатывании кнопок слайдера в личном проекте:
      // положение луны по вертикали зависит от длины дуги, чтобы луна катилась
      // мы меняем параметры угла в анимации animateMoon и, соответственно,
      // когда перерисовывается сцена, меняется не только угол поворота, но и зависимое от него положение луны

      const moonX =
        this.moonEndX -
        (this.moonRadius * (((-this.moonRotateAngle - 32) * Math.PI) / 180)) /
          factor;
      // вызываем метод отрисовки луны
      // передаем координаты луны, радиус, дельту, угол поворота холста
      // луна не видна изначально, пч все эти параметры в конструкторе равны нулю
      this.drawMoon(
          moonX,
          this.moonY,
          this.moonRadius,
          this.moonDx,
          this.moonRotateAngle
      );

      // Mask for moon
      // тут очищается вся чась экрана до постера, соответственно удаляется луна
      // это нужно, чтобы отрисованную луну не было видно изначально, а потом она как бы выкатывается из невидимой области
      this.ctx.clearRect(0, 0, this.posterL, winH);

      // перебираем параметры звезд
      this.starsOptions.forEach((starOption) => {
        // для каждой вызываем метод отрисовки звезд
        this.drawStar(
            // передаем тип
            starOption.t,
            // передаем координату x
            starOption.x,
            // передаем координату y
            starOption.y,
            // в массиве STARS_OPTIONS изначально нет параметра sc ни в одном объекте
            // это параметр масштаба, по умолчанию 0, поэтому звезды изначально не видны (их размер умножается на 0)
            starOption.sc || 0
        );
      });

      // задаем прозрачность холста равной прозрачности облаков
      // потом прозрачность включается только в методе drawWhale
      // а значит облаков изначально не видно
      this.ctx.globalAlpha = this.cloudsOpacity;

      // отрисовываем облака
      this.drawClouds();
      // отрисовываем кита
      this.drawWhale();
      // отрисовываем нити шаров
      this.drawThreads();
      // отрисовываем воздушные шары
      this.drawBaloons();
    }
  }

  // все следующие методы - вспомогательные функции для анимации разных элементов сцены

  // смена параметров звезд
  getStarsAnimationTick() {
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    return (progress) => {
      // перебираем массив с параметрами звезд
      this.starsOptions = this.starsOptions.map((starOption) => {
        // временные параметры из объектов звезд: s - на какой секунде показывать, h - на какой секунде скрывать
        // сдвигаем это время на 3.27 назад (непонятно почему) и умножаем на 1000 (перевод в милисекунды)
        // получается время показа и скрытия звезд
        const showAt = (starOption.s - 3.27) * 1000 || 0;
        const hideAt = (starOption.h - 3.27) * 1000 || 0;

        // set star scale
        // устанавливаем масштаб звезд в зависимости от типа
        switch (starOption.t) {
          // big star
          case `b`: {
            // изинги для появления и исчезания
            // bezierEasing - сложная математическая вспомогательная функция, которая возвращает вложенную функцию
            // в эту вложенную функцию надо передать отношение прошедшего с начала анимации времени к ее длительности
            // после чего bezierEasing вернет прогресс с учетом временной функции
            const showEasing = bezierEasing(0.33, 0, 0.06, 1);
            const hideEasing = bezierEasing(0.33, 0, 0.18, 1);
            // длительность показа и скрытия
            const showDuration = 200;
            const hideDuration = 650;
            // если прогресс меньше чем время скрытия и больше или равно чем время показа
            if (progress < hideAt && progress >= showAt) {
              // прогресс масштабирования:
              // если с начала показа прошло больше времени, чем длительность показа, то прогресс 1
              // если меньше, то вычисляем отношение прошедшего с начала показа времени к его длительности
              const starScaleProgress =
                progress - showAt >= showDuration
                  ? 1
                  : (progress - showAt) / showDuration;
              // передаем отношение в функцию, которую возвращает bezierEasing
              // в результате получим прогресс - его указываем в качестве параметра scale для звезды
              // все логично: scale - это, по сути, видимость звезды, при нулевом масштабе ее не видно
              starOption.sc = showEasing(starScaleProgress);
              // если прогресс больше чем время скрытия и время прошедшее с начала времени скрытия меньше чем длительность скрытия
            } else if (progress > hideAt && progress - hideAt < hideDuration) {
              // прогресс масштабирования:
              // если с начала скрытия прошла вся длительность скрытия, то прогресс 0
              // если нет, то вычисляем отношение прошедшего с начала скрытия времени к его длительности
              const starScaleProgress =
                progress - hideAt >= hideDuration
                  ? 0
                  : (progress - hideAt) / hideDuration;
              // передаем отношение в функцию, которую возвращает bezierEasing
              // в результате получим прогресс - в качестве параметра scale для звезды указываем единицу минус этот прогресс (потому что при скрытии идет уменьшение)
              starOption.sc = 1 - hideEasing(starScaleProgress);
              // если ни одно из условий выше не выполняется, задаем масштаб ноль (скрываем звезду)
            } else {
              starOption.sc = 0;
            }

            break;
          }
          // small star
          case `s`: {
            // маленькие звезды мигают, у них нет плавного увеличения и уменьшения
            // поэтому их прогресс либо 1, если анимация находится между временем показа и временем скрытия, либо 0 и их не видно
            starOption.sc = progress < hideAt && progress >= showAt ? 1 : 0;
            break;
          }
          // big star
          default: {
            // по дефолту звезды скрыты
            starOption.sc = 0;
          }
        }

        return starOption;
      });
    };
  }

  // фоновая анимация звезд
  animateStarsInfinite() {
    // таймлайн анимации звезд
    // для каждой функции вызываем функцию animateDuration, в которую передаем функцию смены параметров звезд и общую длительность
    // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прошедшее время анимации и передается в функцию смены параметров звезд
    const starsAnimations = [
      () => animateDuration(this.getStarsAnimationTick(), 2960),
      () => animateDuration(this.getStarsAnimationTick(), 2960),
      () => animateDuration(this.getStarsAnimationTick(), 2960),
    ];

    // запуск (друг за другом) анимаций звезд
    // в этой вспомогательной функции создается цепочка промисов, которые резолвятся по очереди
    runSerial(starsAnimations);
  }

  // бесконечный перезапуск анимации звезд
  startStarsAnimationInfinite() {
    // вспомогательная функция для запуска анимации звезд
    // на вход принимает прошедшее время анимации, которое будет расчитано внутри функции animateDuration
    const globalAnimationTick = (globalProgress) => {
      if (globalProgress === 0) {
        // запускаем фоновую анимацию звезд
        this.animateStarsInfinite();
      }
    };

    // массив функций, в нашем случае только одна (анимация звезд)
    // для каждой функции вызываем функцию animateDuration, в которую передаем функцию запуска анимации звезд и общую длительность
    // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прошедшее время анимации и передается в функцию запуска анимации звезд
    const animations = [() => animateDuration(globalAnimationTick, 6000)];

    // в этой вспомогательной функции создается цепочка промисов, которые резолвятся по очереди
    // но у нас только одна функция, так что мы зацикливаем данный метод следующим образом:
    // после того как runSerial вернет зарезолвленный промис мы снова вызываем метод изнутри него же
    // так как у нас длительность анимации сцены 6 секунд, промис резолвится и метод вызывается не чаще чем 1 раз в 6 секунд
    runSerial(animations).then(this.startStarsAnimationInfinite.bind(this));
  }

  // анимация появления-выезжания облаков из невидимых областей
  animateClouds() {
    // вспомогательная функция смены положения по горизонтали левого облака
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const cloudLeftXTick = (from, to) => (progress) => {
      this.cloudLeftL = from + progress * (to - from);
    };
    // вспомогательная функция смены положения по горизонтали правого облака
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const cloudRightXTick = (from, to) => (progress) => {
      this.cloudRightL = from + progress * (to - from);
    };
    // начальное значение левого облака (видимо взяты из AE)

    let cloudLeftXFrom = (1113 - 612 / 2) * wFactor;
    // на мобиле значение другое
    if (this.isMobile) {
      cloudLeftXFrom = (1113 + 612 / 2) * wFactor;
    }
    // конечное значение левого облака - облако движется влево, поэтому из начального значения вычитаем 660
    const cloudLeftXTo = cloudLeftXFrom - 660 * wFactor;
    // таймлайн анимации левого облака
    const cloudLeftAnimations = [
      () =>
        animateEasing(
            cloudLeftXTick(cloudLeftXFrom, cloudLeftXTo),
            2467,
            bezierEasing(0.11, 0, 0, 1)
        ),
    ];

    // начальное значение правого облака (видимо взяты из AE)
    let cloudRightXFrom = (463 - 644 / 2) * wFactor;
    // на мобиле значение другое
    if (this.isMobile) {
      cloudRightXFrom = (463 - (8 * 644) / 2) * wFactor;
    }

    // конечное значение правого облака - облако движется вправо, поэтому к начальному значению прибавляем 660
    const cloudRightXTo = cloudRightXFrom + 660 * wFactor;
    // таймлайн анимации правого облака
    const cloudRightAnimations = [
      () =>
        animateEasing(
            cloudRightXTick(cloudRightXFrom, cloudRightXTo),
            2467,
            bezierEasing(0.11, 0, 0, 1)
        ),
    ];

    // одновременный запуск анимаций появления левого и правого облака
    // в этой вспомогательной функции создается цепочка промисов, которые резолвятся по очереди
    runSerial(cloudLeftAnimations);
    runSerial(cloudRightAnimations);

    // вспомогательная функция смены прозрачности облаков
    // принимает прогресс от 0 до 1 и прозрачность равна прогрессу
    const cloudsOpacityTick = (progress) => {
      this.cloudsOpacity = progress;
    };

    // вызываем один раз функцию animateEasing (тут цепочка не нужна) с нужной длительностью и параметрами Безье
    animateEasing(cloudsOpacityTick, 850, bezierEasing(0, 0, 1, 1));
  }

  animateCloudsInfinite() {
    // вспомогательная функция смены положения по вертикали левого облака
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const cloudLeftYTick = (from, to) => (progress) => {
      this.cloudLeftT = from + progress * (to - from);
    };
    // вспомогательная функция смены положения по вертикали правого облака
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const cloudRightYTick = (from, to) => (progress) => {
      this.cloudRightT = from + progress * (to - from);
    };
    // изинг
    const symmetricalEase = bezierEasing(0.33, 0, 0.67, 1);
    // начальное и конечное значение положения по вертикали левого облака
    // поднимается вверх на 20
    const cloudLeftYFrom = this.cloudLeftT;
    const cloudLeftYTo = cloudLeftYFrom - 20 * wFactor;

    // таймлайн для анимации вертикального положения левого облака
    // это массив из функций, в каждой из которых вызывается функция animateEasing
    // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прогресс анимации с учетом временной функции Безье и на протяжении ее длительности он передается в функцию изменения параметров
    const cloudLeftAnimations = [
      () =>
        animateEasing(
            cloudLeftYTick(cloudLeftYFrom, cloudLeftYTo),
            4883,
            symmetricalEase
        ),
      () =>
        animateEasing(
            cloudLeftYTick(cloudLeftYTo, cloudLeftYFrom),
            4317,
            symmetricalEase
        ),
    ];

    // начальное и конечное значение положения по вертикали правого облака
    // опускается вниз на 20
    const cloudRightYFrom = this.cloudRightT;
    const cloudRightYTo = cloudRightYFrom + 20 * wFactor;

    // таймлайн для анимации вертикального положения правого облака
    // это массив из функций, в каждой из которых вызывается функция animateEasing
    // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прогресс анимации с учетом временной функции Безье и на протяжении ее длительности он передается в функцию изменения параметров
    const cloudRightAnimations = [
      () =>
        animateEasing(
            cloudRightYTick(cloudRightYFrom, cloudRightYTo),
            4883,
            symmetricalEase
        ),
      () =>
        animateEasing(
            cloudRightYTick(cloudRightYTo, cloudRightYFrom),
            4317,
            symmetricalEase
        ),
    ];

    // одновременный запуск фоновых анимаций левого и правого облака
    // в этой вспомогательной функции создается цепочка промисов, которые резолвятся по очереди
    runSerial(cloudLeftAnimations);
    runSerial(cloudRightAnimations);
  }

  // запуск анимации облаков
  startAnimateClouds() {
    // вспомогательная функция для запуска анимации облаков
    // на вход принимает прошедшее время анимации, которое будет расчитано внутри функции animateDuration
    const globalAnimationTick = (globalProgress) => {
      if (globalProgress === 0) {
        // запускаем анимацию появления облаков
        this.animateClouds();
      }
    };

    // массив функций, в нашем случае только одна (анимация облаков)
    // для каждой функции вызываем функцию animateDuration, в которую передаем функцию запуска анимации облаков и общую длительность
    // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прошедшее время анимации и передается в функцию запуска анимации облаков
    const animations = [() => animateDuration(globalAnimationTick, 2467)];

    // в этой вспомогательной функции создается цепочка промисов, которые резолвятся по очереди
    // после того как runSerial вернет зарезолвленный промис мы вызываем метод startAnimateCloudsInfinite
    // таким образом у нас отрабатывает один раз анимация появления облаков, а потом запускается анимацию старта фоновой анимации
    runSerial(animations).then(this.startAnimateCloudsInfinite.bind(this));
  }

  // запуск фоновой анимации облаков
  startAnimateCloudsInfinite() {
    // вспомогательная функция для запуска фоновой анимации облаков
    // на вход принимает прошедшее время анимации, которое будет расчитано внутри функции animateDuration
    const globalAnimationTick = (globalProgress) => {
      if (globalProgress === 0) {
        this.animateCloudsInfinite();
      }
    };

    // массив функций, в нашем случае только одна (запуск фоновой анимации облаков)
    // для каждой функции вызываем функцию animateDuration, в которую передаем функцию запуска анимации облаков и общую длительность
    // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прошедшее время анимации и передается в функцию запуска фоновой анимации облаков
    const animations = [() => animateDuration(globalAnimationTick, 9200)];

    // в этой вспомогательной функции создается цепочка промисов, которые резолвятся по очереди
    // но у нас только одна функция, так что мы зацикливаем данный метод следующим образом:
    // после того как runSerial вернет зарезолвленный промис мы снова вызываем метод изнутри него же
    // так как у нас длительность перерисовки сцены 9.2 секунд, промис резолвится и метод вызывается не чаще чем 1 раз в 9.2 секунд
    runSerial(animations).then(this.startAnimateCloudsInfinite.bind(this));
  }

  // анимация луны
  animateMoon() {
    // вспомогательная функция смены угла наклона луны
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const moonRotateTick = (from, to) => (progress) => {
      this.moonRotateAngle = from + progress * (to - from);
    };
    // таймлайн для анимации вращения луны
    // это массив из функций, в каждой из которых вызывается функция animateEasing
    // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прогресс анимации с учетом временной функции Безье и на протяжении ее длительности он передается в функцию изменения параметров
    // значения from и to, которые передаются в moonRotateTick скорее всего взяты из AE
    const moonAnimations = [
      () =>
        animateEasing(
            moonRotateTick(-550 / wFactor, -20),
            2033,
            bezierEasing(0.55, 0, 0.12, 1)
        ),
      () =>
        animateEasing(
            moonRotateTick(-20, -37),
            683,
            bezierEasing(0.31, 0, 0.69, 1)
        ),
      () =>
        animateEasing(
            moonRotateTick(-37, -32),
            717,
            bezierEasing(0.17, 0, 0.69, 1)
        ),
    ];

    // запуск (друг за другом) анимаций поворота луны
    // в этой вспомогательной функции создается цепочка промисов, которые резолвятся по очереди
    runSerial(moonAnimations);
  }

  // метод установки исходной позиции киту
  resetWhale() {
    // Чтобы избежать мелькания картинки в самом первом рендере,
    // сразу перемещает кита за край экрана
    // делается это путем указания значения для координаты X всей сцены (выносится за экран)
    this.sceneX = 1180;
  }

  // начальная анимация появления кита сбоку
  animateWhaleShow() {
    // вспомогательная функция смены положения по горизонтали всей сцены
    const whaleXAnimationTick = (progress) => {
      const from = 1180;
      const to = 50;
      // текущее положение равно начальному значению + разнице между конечным и начальным, умноженной на прогресс
      this.sceneX = from + progress * (to - from);
    };

    // вызываем функцию animateEasing и передаем в нее функцию смены параметров
    // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прогресс анимации с учетом временной функции Безье и на протяжении ее длительности он передается в функцию изменения параметров
    // bezierEasing - сложная математическая вспомогательная функция, которая возвращает вложенную функцию
    // в эту вложенную функцию надо передать отношение прошедшего с начала анимации времени к ее длительности
    // после чего bezierEasing вернет прогресс с учетом временной функции
    // это происходит внутри функции animateEasing

    animateEasing(whaleXAnimationTick, 3900, bezierEasing(0.11, 0.26, 0, 1));
  }

  // фоновая анимация кита
  animateWhaleInfinite() {
    // вспомогательная функция смены положения по вертикали всей сцены
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const whaleYAnimationTick = (from, to) => (progress) => {
      // текущее положение равно начальному значению + разнице между конечным и начальным, умноженной на прогресс
      this.sceneY = from + progress * (to - from);
    };

    // длительность анимации
    const whalePeriod = 6000;
    // изинг анимации
    // bezierEasing - сложная математическая вспомогательная функция, которая возвращает вложенную функцию
    // в эту вложенную функцию надо передать отношение прошедшего с начала анимации времени к ее длительности
    // после чего bezierEasing вернет прогресс с учетом временной функции
    // это происходит внутри функции animateEasing
    const symmetricalEase = bezierEasing(0.33, 0, 0.67, 1);

    // значения от и до по вертикали
    const whaleYFrom = 80;
    const whaleYTo = 0;

    // таймлайн для анимации положения кита по вертикали
    // это массив из функций, в каждой из которых вызывается функция animateEasing
    // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прогресс анимации с учетом временной функции Безье и на протяжении ее длительности он передается в функцию изменения параметров
    // в качестве длительности передаем whalePeriod умноженный на разные коэфициенты (возможно, взяты из АЕ)
    const whaleYAnimations = [
      () =>
        animateEasing(
            whaleYAnimationTick(whaleYFrom, whaleYTo),
            whalePeriod * 0.52,
            symmetricalEase
        ),
      () =>
        animateEasing(
            whaleYAnimationTick(whaleYTo, whaleYFrom),
            whalePeriod * 0.48,
            symmetricalEase
        ),
    ];

    // бесконечный запуск (друг за другом) анимаций положения кита по вертикали
    // в этой вспомогательной функции создается цепочка промисов, которые резолвятся по очереди
    // а потом функция снова вызывается изнутри
    runSerialLoop(whaleYAnimations);

    // вспомогательная функция смены угла вращения
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const whaleAngleAnimationTick = (from, to) => (progress) => {
      // текущий угол равен начальному значению + разнице между конечным и начальным, умноженной на прогресс
      this.sceneAngle = from + progress * (to - from);
    };

    // длительность для начальной анимации для создания разницы фаз (см ниже)
    const whaleAnglePhase = whalePeriod * 0.25;
    // стартовое нулевое значение угла (используется только в анимации для создания разницы фаз)
    const whaleAngleStart = 0;
    // значения от и до угла наклона
    const whaleAngleFrom = 5;
    const whaleAngleTo = -3;
    // таймлайн для анимации наклона кита
    // это массив из функций, в каждой из которых вызывается функция animateEasing
    // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прогресс анимации с учетом временной функции Безье и на протяжении ее длительности он передается в функцию изменения параметров
    // в качестве длительности передаем whalePeriod умноженный на 0.5 (за период анимации наклоняется туда и обратно)
    const whaleAngleAnimations = [
      () =>
        animateEasing(
            whaleAngleAnimationTick(whaleAngleFrom, whaleAngleTo),
            whalePeriod * 0.5,
            symmetricalEase
        ),
      () =>
        animateEasing(
            whaleAngleAnimationTick(whaleAngleTo, whaleAngleFrom),
            whalePeriod * 0.5,
            symmetricalEase
        ),
    ];

    // Создаёт разницу фаз между колебаниями вверх-вниз и колебаниями угла наклона корпуса кита
    // как это работает не очень понятно, но визуально выглядит более плавно и естественно
    // судя по всему создается отставание наклона от движений вверх вниз
    // сначала вызываем эту анимацию, где угол меняется от 0 до 5, а потом уже запускаем бесконечные колебания от 5 до -3 и обратно
    animateEasing(
        whaleAngleAnimationTick(whaleAngleStart, whaleAngleFrom),
        whaleAnglePhase,
        symmetricalEase
    ).then(() => {
      // бесконечный запуск (друг за другом) анимаций наклона кита
      // в этой вспомогательной функции создается цепочка промисов, которые резолвятся по очереди
      // а потом функция снова вызывается изнутри
      runSerialLoop(whaleAngleAnimations);
    });

    // вспомогательная функция смены угла плавника
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const whaleFinAnimationTick = (from, to) => (progress) => {
      this.finAngle = from + progress * (to - from);
    };

    // таймлайн для анимации наклона плавника
    // в качестве длительности передаем whalePeriod умноженный на разные коэфициенты (возможно, взяты из АЕ)
    // примечание: у анимаций отличаются изинги
    const whaleFinAnimations = [
      () =>
        animateEasing(
            whaleFinAnimationTick(26, 3),
            whalePeriod * 0.39,
            bezierEasing(0.33, 0, 0.33, 1)
        ),
      () =>
        animateEasing(
            whaleFinAnimationTick(3, 26),
            whalePeriod * 0.61,
            bezierEasing(0.46, 0, 0.67, 1)
        ),
    ];

    // бесконечный запуск (друг за другом) анимаций наклона плавника
    runSerialLoop(whaleFinAnimations);

    // Все движения второстепенных частей кроме плавника сдвигаем на одну небольшую величину.
    // Так словно эти части увлекаются движением корпуса и немного от него отстают.
    const whaleSecondaryPartsPhase = whalePeriod * 0.06;

    // вспомогательная функция смены угла хвоста
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const whaleTailAnimationTick = (from, to) => (progress) => {
      this.tailAngle = from + progress * (to - from);
    };

    // таймлайн для анимации наклона хвоста
    // в качестве длительности передаем whalePeriod умноженный на разные коэфициенты (возможно, взяты из АЕ)
    const whaleTailAnimations = [
      () =>
        animateEasing(
            whaleTailAnimationTick(-20, 7),
            whalePeriod * 0.54,
            symmetricalEase
        ),
      () =>
        animateEasing(
            whaleTailAnimationTick(7, -20),
            whalePeriod * 0.46,
            symmetricalEase
        ),
    ];

    // тут видимо тоже создаем разницу фаз, о которой говорилось выше (отставание от корпуса)
    animateEasing(
        whaleTailAnimationTick(-19, -20),
        whaleSecondaryPartsPhase,
        symmetricalEase
    ).then(() => {
      // бесконечный запуск (друг за другом) анимаций наклона хвоста
      runSerialLoop(whaleTailAnimations);
    });

    // далее идут анимации шаров

    // вспомогательная функция смены положения по вертикали левого шара
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const balloonLeftYAnimationTick = (from, to) => (progress) => {
      this.balloonLeftT = from + progress * (to - from);
    };

    // значения от и до положения по вертикали левого шара
    const balloonLeftYFrom = this.balloonLeftT;
    const balloonLeftYTo = balloonLeftYFrom + 20 * wFactor;
    // стартовое значение положения для создания отставания
    const balloonLeftYStart = balloonLeftYFrom + 2 * wFactor;

    // таймлайн для анимации положения по вертикали левого шара
    // в качестве длительности передаем whalePeriod умноженный на разные коэфициенты (возможно, взяты из АЕ)
    const balloonLeftYAnimations = [
      () =>
        animateEasing(
            balloonLeftYAnimationTick(balloonLeftYFrom, balloonLeftYTo),
            whalePeriod * 0.54,
            symmetricalEase
        ),
      () =>
        animateEasing(
            balloonLeftYAnimationTick(balloonLeftYTo, balloonLeftYFrom),
            whalePeriod * 0.46,
            symmetricalEase
        ),
    ];

    // сначала создаем разницу фаз (отставание от корпуса)
    animateEasing(
        balloonLeftYAnimationTick(balloonLeftYStart, balloonLeftYFrom),
        whaleSecondaryPartsPhase,
        symmetricalEase
    ).then(() => {
      // бесконечный запуск (друг за другом) анимаций положения по вертикали левого шара
      runSerialLoop(balloonLeftYAnimations);
    });

    // вспомогательная функция смены положения по горизонтали левого шара
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const balloonLeftXAnimationTick = (from, to) => (progress) => {
      this.balloonLeftL = from + progress * (to - from);
    };

    // значения от и до положения по горизонтали левого шара
    const balloonLeftXFrom = this.balloonLeftL;
    const balloonLeftXTo = balloonLeftXFrom + 8 * wFactor;
    // стартовое значение положения для создания отставания
    const balloonLeftXStart = balloonLeftXFrom + 1 * wFactor;

    // таймлайн для анимации положения по гоизонтали левого шара
    // в качестве длительности передаем whalePeriod умноженный на разные коэфициенты (возможно, взяты из АЕ)
    const balloonLeftXAnimations = [
      () =>
        animateEasing(
            balloonLeftXAnimationTick(balloonLeftXFrom, balloonLeftXTo),
            whalePeriod * 0.54,
            symmetricalEase
        ),
      () =>
        animateEasing(
            balloonLeftXAnimationTick(balloonLeftXTo, balloonLeftXFrom),
            whalePeriod * 0.46,
            symmetricalEase
        ),
    ];

    // сначала создаем разницу фаз (отставание от корпуса)
    animateEasing(
        balloonLeftXAnimationTick(balloonLeftXStart, balloonLeftXFrom),
        whaleSecondaryPartsPhase,
        symmetricalEase
    ).then(() => {
      // бесконечный запуск (друг за другом) анимаций положения по горизонтали левого шара
      runSerialLoop(balloonLeftXAnimations);
    });

    // вспомогательная функция смены положения по вертикали правого шара
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const balloonRightYAnimationTick = (from, to) => (progress) => {
      this.balloonRightT = from + progress * (to - from);
    };

    // значения от и до положения по вертикали правого шара
    const balloonRightYFrom = this.balloonRightT;
    const balloonRightYTo = balloonRightYFrom + 20 * wFactor;
    // стартовое значение положения для создания отставания
    const balloonRightYStart = balloonRightYFrom + 2 * wFactor;

    // таймлайн для анимации положения по вертикали правого шара
    // в качестве длительности передаем whalePeriod умноженный на разные коэфициенты (возможно, взяты из АЕ)
    const balloonRightYAnimations = [
      () =>
        animateEasing(
            balloonRightYAnimationTick(balloonRightYFrom, balloonRightYTo),
            whalePeriod * 0.42,
            symmetricalEase
        ),
      () =>
        animateEasing(
            balloonRightYAnimationTick(balloonRightYTo, balloonRightYFrom),
            whalePeriod * 0.58,
            symmetricalEase
        ),
    ];

    // сначала создаем разницу фаз (отставание от корпуса)
    animateEasing(
        balloonRightYAnimationTick(balloonRightYStart, balloonRightYFrom),
        whaleSecondaryPartsPhase,
        symmetricalEase
    ).then(() => {
      // бесконечный запуск (друг за другом) анимаций положения по вертикали правого шара
      runSerialLoop(balloonRightYAnimations);
    });

    // вспомогательная функция смены положения по горизонтали правого шара
    // возвращает функцию, которая на вход принимает прогресс (значение от 0 до 1)
    const balloonRightXAnimationTick = (from, to) => (progress) => {
      this.balloonRightL = from + progress * (to - from);
    };

    // значения от и до положения по горизонтали правого шара
    const balloonRightXFrom = this.balloonRightL;
    const balloonRightXTo = balloonRightXFrom + 5 * wFactor;
    // стартовое значение положения для создания отставания
    const balloonRightXStart = balloonRightXFrom + 0.5 * wFactor;

    // таймлайн для анимации положения по горизонтали правого шара
    // в качестве длительности передаем whalePeriod умноженный на разные коэфициенты (возможно, взяты из АЕ)
    const balloonRightXAnimations = [
      () =>
        animateEasing(
            balloonRightXAnimationTick(balloonRightXFrom, balloonRightXTo),
            whalePeriod * 0.42,
            symmetricalEase
        ),
      () =>
        animateEasing(
            balloonRightXAnimationTick(balloonRightXTo, balloonRightXFrom),
            whalePeriod * 0.58,
            symmetricalEase
        ),
    ];

    // сначала создаем разницу фаз (отставание от корпуса)
    animateEasing(
        balloonRightXAnimationTick(balloonRightXStart, balloonRightXFrom),
        whaleSecondaryPartsPhase,
        symmetricalEase
    ).then(() => {
      // бесконечный запуск (друг за другом) анимаций положения по горизонтали правого шара
      runSerialLoop(balloonRightXAnimations);
    });
  }

  // метод внутри которого постоянно перерисовыается вся сцена
  // тут могут быть в принципе любые анимации которые надо перезапускать постоянно
  startAnimationInfinite() {
    // вспомогательная функция перерисовки сцены
    const globalAnimationTick = () => {
      this.drawScene();
    };

    // массив функций, в нашем случае только одна (перерисовка сцены)
    // для каждой функции вызываем функцию animateDuration, в которую передаем функцию перерисовки сцены и общую длительность
    // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
    // рассчитывается прошедшее время анимации и передается в функцию перерисовки сцены (в данном случае оно нам не нужно)
    const animations = [() => animateDuration(globalAnimationTick, 6000)];

    // в этой вспомогательной функции создается цепочка промисов, которые резолвятся по очереди
    // но у нас только одна функция, так что мы зацикливаем данный метод следующим образом:
    // после того как runSerial вернет зарезолвленный промис мы снова вызываем метод изнутри него же
    // так как у нас длительность перерисовки сцены 6 секунд, промис резолвится и метод вызывается не чаще чем 1 раз в 6 секунд
    runSerial(animations).then(this.startAnimationInfinite.bind(this));
  }

  reset() {
    this.resetWhale();
  }

  // глобальный метод запуска всех анимаций
  // зпускается из модуля Poster после анимации постера и принимает на вход его параметры
  startAnimation(options) {
    // задаем параметры постера на фоне сцены с китом
    this.posterT = options.posterT;
    this.posterL = options.posterL;
    this.posterHeight = options.posterHeight;
    this.posterWidth = options.posterWidth;

    // устанавливаем параметры луны в зависимости от параметров постера
    // непонятно почему параметры луны вообще зависят от постера, особенно ее размеры
    // радиус: высота постера делить на 8.7
    this.moonRadius = this.posterHeight / 8.7;
    // дельта сторон полумесяца: ширина постера делить на 20
    this.moonDx = this.posterWidth / 20;
    // конечная точка положения луны по горизонтали: крайняя правая точка постера + 1.2 от радиуса луны (непонятно откуда эти цифры)
    this.moonEndX =
      (this.posterL + this.posterWidth + 1.2 * this.moonRadius) / wFactor;
    // положение луны по вертикали: верхняя точка постера + одна шестая его высоты (непонятно откуда эти цифры)
    this.moonY = (this.posterT + this.posterHeight / 6) / hFactor;
    // угол вращения луны: -550 (непонятно откуда эти цифры)
    this.moonRotateAngle = -550 / wFactor;

    // прячем сцену за край экрана до первой отрисовки
    this.reset();

    // устанавливаем флаг анимации
    if (!this.isAnimated) {
      this.isAnimated = true;

      // функция для анимации всех элементов
      // на вход принимает прошедшее время анимации, которое будет расчитано внутри функции animateDuration
      const globalAnimationTick = (globalProgress) => {
        // определяем задержки для каждой анимации (скорее всего взяты из AE)
        // они же будут использованы как айдишники каждой анимации
        // сначала появляется кит
        const showWhaleAnimationDelay = 0;
        // потом облака
        const cloudsAnimationDelay = 233;
        // потом звезды и луна
        const starsAndMoonAnimationDelay = 350;
        // если прошедшее время больше чем задержка анимации кита и массив запущенных анимаций не содержит анимацию кита
        if (
          globalProgress >= showWhaleAnimationDelay &&
          this.startAnimations.indexOf(showWhaleAnimationDelay) < 0
        ) {
          //  добавляем в массив запущенных анимаций анимацию кита
          this.startAnimations.push(showWhaleAnimationDelay);

          // запускаем начальную анимацию кита
          this.animateWhaleShow();
          // запускаем фоновую анимацию кита
          this.animateWhaleInfinite();
          // запускаем бесконечные анимации (в нашем случае перерисовка сцены)
          this.startAnimationInfinite();
        }

        // если прошедшее время больше чем задержка анимации луны и массив запущенных анимаций не содержит анимацию луны
        if (
          globalProgress >= starsAndMoonAnimationDelay &&
          this.startAnimations.indexOf(starsAndMoonAnimationDelay) < 0
        ) {
          //  добавляем в массив запущенных анимаций анимацию кита
          this.startAnimations.push(starsAndMoonAnimationDelay);

          // анимация луны и звезд включается только на десктопе
          if (!this.isMobile) {
            // запускаем фоновую анимацию звезд
            this.startStarsAnimationInfinite();
            // запускаем анимацию луны
            this.animateMoon();
          }
        }
        // если прошедшее время больше чем задержка анимации облаков и массив запущенных анимаций не содержит анимацию облаков
        if (
          globalProgress >= cloudsAnimationDelay &&
          this.startAnimations.indexOf(cloudsAnimationDelay) < 0
        ) {
          //  добавляем в массив запущенных анимаций анимацию облаков
          this.startAnimations.push(cloudsAnimationDelay);
          // запускаем анимацию облаков
          this.startAnimateClouds();
        }
      };

      // вызываем функцию animateDuration, в которую передаем функцию запускающую анимации всех элементов, и общуюу длительность
      // это вспомогательная функция, вызывающая с помощью requestAnimationFrame функцию, в которой:
      // рассчитывается прошедшее время анимации и на протяжении ее длительности он передается в функцию анимации всех элементов
      // чтобы не перетасовывать анимацию внутри себя, используется вспомогательный массив, в который добавлены идентификаторы уже запущенных анимаций
      // соответственно у нас ТОЛЬКО один раз запустится функция смены параметров, внутри которой эти параметры будут меняться, а в остальные вызовы будет только отрисовка с измененными параметрами
      animateDuration(globalAnimationTick, 3900);
    }
  }
}
