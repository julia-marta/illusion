// класс, который принимает настройки времени анимации и делит слова на буквы
export default class AccentTypographyBuild {
  constructor(
      elementSelector,
      timer,
      classForActivate,
      property,
      delay = 0,
      timeOffsetDelta = 20
  ) {
    this.TIME_SPACE = 100;
    // селектор элемента, у которого нужно анимировать текст
    this.elementSelector = elementSelector;
    // продолжительность анимации
    this.timer = timer;
    // класс, активирующий анимацию
    this.classForActivate = classForActivate;
    // свойство, которое нужно анимировать
    this.property = property;

    // в качестве селектора можно передать класс либо сам элемент
    // в зависимости от этого определяем this.element
    if (typeof this.elementSelector === `string`) {
      this.element = document.querySelector(this.elementSelector);
    } else {
      this.element = this.elementSelector;
    }
    // изменяемое свойство, чтобы задавать разную задержку для букв
    this.timeOffset = 0;
    // шаг изменения задержки для каждой буквы (по умолчанию равен 20мс)
    this.timeOffsetDelta = timeOffsetDelta;
    // постоянная задержка (по умолчанию 0)
    this.delay = delay;

    // в конструкторе вызывается метод разбивки текста на буквы, передается дельта задержки
    this.prepareText(timeOffsetDelta);
  }

  // метод создания элемента span для каждой буквы, установка для него свойства transition и задержки
  createElement(letter, delta) {
    const span = document.createElement(`span`);

    span.textContent = letter;
    span.style.transition = this.getTransition();
    // после создания каждой буквы задержка увеличивается на переданную дельту и передается в следующую букву
    this.timeOffset += delta;

    return span;
  }

  // генератор свойства transition на основе переданных настроек анимации (свойство, продолжительность, задержка)
  getTransition() {
    return `${this.property} ${this.timer}ms ease ${this.delay + this.timeOffset}ms`;
  }

  // метод подготовки текста (разбивка по буквам)
  prepareText(delta) {
    if (!this.element) {
      return;
    }

    // разбиваем текстовое содержимое элемента на слова по пробелам (получается массив слов)
    const text = this.element.textContent.trim().split(/[\s]+/);
    const {length} = text;

    // проходимся по массиву слов
    const content = text.reduce((fragmentParent, word, index) => {
      // делаем из каждого слова массив, проходимся по массиву букв
      // для каждой буквы создаём span и всё это добавляем в фрагмент
      const wordElement = Array.from(word).reduce((fragment, letter) => {
        fragment.appendChild(this.createElement(letter, delta));
        return fragment;
      }, document.createDocumentFragment());
        // создаём для каждого слова контейнер span
      const wordContainer = document.createElement(`span`);
      // добавляем класс
      wordContainer.classList.add(`slogan__word`);
      // добавляем в контейнер фрагмент с буквами слова
      wordContainer.appendChild(wordElement);
      // добавляем контейнер в результирующий фрагмент с текстом
      fragmentParent.appendChild(wordContainer);

      // Add Space text node
      // если слово в массиве не последнее, создаём пустой текстовый узел (пробел) и добавляем после слова
      if (index < length - 1) {
        fragmentParent.appendChild(document.createTextNode(` `));
      }
      // возвращаем финальный фрагмент с текстом
      return fragmentParent;
    }, document.createDocumentFragment());

    // очищаем содержимое элемента и добавляем в него фрагмент с разбитым текстом
    this.element.innerHTML = ``;
    this.element.appendChild(content);
  }

  // метод очищения стилей анимации у уже разбитого текста
  clearStyle() {
    const spans = [...this.element.querySelectorAll(`.slogan__word span`)];

    spans.forEach((span) => {
      span.removeAttribute(`style`);
    });
  }

  // метод добавления стилей анимации к уже разбитому тексту
  addStyle(delta) {
    this.timeOffset = 0;
    delta = (typeof delta !== `number`) ? this.timeOffsetDelta : delta;

    const words = [...this.element.querySelectorAll(`.slogan__word`)];

    words.forEach((word) => {
      [...word.querySelectorAll(`span`)].forEach((span) => {
        span.style.transition = this.getTransition();
        this.timeOffset += delta;
      });
    });
  }

  // запуск анимации (добавление класса, активирующего анимацию)
  runAnimation() {
    if (!this.element) {
      return;
    }

    this.element.classList.add(this.classForActivate);
  }

  // удаление анимации (удаление класса, активирующего анимацию)
  destroyAnimation() {
    this.element.classList.remove(this.classForActivate);
  }
}
