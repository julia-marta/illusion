import AccentTypographyBuild from './accent-typography-builder';
import AnimatedNumbers from './animated-numbers';

export default class PageSwitchHandler {
  constructor(app) {
    // создаём модули, разбивающие текст, для следующих элементов:
    // заголовок Фестиваль магического искусства иллюзион на главной секции top
    // передаём элемент intro__text, продолжительность 500, активный класс accent-typography--active, свойство transform
    const introText = new AccentTypographyBuild(`.intro__text`, 500, `accent-typography--active`, `transform`);
    // заголовок Самое масштабное яркое Поражающее воображение событие года в секции about
    // передаём отдельно строки заголовка slogan__col--1, slogan__col--2, slogan__col--3, продолжительность 500, активный класс accent-typography--active, свойство transform
    const animationTopScreenTextLine1 = new AccentTypographyBuild(`.slogan__col--1`, 500, `accent-typography--active`, `transform`);
    const animationTopScreenTextLine2 = new AccentTypographyBuild(`.slogan__col--2`, 500, `accent-typography--active`, `transform`);
    const animationTopScreenTextLine3 = new AccentTypographyBuild(`.slogan__col--3`, 500, `accent-typography--active`, `transform`);
    // заголовок шоу-программа в секции show
    // передаём элемент show__title, продолжительность 500, активный класс accent-typography--active, свойство transform
    const showTitle = new AccentTypographyBuild(`.show__title`, 500, `accent-typography--active`, `transform`);
    // блоки текста Амато Джакомо и Вызов силам природы в секции show
    // передаём элементы show__text и show__text-2, продолжительность 500, активный класс accent-typography--active, свойство transform
    const showText = new AccentTypographyBuild(`.show__text`, 500, `accent-typography--active`, `transform`);
    const showText2 = new AccentTypographyBuild(`.show__text-2`, 500, `accent-typography--active`, `transform`);
    // заголовок мастер-классы в секции mc
    // передаём элемент slider__title, продолжительность 500, активный класс accent-typography--active, свойство transform
    const sliderTitle = new AccentTypographyBuild(`.slider__title`, 500, `accent-typography--active`, `transform`);
    // заголовок Карта мероприятия в секции map
    // передаём элемент map__title, продолжительность 500, активный класс accent-typography--active, свойство transform
    const mapTitle = new AccentTypographyBuild(`.map__title`, 500, `accent-typography--active`, `transform`);
    // заголовок купить билет в секции tickets
    // передаём элемент tickets-block__title, продолжительность 500, активный класс accent-typography--active, свойство transform
    const ticketsBlockTitle = new AccentTypographyBuild(`.tickets-block__title`, 500, `accent-typography--active`, `transform`);

    // создаём анимацию чисел
    const numbers = new AnimatedNumbers({
      elements: `#js-features-list .features-list__item-value`,
      duration: 800,
      durationAttenuation: 150,
      delay: 200
    });

    this.colorScheme = {
      tickets: {
        'body': `last-section`
      },
      top: {
        '.intro__title-line': `active`,
        'body': `logo-hidden`
      },
      about: {
        '.slogan__col--2': `active`
      },
      numbers: {
        '.features-list': `active`
      },
      mc: {
        '.swiper-wrapper': `active`
      }
    };

    // в схему прописываем скрипты, запускающие анимации для каждого экрана
    this.scriptRunSchema = {
      top: [
        introText.runAnimation.bind(introText),
      ],
      about: [
        animationTopScreenTextLine1.runAnimation.bind(animationTopScreenTextLine1),
        animationTopScreenTextLine2.runAnimation.bind(animationTopScreenTextLine2),
        animationTopScreenTextLine3.runAnimation.bind(animationTopScreenTextLine3),
      ],
      // биндим анимацию чисел
      numbers: [
        numbers.animate.bind(numbers)
      ],
      show: [
        // биндим анимацию постера и передаем в скрипт app
        app.poster.startAnimation.bind(app.poster, app),
        showTitle.runAnimation.bind(showTitle),
        () => {
          // анимацию блоков текста запускаем спустя 200мс после заголовков
          setTimeout(showText.runAnimation.bind(showText), 200);
          setTimeout(showText.runAnimation.bind(showText2), 200);
        }
      ],
      mc: [
        sliderTitle.runAnimation.bind(sliderTitle),
      ],
      map: [
        mapTitle.runAnimation.bind(mapTitle),
      ],
      tickets: [
        ticketsBlockTitle.runAnimation.bind(ticketsBlockTitle)
      ]
    };

    // в эту схему прописываем скрипты, удаляющие анимации для каждого экрана
    this.scriptDestroySchema = {
      top: [
        introText.destroyAnimation.bind(introText),
      ],
      about: [
        animationTopScreenTextLine1.destroyAnimation.bind(animationTopScreenTextLine1),
        animationTopScreenTextLine2.destroyAnimation.bind(animationTopScreenTextLine2),
        animationTopScreenTextLine3.destroyAnimation.bind(animationTopScreenTextLine3),
      ],
      show: [
        showTitle.destroyAnimation.bind(showTitle),
        showText.destroyAnimation.bind(showText),
        showText.destroyAnimation.bind(showText2),
      ],
      mc: [
        sliderTitle.destroyAnimation.bind(sliderTitle),
      ],
      map: [
        mapTitle.destroyAnimation.bind(mapTitle),
      ],
      tickets: [
        ticketsBlockTitle.destroyAnimation.bind(ticketsBlockTitle),
      ]
    };
    // отдельно устанавливаем анимации для слайдеров
    this.setMasterClassAccentTypography();
    this.setTicketAccentTypography();
  }

