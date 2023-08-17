import vertexShader from "./shaders/simple-vertex-shader";
const THREE = require(`three`);

// модуль создания материала с эффектом шума
// наследует от встроенного класса THREE RawShaderMaterial для создания кастомного материала
// в него надо передать переменные uniforms, вершинный и фрагментый шейдер, где будут доступны эти переменные
class NoiseEffectMaterial extends THREE.RawShaderMaterial {
  constructor(amp, size = 2) {
    super({
      uniforms: {
        // текстура
        tDiffuse: {
          value: null,
        },
        // амплитуда
        noiseAmplitude: {
          value: amp,
        },
        // амплитуда (колебание)
        prevNoiseAmplitude: {
          value: amp,
        },
        // размер зерна
        noiseSize: {
          value: size,
        },
        // время анимации, обновляется при рендеринге
        time: {
          value: 0,
        },
        // прогресс
        transitionProgress: {
          value: 0,
        },
      },
      // простой вершинный шейдер импортируем из отдельного файла
      vertexShader,
      // Добавляем во фрагментый шейдер:
      // -объявления необходимых параметров: размера зерна noiseSize и амплитуду шума noiseAmplitude
      // - функцию генерации случайного числа rand
      // Нормализуем координаты на размер зерна и передаём в функцию rand
      // Из-за особенностей реализации шум на самом деле периодичный и в некоторых случаях паттерн слишкомзаметен.
      // Когда мы норфмировали на размер зерна, мы отсекли часть случайностей и паттерны стали заметнее.
      // Нам необходимо добавлить коэффициент к координатам, чтобы больше перемешать значения шума.
      // Добавляем коэф mixFrequency для этого и умножаем каждую нормализованную координату на него
      // Подбираем коэффициент амплитуды, который будем считать за 1 в JS (в данном случае это 0.08 * amp)
      // seed - параметр, зависящий от времени, остаток от деления времени на периодичность делится на частоту
      // каждая координата умножается на этот параметр, получается анимация шума
      // параметр amp (интенсивность) вычисляется в зависимости от колебания амплитуды шума (noiseAmplitude и prevNoiseAmplitude) и от прогресса
      fragmentShader: `
        precision mediump float;

        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float transitionProgress;
        uniform float noiseAmplitude;
        uniform float prevNoiseAmplitude;
        uniform float noiseSize;

        varying vec2 vUv;

        #define PI 3.14159265359
        #define PI_HALF 1.5707963267949

        highp float rand(const in vec2 uv) {
          return fract(sin(dot(uv.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
          vec4 texel = texture2D( tDiffuse, vUv );

          float xNormalized = floor(gl_FragCoord.x / noiseSize);
          float yNormalized = floor(gl_FragCoord.y / noiseSize);

          float amp = prevNoiseAmplitude + (noiseAmplitude - prevNoiseAmplitude) * sin(transitionProgress * PI_HALF);

          float seedPeriod = 100.0;
          float seedFrequency = 1.0 / 12.0;
          float seed = floor(mod(time, seedPeriod) / seedFrequency);
          float mixFrequency = 0.002;

          vec4 noiseColor = 0.08 * amp * vec4(rand(vec2(xNormalized * mixFrequency * seed, yNormalized * mixFrequency * seed)));

          gl_FragColor = texel + noiseColor;
        }`,
    });
  }
}

export default NoiseEffectMaterial;
