import * as scrollSpy from 'simple-scrollspy/dist/simple-scrollspy.min';
import AccentTypographyBuild from './accent-typography-builder';

import Swiper from 'swiper';


class Menu {
  constructor() {
    this.header = document.querySelector(`.js-header`);
    this.menu = document.querySelector(`.js-menu`);
    this.menuToggler = document.querySelector(`.js-menu-toggler`);
    this.menuOverlay = document.querySelector(`.js-overlay`);
    this.menuLinks = [...document.querySelectorAll(`.js-menu-link`)];

    this.vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty(`--vh`, `${this.vh}px`);

    scrollSpy(`#menu`, {
      sectionClass: `.js-scrollspy`,
      menuActiveTarget: `.js-menu-link`,
      offset: 100
    });

    // SPLIT TEXT
    // подготовка текста ссылок меню для побуквенной анимации
    const prepareLinksText = (root, selector) => {
      // в корневом элементе ищем по селектору все дочерние, спрэдим в массив и перебираем
      return [...root.querySelectorAll(selector)].map((el) => {
        // создаём экземпляр класса, разбивающего текст, передаём в него:
        // - элемент
        // - продолжительность анимации (300)
        // - класс активации (null, он тут не нужен, анимация уже прописана в main-menu.scss для slogan__word)
        // - свойство анимации (transform)
        const accentObject = new AccentTypographyBuild(el, 300, null, `transform`);
        // очищаем стили (при создании класса они передаются в тч чтобы потом их динамично добавлять через метод addStyle)
        accentObject.clearStyle();
        // возвращаем класс
        return accentObject;
      });
    };
    // получаем массив из классов для каждой ссылки меню, разбитой на буквы
    this.accentLinkTextObjects = prepareLinksText(this.menu, `.main-menu__link-text`);

    this.initEventListeners();
  }


  initEventListeners() {
    window.addEventListener(`resize`, () => {
      this.vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty(`--vh`, `${this.vh}px`);
    });

    if (this.menuToggler) {
      this.menuToggler.addEventListener(`click`, () => {
        if (this.menu.classList.contains(`main-menu--opened`)) {
          this.header.classList.remove(`page-header--menu-opened`);
          this.menu.classList.remove(`main-menu--active`);
          this.menu.classList.remove(`main-menu--opened-in`);
          this.menu.classList.add(`main-menu--opened-out`);
          // когда меню закрывается, очищаем стили анимации для ссылок
          this.accentLinkTextObjects.forEach((accentObject) => {
            accentObject.clearStyle();
          });
          setTimeout(() => {
            this.menu.classList.remove(`main-menu--opened`);
            this.menu.classList.remove(`main-menu--opened-out`);
          }, 350);
        } else {
          this.menu.classList.add(`main-menu--opened`);
          this.menu.classList.add(`main-menu--opened-in`);
          this.menu.classList.remove(`main-menu--opened-out`);
          this.header.classList.add(`page-header--menu-opened`);

          setTimeout(() => {
            // когда меню открывается, добавляем стили анимации
            this.accentLinkTextObjects.forEach((accentObject) => {
              accentObject.addStyle();
            });
            this.menu.classList.add(`main-menu--active`);
          }, 100);
        }
      });

      document.addEventListener(`keyup`, (evt) => {
        if (evt.key === `Escape`) {
          this.menu.classList.remove(`main-menu--opened`);
          this.header.classList.remove(`page-header--menu-opened`);
        }
      });

      this.menuOverlay.addEventListener(`click`, () => {
        this.menu.classList.remove(`main-menu--opened`);
        this.header.classList.remove(`page-header--menu-opened`);
      });
    }

    for (let i = 0; i < this.menuLinks.length; i++) {
      this.menuLinks[i].addEventListener(`click`, () => {
        if (this.menu.classList.contains(`main-menu--opened`)) {
          this.menu.classList.remove(`main-menu--opened`);
          this.header.classList.remove(`page-header--menu-opened`);
        }
      });
    }
  }
}


class Slider {
  constructor() {
    // eslint-disable-next-line no-new
    new Swiper(`.js-slider`, {
      loop: true,
      navigation: {
        nextEl: `.slider__control--next`,
        prevEl: `.slider__control--prev`,
      },
      pagination: {
        el: `.swiper-pagination`,
        type: `fraction`,
      },
      observer: true,
      observeParents: true,
      on: {
        slideChange() {
          const event = new CustomEvent(`slideChanged`, {
            detail: {
              'slideId': (this.activeIndex + 2) % 3
            }
          });

          document.body.dispatchEvent(event);
        }
      },
    });
  }
}


