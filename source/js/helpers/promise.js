// run promises in sequence one after another
// принимает на вход массив из функций (таймлайн)
// каждая из этих функций в итоге возвращает зарезолвленный промис
const runSerial = (tasks) => {
  // тут определяем пустой зарезолвенный промис для начала цикла
  let result = Promise.resolve();
  // перебираем массив с функциями
  tasks.forEach((task) => {
    // создаем цепочку промисов
    // каждый следующий таск выполняется только после резолва предыдущего
    result = result.then(task);
  });
  return result;
};

// run promises in sequence one after another
// then check if it's necessery to proceed if there is any checking function
// otherwise proceed anyway
// принимает на вход массив из функций (таймлайн) и опционально функцию проверки нужно ли продолжение
// возвращает промис, внутри которого вызываем runSerial
// как только все таски внутри runSerial зарезолвятся проверяем есть ли функция needProceedFunc
// если нет, снова вызываем изнутри runSerialLoop
// если да, резолвим промис и выполнение функции заканчивается
const runSerialLoop = (tasks, needProceedFunc) => {
  return new Promise((resolve) => {
    runSerial(tasks).then(() => {
      if (typeof needProceedFunc !== `function` || needProceedFunc()) {
        runSerialLoop(tasks, needProceedFunc);
        return;
      }
      resolve();
    });
  });
};

export {runSerial, runSerialLoop};
