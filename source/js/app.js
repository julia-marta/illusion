import "picturefill/dist/picturefill.min";
import AnimatedCart from "./modules/animated-cart";

import {
  Menu,
  Slider,
  ModalTriggers,
  TicketsSlider,
  Scrollers,
} from "./modules/page-parts";
import FullPageScroll from "./modules/full-page-scroll";

class App {
  constructor() {
    this.menu = new Menu();
    this.slider = new Slider();
    this.modalTriggers = new ModalTriggers();
    this.ticketsSlider = new TicketsSlider();
    this.scrollers = new Scrollers();

    this.fullPageScroll = new FullPageScroll(this);

    this.cart = new AnimatedCart({
      cart: `.page-header__cart`,
      currentContainer: `.swiper-slide-active`,
      ticketsBlock: `.tickets-block`,
      ticket: `.tickets-form__ticket`,
      form: `.tickets-block__form`,
      number: `.page-header__cart-number`,
    });
  }
}

const APP = new App();

window.APP = APP;