class ModalTriggers {
  constructor() {
    this.modalTriggers = document.querySelectorAll(`.js-modal-trigger`);

    this.initEventListeners();
  }


  initEventListeners() {
    if (this.modalTriggers.length) {
      const modals = document.querySelectorAll(`.js-modal`);

      for (let i = 0; i < this.modalTriggers.length; i++) {
        this.modalTriggers[i].addEventListener(`click`, (evt) => {
          evt.preventDefault();

          Array.from(this.modalTriggers).forEach((el) => {
            el.classList.remove(`map__event--active`);
          });

          if (evt.currentTarget.classList.contains(`map__event`)) {
            evt.currentTarget.classList.add(`map__event--active`);
          }

          const target = evt.currentTarget.getAttribute(`data-target`);

          if (modals.length) {
            Array.from(modals).forEach((modalEl) => {
              const identifyer = modalEl.getAttribute(`id`);

              if (!(identifyer === target) && modalEl.classList.contains(`modal--show`)) {
                modalEl.classList.remove(`modal--show`);
                document.querySelector(`body`).classList.remove(`modal-opened`);
              } else if (identifyer === target) {
                modalEl.classList.add(`modal--show`);
                document.querySelector(`body`).classList.add(`modal-opened`);
              }
            });
          }
        });
      }

      const overlays = document.querySelectorAll(`.modal__overlay`);

      Array.from(overlays).forEach((element) => {
        element.addEventListener(`click`, () => {
          element.parentNode.classList.remove(`modal--show`);
          document.querySelector(`body`).classList.remove(`modal-opened`);

          Array.from(this.modalTriggers).forEach((el) => {
            el.classList.remove(`map__event--active`);
          });
        });
      });

      const closeEls = document.querySelectorAll(`.js-modal-close`);

      Array.from(closeEls).forEach((element) => {
        element.addEventListener(`click`, () => {
          const targetId = element.getAttribute(`data-target`);

          document.getElementById(targetId).classList.remove(`modal--show`);
          document.querySelector(`body`).classList.remove(`modal-opened`);

          Array.from(this.modalTriggers).forEach((el) => {
            el.classList.remove(`map__event--active`);
          });
        });
      });
    }
  }
}


class TicketsSlider {
  constructor() {
    this.ticketsSlider = new Swiper(`.js-tickets-slider`, {
      speed: 500,
      navigation: {
        nextEl: `.tickets-block__control--next`,
        prevEl: `.tickets-block__control--prev`,
      },
    });

    this.datePickers = document.querySelectorAll(`.js-date-picker`);
    this.pickerBtn = document.querySelector(`.js-pick`);
    this.counters = document.querySelectorAll(`.js-counter`);
    this.numberFields = document.querySelectorAll(`input[type="number"]`);

    this.initEventListeners();
  }


  initEventListeners() {
    for (let i = 0; i < this.datePickers.length; i++) {
      this.datePickers[i].addEventListener(`click`, (evt) => {
        Array.from(this.datePickers).forEach((el) => {
          el.classList.remove(`tickets-block__button--chosen`);
        });

        evt.currentTarget.classList.add(`tickets-block__button--chosen`);
        this.pickerBtn.removeAttribute(`disabled`);

        const targetNum = parseInt(evt.currentTarget.getAttribute(`data-number`), 10);

        this.ticketsSlider.update();
        this.ticketsSlider.slideTo(targetNum);
      });
    }

    this.pickerBtn.addEventListener(`click`, () => {
      document.querySelector(`.js-tickets-block`).classList.add(`tickets-block--form-opened`);
    });

    for (let i = 0; i < this.counters.length; i++) {
      this.counters[i].addEventListener(`click`, (evt) => {
        const field = evt.currentTarget.parentNode.querySelector(`input`);

        if (evt.currentTarget.classList.contains(`js-increase`)) {
          field.value = parseInt(field.value, 10) + 1;
          evt.currentTarget.parentNode.querySelector(`.js-decrease`).removeAttribute(`disabled`);
        } else if (evt.currentTarget.classList.contains(`js-decrease`) && field.value === 1) {
          field.value = Math.max(parseInt(field.value, 10) - 1, 0);
          evt.currentTarget.setAttribute(`disabled`, true);
        } else {
          field.value = Math.max(parseInt(field.value, 10) - 1, 0);
        }

        const fields = evt.currentTarget.closest(`.tickets-form`).querySelectorAll(`input`);
        const total = Array.from(fields).reduce((sum, current) => {
          current = parseInt(current.value, 10) * parseInt(current.getAttribute(`data-sum`), 10);
          return sum + current;
        }, 0);

        const sumEl = evt.currentTarget.closest(`.tickets-form`).querySelector(`.js-total`);
        sumEl.innerText = total;

        if (total > 0) {
          evt.currentTarget.closest(`.tickets-form`).querySelector(`.js-total-row`).classList.remove(`tickets-form__row--disabled`);
        } else {
          evt.currentTarget.closest(`.tickets-form`).querySelector(`.js-total-row`).classList.add(`tickets-form__row--disabled`);
        }
      });
    }

    for (let i = 0; i < this.numberFields.length; i++) {
      this.numberFields[i].addEventListener(`keydown`, (evt) => {
        if (!((evt.key >= `0` && event.key <= `9`) || evt.key === `Backspace`)) {
          event.preventDefault();
        }

        if (event.key === `Backspace` && evt.currentTarget.value.length < 2) {
          event.preventDefault();
          evt.currentTarget.value = 0;
        }
      });

      this.numberFields[i].addEventListener(`input`, (evt) => {
        if (evt.currentTarget.value.indexOf(`0`) === 0 && evt.currentTarget.value.length > 1) {
          evt.currentTarget.value = evt.currentTarget.value.slice(1);
        }
      });
    }
  }
}