  // метод, добавляющий классы и запускающий анимации для нужного экрана (активного)
  setColorScheme(sectionId) {
    // при каждом вызове сначала перезагружаются все схемы
    this.resetScheme();

    if (this.colorScheme[sectionId]) {
      for (const schema in this.colorScheme[sectionId]) {
        if (this.colorScheme[sectionId].hasOwnProperty(schema)) {
          const position = document.querySelector(schema);

          if (position) {
            setTimeout(() => {
              position.classList.add(this.colorScheme[sectionId][schema]);
            }, 100);
          }
        }
      }
    }

    // тут мы идём в схему со скриптами, выбираем нужный экран по айди
    // если для него есть скрипты, спрэдим в массив, перебираем, запускаем каждый скрипт
    if (this.scriptRunSchema[sectionId]) {
      [...this.scriptRunSchema[sectionId]].forEach((funct) => setTimeout(() => funct(), 100));
    }
  }


  resetScheme() {
    for (const screenSchema in this.colorScheme) {
      if (this.colorScheme.hasOwnProperty(screenSchema)) {
        for (const schema in this.colorScheme[screenSchema]) {
          if (this.colorScheme[screenSchema].hasOwnProperty(schema)) {
            const position = document.querySelector(schema);

            if (position) {
              position.classList.remove(this.colorScheme[screenSchema][schema]);
            }
          }
        }
      }
    }
    // идём в схему удаления скриптов, перебираем все экраны, если для них есть скрипты, перебираем массив и вызываем каждый
    for (const destroySchema in this.scriptDestroySchema) {
      if (this.scriptDestroySchema.hasOwnProperty(destroySchema)) {
        this.scriptDestroySchema[destroySchema].forEach((funct) => funct());
      }
    }
  }

  // метод установки анимации текста на подзаголовки слайдера в разделе mc
  setMasterClassAccentTypography() {
    // ищем все подзаголовки слайдера
    // для каждого создаём модуль, разбивающий текст, продолжительность 500, активный класс accent-typography--active, свойство transform
    document.querySelectorAll(`.slider__subtitle`).forEach((title) => {
      const text = new AccentTypographyBuild(title, 500, `accent-typography--active`, `transform`);
      // слушаем событие смены экранов, удаляем анимацию и через 500мс запускаем
      document.body.addEventListener(`screenChanged`, () => {
        text.destroyAnimation();
        setTimeout(() => {
          text.runAnimation();
        }, 500);
      });
    });
  }

  // метод установки анимации текста на названия типов билетов на слайдере в разделе tickets
  setTicketAccentTypography() {
    // ищем все названия типов билетов (взрослый билет, детский билет, групповой билет), исключаем в селекторе "итого"
    // для каждого создаём модуль, разбивающий текст, продолжительность 500, активный класс accent-typography--active, свойство transform, задержка 100
    document.querySelectorAll(`.tickets-form__row .tickets-form__label span:not(.js-total):nth-child(1)`).forEach((title) => {
      const text = new AccentTypographyBuild(title, 500, `accent-typography--active`, `transform`, 100);
      // слушаем событие смены экранов, удаляем анимацию и через 500мс запускаем
      document.body.addEventListener(`screenChanged`, () => {
        text.destroyAnimation();

        setTimeout(() => {
          text.runAnimation();
        }, 500);
      });
    });
  }
}
