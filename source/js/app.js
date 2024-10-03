import "picturefill/dist/picturefill.min";

import {
  Menu,
  Slider,
  ModalTriggers,
  TicketsSlider,
  Scrollers,
} from "./modules/page-parts";
import FullPageScroll from "./modules/full-page-scroll";
import AnimatedCart from "./modules/animated-cart";
import Poster from "./modules/poster-canvas-animation";
import WhaleScene from "./modules/whale-canvas-animation";
import ThreeBackground from './modules/3d';

class App {
  constructor() {
    this.menu = new Menu();
    this.slider = new Slider();
    this.modalTriggers = new ModalTriggers();
    this.ticketsSlider = new TicketsSlider();
    this.scrollers = new Scrollers();

    // записываем в свойство app постер, потом из него будем вызывать метод startAnimation
    this.poster = new Poster({
      canvas: `#poster-canvas`,
      bgCanvas: `#poster-bg-canvas`,
    });
    // отрисовываем фон постера
    this.poster.drawBg();

    this.fullPageScroll = new FullPageScroll(this);

    // создаем фон Three
    this.view3d = new ThreeBackground();
    // инициализируем сцену после загрузки всех локальных сцен
    this.view3d.load().then(() => {
      this.view3d.start();
    });

    // // записываем в свойство app сцену с китом, потом из него будем вызывать метод startAnimation
    this.whaleScene = new WhaleScene({
      canvas: `#whale-canvas`,
    });

    this.cart = new AnimatedCart({
      cart: `.page-header__cart`,
      currentContainer: `.swiper-slide-active`,
      ticketsBlock: `.tickets-block`,
      ticket: `.tickets-form__ticket`,
      form: `.tickets-block__form`,
      number: `.page-header__cart-number`,
    });

    // добавляем обработчики
    this.initEventListeners();
  }

  // метод добавления обработчика на ресайз окна
  // в обработчике вызываем методы обновления размеров для адаптивности анимаций
  // заново отрисовываем анимации
  initEventListeners() {
    window.addEventListener(`resize`, () => {
      this.poster.updateSize();
      this.whaleScene.updateSceneSizing();

      this.poster.drawBg();
      this.poster.draw();
      this.whaleScene.drawScene();
    });
  }
}

const APP = new App();

window.APP = APP;