class Scrollers {
  constructor() {
    this.map = document.getElementById(`map`);
    // js-map-scroller - стрелки для навигации по карте
    this.scrollers = document.querySelectorAll(`.js-map-scroller`);

    this.reverseNames = {
      touchstart: `touchend`,
      mousedown: `mouseup`
    };
    // дельты скролла: разница между видимой областью и областью с учетом прокрутки
    const scrollDeltaX = this.map.scrollWidth - this.map.clientWidth;
    // устанавливаем карте ширину прокрученной части в ремах
    this.map.scrollLeft = scrollDeltaX / 10;
    const scrollDeltaY = this.map.scrollHeight - this.map.clientHeight;
    // если есть прокрутка по вертикали, делаем стрелки вверх/вниз видимыми
    if (scrollDeltaY > 0) {
      document.querySelector(`.screen__scroller--up`).classList.remove(`screen__scroller--hidden`);
      document.querySelector(`.screen__scroller--down`).classList.remove(`screen__scroller--hidden`);
      // устанавливаем карте высоту прокрученной части в ремах
      this.map.scrollTop = scrollDeltaY / 10;
    }
    // устанавливаем обработчики
    this.initEventListeners();
  }

  initEventListeners() {
    // перебираем скроллеры (стрелки навигации)
    for (let i = 0; i < this.scrollers.length; i++) {
      // добавляем в массив события начала тача/касания мышкой
      `touchstart,mousedown`.split(`,`).forEach((name) => {
        // каждому скроллеру навешиваем обработчик для каждого из этих событий
        this.scrollers[i].addEventListener(name, (evt) => {
          // текущее время в миллисекундах 1970 (аналог new Date().getTime(), полученный с помощью унарного плюса)
          let time = +new Date();
          // устанавливаем флаг "мышь нажата"
          let mouseDowned = true;
          let upFn;
          // на окно навешиваем обработчик противоположных событий конца тача/отпускания мыши
          window.addEventListener(this.reverseNames[name], upFn = () => {
            // внутри удаляем этот обработчик и выключаем флаг "мышь нажата"
            window.removeEventListener(this.reverseNames[name], upFn);
            mouseDowned = false;
          });
          // получаем направление скроллера из его дата атрибута
          const direction = evt.currentTarget.getAttribute(`data-direction`);
          // функция покадровой анимации скролла
          const ticker = () => {
            // текущее время в миллисекундах
            const currentTime = +new Date();
            // дельта времени с момента старта нажатия на скроллер, в секундах
            let dt = (currentTime - time) / 1000;
            // обновляем время старта
            time = currentTime;
            // дельта не должна быть более 0.5
            if (dt > 0.5) {
              dt = 0.5;
            }
            // в зависимости от направления скроллера к значения уже прокрученных частей по вертикали или горизонтали прибавляем или вычитаем дельту, умноженную на 300 (шаг скролла)
            // получаем новое положение прокрученной карты
            switch (direction) {
              case `up`: {
                this.map.scrollTop -= dt * 300;
                break;
              }
              case `down`: {
                this.map.scrollTop += dt * 300;
                break;
              }
              case `left`: {
                this.map.scrollLeft -= dt * 300;
                break;
              }
              case `right`: {
                this.map.scrollLeft += dt * 300;
                break;
              }
            }
            // запускаем анимацию непрерывно, пока мышь нажата
            if (mouseDowned) {
              requestAnimationFrame(ticker);
            }
          };
          // первый запуск анимации
          ticker();
        });
      });
    }
  }
}

export {
  Menu,
  Slider,
  ModalTriggers,
  TicketsSlider,
  Scrollers
};
