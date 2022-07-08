// класс, выполняющий анимацию корзины
export default class AnimatedCart {
  constructor(options) {
    // объект с опциями
    this.options = options;

    // элемент корзины page-header__cart
    this.cart = document.querySelector(options.cart);
    // иконка с билетами tickets-form__ticket у кнопки "купить" (не видна по умолчанию)
    this.ticket = document.querySelector(options.ticket);
    // форма для покупки билетов tickets-block__form
    this.form = document.querySelector(options.form);
    // блок tickets-block на экране tickets
    this.ticketsBlock = document.querySelector(options.ticketsBlock);
    // все инпуты формы для покупки билетов
    this.inputs = this.form.querySelectorAll(`input`);
    // число внутри корзины page-header__cart-number
    this.number = this.cart.querySelector(options.number);
    // текущая дата/слайд, для которой открыта форма покупки билетов swiper-slide-active
    this.currentContainer = this.ticketsBlock.querySelector(
        options.currentContainer
    );

    // инициализируем слушатель для формы покупки билетов
    this.initEventListeners();
  }

  // вешаем на форму слушатель сабмита, внутри которого вызывается метод this.animate()
  initEventListeners() {
    this.form.addEventListener(`submit`, (e) => {
      e.preventDefault();

      this.animate();
    });
  }

  animate() {
    // собираем массив из инпутов формы, проходим по нему, берём у каждого value, парсим в число и возвращаем сумму
    const total = Array.from(this.inputs).reduce((sum, current) => {
      return sum + parseInt(current.value, 10);
    }, 0);
    // вычисляем точки X Y для движения билета в корзину
    this.calculateDeltas();

    // убираем класс animate у иконки билета
    this.ticket.classList.remove(`animate`);
    // конструкция, видимо, нужна просто чтобы разграничить противоположные по смыслу действия, типа паузы
    void this.ticket.offsetWidth;
    // добавляем класс animate у иконки билета
    this.ticket.classList.add(`animate`);
    // дальше происходит перемещение билета в корзину по вычисленным выше точкам

    setTimeout(() => {
      // если у корзины есть класс updated убираем
      // берём число внутри корзины и занимаем в него цифру на вычисленный ранее тотал
      // добавляем класс updated
      if (this.cart.classList.contains(`updated`)) {
        this.cart.classList.remove(`updated`);

        setTimeout(() => {
          this.number.innerHTML = total;
          this.cart.classList.add(`updated`);
        }, 300);
      } else {
        this.number.innerHTML = total;
        this.cart.classList.add(`updated`);
      }
    }, 800);
  }

  // метод вычисления точек X и Y для анимации движения билета в корзину
  calculateDeltas() {
    // слайд с датой, для которой открыта форма покупки билетов swiper-slide-active (ищем его зачем-то повторно тут после конструктора)
    this.currentContainer = this.ticketsBlock.querySelector(
        this.options.currentContainer
    );
    // иконка с билетами внутри текущей формы-слайда
    this.ticket = this.currentContainer.querySelector(this.options.ticket);

    // получаем все размеры элемента
    const ticketCR = this.ticket.getBoundingClientRect();
    // деструктурируем разные параметры
    const {
      width: ticketWidth,
      height: ticketHeight,
      left: ticketX,
      top: ticketY,
    } = ticketCR;
    // получаем все размеры иконки корзины
    const cartCR = this.cart.getBoundingClientRect();
    // деструктурируем разные параметры
    const {
      width: cartWidth,
      height: cartHeight,
      left: cartX,
      top: cartY,
    } = cartCR;

    // тут получаем точки X и Y ОТНОСИТЕЛЬНО ОКНА БРАУЗЕРА, по которым будет двигаться иконка с билетами
    // X: вычитаем из положения корзины по X положение тикета по X, добавляем ширину корзины / 2 и вычитаем ширину тикета / 2
    const cartDeltaX = cartX - ticketX + cartWidth / 2 - ticketWidth / 2;
    // Y: вычитаем из положения корзины по Y положение тикета по Y, добавляем высоту корзины / 2 и вычитаем высоту тикета / 2
    const cartDeltaY = cartY - ticketY + cartHeight / 2 - ticketHeight / 2;
    console.log(cartDeltaX);
    console.log(cartDeltaY);
    // устанавливаем эти дельты в качестве переменных CSS
    document.documentElement.style.setProperty(
        `--cartDeltaX`,
        cartDeltaX + `px`
    );
    document.documentElement.style.setProperty(
        `--cartDeltaY`,
        cartDeltaY + `px`
    );
  }
}
