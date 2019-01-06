# Предложение по архитектуре блоков контента

Под блоками контента подразумеваются любые блоки (теги), используемые сейчас в разметке слайдов уроков, включая как сами упражнения так и технические компоненты стилизации/статичные компоненты.


TODO
- прописать базово апи синхронизации/скоринга
- прописать базово формат конфига (общего и индивидуального) и работу с ним
- прописать базово формат компонента-контейнера и работу с ним
- работа с мобильным режимом с возможностью переключения на лету
- коммон функционал по типу указки/автарок/звуков, что из этого коммон а что выносить наружу
- добавить пример упражнения со сложной моделью (а ля днд, без перетаскиваний с подобной логикой)
- отдельными разделами рефакторинг моделей, синк и скор стратегий (понадобится помощь)
- резет упражнений (состояние, скоринг)
- проверить скоринг на множестве упражнений
- мерж локального конфига элемента и группового, только локальный конфиг
- разобрать текущие форматы id упражнений и хранимых в ворбуке данных, продумать/написать конвертер из общего формата в легаси
- групповые уроки и переключение данных по ученикам
- включение/отключение синка (рилтайм и стор частей)
- включение/отключение скоринга


## Текущие проблемы

- дичайшая связность самих блокови их синхронизации/скоринга с вимбоксом
- невозможность быстро и просто прототипировать и разрабатывать блоки вне вимбокса
- невозможность использования вне вимбокса
- отсутствие адекватной архитектуры и стандартов разработки блоков
- устаревшее апи синхронизации/скоринга, на котором завязываются многие блоки
- много легаси в формате данных синхронизации и работе скоринга, которое не локализовано, а размазано по сервисам/стратегиям
- разрастание числа блоков (в уроках используется несколько, но скачивается код для всех)
- невозможность разработки блоков (кроме содержимого iframe'ов) не командой вимбокса, вне вимбокса и без знания архитектуры вимбокса и его легаси частей
- высокая сложность в дальнейшем создания визуального редактора блоков (из-за связности с вимбоксом, логики рендера блоков)
- низкая скорость разработки (как следствие части вышеперечисленного)


## Чего далее нет

- рефакторинга вьюшек блоков (например вынос общего кода у дндшек)


## Конечный результат

TODO

Описанное далее является сферически конём в вакууме, не все пункты обязательны к реализации/будут реализованы, примерный план постепенного перехода к основному описан [ниже](#План-перехода).

Блок контента
- представляет собой независимый [custom element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) (несколько элементов)
- реализует минимально необходимый для работы функционал
- работает независимо от наличия чего-либо другого на странице (без конфига/синхронизации/скоринга/...)
- получает необходимые параметры и конфигурацию из инпутов и (опционально) компонент-контейнер
- общается с внешним миром через CustomEvents и/или ExerciseService (описано ниже)
- в случае использования параметров конфигурации (общие, точечные под компонент)
  - умеет получать из компонента-контейнера
  - умеет получать через инпуты
  - реагирует на изменение
  - может работать без этих параметров/их части (не падает с ошибкой, работает или выдаёт предупреждение что они обязательны)
- для работы с синхронизацией/скорингом
  - использует минимальное, нижеописанное API через ExerciseService
  - может работать при их отсутствии или если они отключены (не падает с ошибкой, работает или выдаёт предупреждение что они обязательны)
- насколько возможно, ничего не знает о других блоках (кроме общеиспользуемых), взаимодействует с нек-ми из них через чётко прописанное API
- разделяет основную логику блока и вьюшку на разные компоненты (`smth.ts` и `smth-view.ts` e.x.)

Блоки собираются в отдельный бандл, грузятся лениво (можно сделать предзагрузку по известному списку) и регистрируются как кастом элементы.


#### Inputs

Обычные инпуты, у всех всегда тип `string` т.к. передаются через html аттрибуты. Если нужно передать объект, то пропускаем через `JSON.stringify()`.


#### Outputs/events

Используем браузерный [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) с уникальным именем, привязанным к данному блоку
- `bubbles: false` (по умолчанию) если событие должно слушаться только на самом блоке (является Output'ом компонента)
- `bubbles: true` если событие может слушаться кем угодно на странице и должно ловиться на `window` объекте


#### Использование в разметке
(произвольный проект на произвольном фреймворке/нативе)

```html
<sky-block-group config="JSON.stringify({ ... })">
  <vim-select></vim-select>

  <vim-teacher-notes>
    <vim-input></vim-input>
  </vim-teacher-notes>
</sky-block-group>
```
без настроек/синхронизаций и всего такого
```html
<vim-select></vim-select>

<vim-teacher-notes>
  <vim-input></vim-input>
</vim-teacher-notes>
```


#### Синхронизация

Если включена в конфиге, то шлются глобальные события для синхронизации, там же слушаются события восстановления данных.  
Для получения начальных данных (если они уже были загружены например) шлётся событие-запрос и ловится ответ через общее с изменением данных событие.

Для работы синхронизации вимбокса на сторонних проектах (если будет такая необходимость) можно будет выделить синхронизацию из вимбокса с её апи/пушером в отдельный виджет, который использовать и в вимбоксе и в соответствующих проектах.

Все сложности, завязки на комнатах/студентах и подобном выносятся в модуль синхронизации проекта, которому эта синхронизация нужна (вимбокс например). Основной код блоков контента от этого максимально абстрагирован и знает только о возможном существовании синхронизации и апи взаимодействия с ней с использованием минимально возможного набора параметров.

Блок работает с синхронизацией через [ExerciseService](#ExerciseService)

TODO: API


##### Формат хранения ответов упражнений

```ts
interface IBlockAnswer<T> {
  value: T;
  createdAt: number;
  isCorrect: boolean;
}

interface ISyncData {
  [ stepRevId_blockId: string ]: IBlockAnswer[];
}
```


#### Скоринг

Если включен в конфиге, то шлём глобальные события на которые кто-нибудь может подписаться.

Всё остальное выносится в модуль скоринга того проекта, которому скоринг нужен. Взаимодействие между ним и блоками идёт асинхронно через глобальные события.

Блок работает со скорингом через [ExerciseService](#ExerciseService)

TODO: API


#### BlockService

Предоставляет общеиспользуемый функционал для блоков (объединяет текущие ExerciseService и ExerciseFactory)
- регистрацию моделей (?) для работы стороннего функционала (например озвучки действий в блоках)
- createBlockApi метод возвращающий инстанс BlockApi для работы с синхронизацией и скорингом

TODO: API


#### Взаимодействие с другими блоками

В идеале блок ничего не знает и не хочет знать о других блоках на странице. В случае же явной необходимости используется несколько стандартизированных подходов
- отправка/прослушка глобальных событий
- получение инстанса компонента-родителя (конкретного или реализующего определённый интерфейс, например Visibility) через аналог инжектов по некоторому токену и прямой вызов его методов


#### Процесс разработки

Разработка каждого блока, включая обшие, ведётся в `libs/blocks` либе в рамках соответствущей стори сторибука, т.е. независимо от основной платформы. В стори используются специальные компоненты для работы с параметрами внешнего окружения блока (смена параметров конфига, просмотр улетающих из блока событий, отправка событий для блока). Накидывается несколько кейсов под разные варианты использования блока, проверяется в разных конфигурациях.  
По окончанию разработки блок должен сходу заработать в рамках платформы (кроме случаев изменения в архитектуре блоков/конфигах), если это не так то допиливается недостающее в окружении сторибука.  
Тестирование блока проводится и в рамках сторибука и в рамках основной платформы (как минимум до момента когда мы сможем доверять разработанному в рамках сторибука, т.е. не будет багов вылезающих только в рамках использрвания в платформе).


## Решение проблем

TODO


## План перехода

TODO


## Обсудить

TODO

- критичность открытости апи для третьего лица (возможность отправки события из консоли, по идее не критично т.к. всегда можно получить доступ ко всем сервисам и вызвать у них соответствующие методы/посмотреть дебаггером что там происходит)


## Известные проблемы

- ~~использованию блоков как CustomElements мешают проблемы с content projection у вложенных элементов в плане получения text/html content прокинутого в чайлд компоненты. Частично решается использованием `ViewEncapsulation.ShadowDom` и `<slot (slotchange)></slot>` вместо `<ng-content></ng-content>`, но требует проверки работоспособности в IE11 с полифилами (shaddydom/shaddycss).  
  Так же необходимо дополнительное исследование на тему получения HTML содержимого слотов или templateRef для переноса значений в произвольное место.~~  
  Получилось завести с `ng-content` и таймаутом в OnInit (содержимое `ng-content` заполняется несколько странно по таймингу)
- на данный момент созданные через `@angular/elements` кастом элементы не прокидывают по дефолту паблик методы в инстанс созданого кастом элемента. Требуется использование хака с прописыванием `@Input` декторатора для методов, которые должны быть доступны публично (https://github.com/angular/angular/issues/22114)


## Приложения

#### Мелочи

- работа с глобальными событиями идёт через методы-хэлперы, скрывающие конкретную реализацию этого взаимодействия (использование CustomEvent). Подписка реализуется через хэлпер, возвращающий Observable  (TODO: стакблиц с примером)
- для custom elements получение инстансов компонентов-родителей реализуется через метод-хэлпер по некоторому токену (видимо строковому). У соответствующего компонента-родителя через другой метод-хэлпер по такому же токену проставляется уникальное поле, которое метод-геттер и ищет среди родителей текущего компонента (TODO: стакблиц с примером)


#### Текущий формат хранения данных в workbook по упражнениям

<details>
<summary>развернуть</summary>
<p>

- input
```ts
{
  // m842877I11
  "canvas.m842877I11": {
    isKeyUsed: false,
    isTyping: false,
    value: "arrived"
  },
  "canvas.m842877I11:fails": {
    arrivee: { createdAt: 1546627492497 },
    arriveer: { createdAt: 1546627494039 },
    arriveert: { createdAt: 1546627495011 },
    arriveerty: { createdAt: 1546627496380 },
    arriveertyu: { createdAt: 1546627497446 },
    arriveertyui: { createdAt: 1546627498335 },
    arriveertyuio: { createdAt: 1546627499242 }
  },
  "canvas.m842877I11:successes": {
    arrived: { createdAt: 1546627501498 }
  },
  // m842877I12
  "canvas.m842877I12": {
    isKeyUsed: false,
    isTyping: false,
    value: "satt"
  },
  "canvas.m842877I12:fails": {
    sat: { createdAt: 1546627505095 },
    have sat: { createdAt: 1546627514791 },
    satt: { createdAt: 1546627534970 }
  },
  "canvas.m842877I6": {
    isKeyUsed: true,
    isTyping: false,
    value: "were sitting"
  },
  "canvas.m842877I6:successes": {
    were sitting: { createdAt: 1546627536688 }
  }
}
```
- select
```ts
{
  // m842877S1
  "canvas.m842877S1": 1,
  "canvas.m842877S1:successes": {
    1: { createdAt: 1546627930580 }
  },
  // m842877S2
  "canvas.m842877S2": 1,
  "canvas.m842877S2:successes": {
    1: { createdAt: 1546627932894 }
  },
  // m842877S3
  "canvas.m842877S3": 2,
  "canvas.m842877S3:fails": {
    1: { createdAt: 1546627934617 }
  },
  "canvas.m842877S3:successes": {
    2: { createdAt: 1546627936851 }
  }
}
```
- test
```ts
{
  // m842878T1
  "canvas.m842878T1": [ 2 ],
  "canvas.m842878T1:fails": {

    1: { createdAt: 1546628203303 }
  },
  "canvas.m842878T1:successes": {

    2: { createdAt: 1546628204564 }
  },
  // m842878T2
  "canvas.m842878T2": [ 0 ],
  "canvas.m842878T2:successes": {

    0: { createdAt: 1546628206191 }
  },
  // m842878T3
  "canvas.m842878T3": [ 1 ],
  "canvas.m842878T3:fails": {
    0: { createdAt: 1546628207957 },
    2: { createdAt: 1546628210770 }
  },
  "canvas.m842878T3:successes": {
    1: { createdAt: 1546628211886 }
  }
}
```
- strike-out
```ts
{
  // m842879SO3
  "canvas.m842879SO3": "d1987076",
  "canvas.m842879SO3:successes": {
    "d1987076": { createdAt: 1546628384631 }
  },
  // m842879SO6
  "canvas.m842879SO6": "6bd3536a",
  "canvas.m842879SO6:fails": {
    "f7369cec": { createdAt: 1546628393325 },
    "7674aede": { createdAt: 1546628394787 }
  },
  "canvas.m842879SO6:successes": {
    "6bd3536a": { createdAt: 1546628395799 }
  },
  // m842879SO9
  "canvas.m842879SO9": "83795b80",
  "canvas.m842879SO9:fails": {
    "83795b80": { createdAt: 1546628399619 }
  }
}
```
- groups
```ts
{
  // m842879G20
  "canvas.m842879G20": {
    items: [ "36fee817","f9352a3c","23c7562a","6dce2ad8","f37373b3","f9352a3c","23c7562a","1acae687","895df855","8734e925","f9352a3c","23c7562a","1acae687" ]
  },
  "canvas.m842879G20:fails": {
    "f9352a3c": { createdAt: 1546628522888 },
    "23c7562a": { createdAt: 1546628524056 },
    "1acae687": { createdAt: 1546628518418 }
  },
  "canvas.m842879G20:successes": {
    "6dce2ad8": { createdAt: 1546628513029 },
    "895df855": { createdAt: 1546628519739 },
    "1acae687": { createdAt: 1546628525676 }
  }
}
```
- dnd-group
```ts
{
  // m842880DC
  "canvas.m842880DC1_export": [ "7eabb367","bb7a7f5d","9bfc40b8" ],
  "canvas.m842880DC4_export:successes": [
    { createdAt: 1546628862076, groupId: "877410b7" }
  ],
  "canvas.m842880DC3_export:successes": [
    { createdAt: 1546628863753, groupId: "877410b7" }
  ],
  "canvas.m842880DC5_export:fails": [
    { createdAt: 1546628865177, groupId: "877410b7" }
  ],
  "canvas.m842880DC6_export:fails": [
    { createdAt: 1546628866863, groupId: "877410b7" }
  ],
  "canvas.m842880DC2_export": [ "99f8ee0c" ],
  "canvas.m842880DC6_export:successes": [
    { createdAt: 1546628869179, groupId: "0551a28f" }
  ],
  "canvas.m842880DC1_export": [ "7eabb367","bb7a7f5d" ],
  "canvas.m842880DC2_export": [ "99f8ee0c","9bfc40b8" ],
  "canvas.m842880DC5_export:successes": [
    { createdAt: 1546628870741, groupId: "0551a28f" }
  ]
}
```
- dnd-text
```ts
{
  // m842881D
  "canvas.m842881D1_export": "94196435",
  "canvas.m842881D1_export:fails": {
    "0256cbb0": { createdAt: 1546629145120 }
  },
  "canvas.m842881D2_export": "0256cbb0",
  "canvas.m842881D2_export:successes": {
    "0256cbb0": { createdAt: 1546629147047 }
  },
  "canvas.m842881D1_export:successes": {
    "94196435": { createdAt: 1546629149246 }
  },
  "canvas.m842881D3_export": "908907fa",
  "canvas.m842881D3_export:successes": {
    "908907fa": { createdAt: 1546629151195 }
  },
  "canvas.m842881D4_export": "7e2d80b6",
  "canvas.m842881D4_export:successes": {
    "7e2d80b6": { createdAt: 1546629152962 }
  }
}
```
- dnd-image-set
```ts
{
  // m851881DWIs
  "canvas.m851881DWI3_export": "05778f99",
  "canvas.m851881DWI3_export:fails":{
    "09f828c6": { createdAt: 1546629325321 },
    "2b9d4739": { createdAt: 1546629329037 }
  },
  "canvas.m851881DWI2_export": "2b9d4739",
  "canvas.m851881DWI2_export:fails":{
    "09f828c6": { createdAt: 1546629326475 }
  },
  "canvas.m851881DWI1_export": "09f828c6",
  "canvas.m851881DWI1_export:successes":{
    "09f828c6": { createdAt: 1546629327642 }
  },
  "canvas.m851881DWI2_export:successes":{
    "2b9d4739": { createdAt: 1546629332673 }
  },
  "canvas.m851881DWI3_export:successes":{
    "05778f99": { createdAt: 1546629334315 }
  },
  "canvas.m851881DWI4_export": "8da2df71",
  "canvas.m851881DWI4_export:successes":{
    "8da2df71": { createdAt: 1546629336074 }
  },
}
```
- dnd-image
```ts
{
  // m856578WI
  "canvas.m856578WI1_export": "e7ffeec7",
  "canvas.m856578WI1_export:successes":
    { "e7ffeec7": { createdAt: 1546629579604 }
  },
  "canvas.m856578WI3_export": "777db5d6",
  "canvas.m856578WI3_export:fails":
    { "811b0c14": { createdAt: 1546629581312 }
  },
  "canvas.m856578WI2_export": "811b0c14",
  "canvas.m856578WI2_export:successes":
    { "811b0c14": { createdAt: 1546629582656 }
  },
  "canvas.m856578WI4_export": "",
  "canvas.m856578WI4_export:fails":
    { "777db5d6": { createdAt: 1546629584152 }
  },
  "canvas.m856578WI3_export:successes":
    { "777db5d6": { createdAt: 1546629585569 }
  },
  "canvas.m856578WI4_export": "ee4cd130",
  "canvas.m856578WI4_export:successes":
    { "ee4cd130": { createdAt: 1546629586977 }
  }
}
```
- order-word
```ts
{
  // m859286OW
  "canvas.m859286OW1_export": [ "drag36d8bc8a","drag9ba778a3","drag4f26ba1b","drag054bef01","dragb2836e03","drag1a3cdb57","drag1f2c7f2d","drag48d1d7a7" ],
  "canvas.m859286OW1_export:fails": {
    "drag36d8bc8a,drag054bef01,drag48d1d7a7,drag1f2c7f2d,drag4f26ba1b,drag9ba778a3,dragb2836e03,drag1a3cdb57": { createdAt: 1546629829708 },
    "drag36d8bc8a,drag9ba778a3,drag1f2c7f2d,drag054bef01,drag48d1d7a7,drag4f26ba1b,dragb2836e03,drag1a3cdb57": { createdAt: 1546629837235 },
    "drag36d8bc8a,drag9ba778a3,drag4f26ba1b,drag1f2c7f2d,drag054bef01,dragb2836e03,drag48d1d7a7,drag1a3cdb57": { createdAt: 1546629842221 }
  },
  "canvas.m859286OW1_export:successes": {
    "drag36d8bc8a,drag48d1d7a7,drag054bef01,drag1f2c7f2d,drag4f26ba1b,drag9ba778a3,dragb2836e03,drag1a3cdb57": { createdAt: 1546629827848 },
    "drag36d8bc8a,drag9ba778a3,drag054bef01,drag48d1d7a7,drag1f2c7f2d,drag4f26ba1b,dragb2836e03,drag1a3cdb57": { createdAt: 1546629831594 },
    "drag36d8bc8a,drag9ba778a3,drag4f26ba1b,drag1f2c7f2d,drag054bef01,drag48d1d7a7,dragb2836e03,drag1a3cdb57": { createdAt: 1546629839805 },
    "drag36d8bc8a,drag9ba778a3,drag4f26ba1b,drag054bef01,drag1f2c7f2d,dragb2836e03,drag1a3cdb57,drag48d1d7a7": { createdAt: 1546629855180 },
    "drag36d8bc8a,drag9ba778a3,drag4f26ba1b,drag054bef01,dragb2836e03,drag1f2c7f2d,drag1a3cdb57,drag48d1d7a7": { createdAt: 1546629857032 },
    "drag36d8bc8a,drag9ba778a3,drag4f26ba1b,drag054bef01,dragb2836e03,drag1a3cdb57,drag1f2c7f2d,drag48d1d7a7": { createdAt: 1546629859748 }
  }
}
```
- order-sentence
```ts
{
  "canvas.m859318OS1_export": [ "drag418283ad","dragd8d38935","drag49f441a9","drag28b64115" ],
  "canvas.m859318OS1_export:fails": {
    "dragd8d38935,drag28b64115,drag418283ad,drag49f441a9": { createdAt: 1546630169693 }
  },
  "canvas.m859318OS1_export:successes": {
    "drag418283ad,dragd8d38935,drag28b64115,drag49f441a9": { createdAt: 1546630172912 },
    "drag418283ad,dragd8d38935,drag49f441a9,drag28b64115": { createdAt: 1546630174671 }
  }
}
```

</p>
</details>


#### Категории зависимостей блоков

<details>
<summary>развернуть</summary>
<p>

(пропущены часть зависимостей из-за кучки специфичных параметров/вызовов методов, должно встраиваться в итоговую структуру)

- сервисы синхронизации
  - vcRtm
  - wbSync (зависимости: rtmService, vcRtmService)
- скоринг (scoreService)
- exerciseFactory (зависимости: scoreService, wbSync)
- exerciseService
- общие параметры (конфиг, предположительно статичный, в идеале может меняться на лету)
  - stepRevId, stepIndex (viewportComponent)
  - isGroupLesson (room)
  - isTeacher, isStudent, isAuthenticated (authService)
  - isMobile
  - isCms (stepsService)
  - showAnswerStatus, isScoreRollbackAllowed (scoreService, roomConfig.score.showAnswerStatus)
  - room hash (room)
  - showCorrectAnswerHint (viewportComponent config)
  - userId, userAvatarUrl, userLevel (authService)
  - lessonId (currentRoomService.get().getLesson())
  - shouldShowKeyHint (room instanceof StudentClassRoom)
- динамические параметры (могут измениться в процессе)
  - isMobileView (mobileViewService)
  - mainColor (colorsService)
  - isEditAllowed (viewportComponent)
  - user features, settings  (authService)
  - studentId (currentRoomService.studentId, authService.getUserId)
  - workbookId (currentRoomService.workbook())
  - isPartnerMobile (partnersOnlineService)
- параметры конкретного блока
  - playerСonfig (audio)
  - imageService.getConfig(), inViewport (image)
  - top offset (modernLessonService.isModernLesson, alertsService.alert$) (sticky)
  - contentService.getConfig().areTeacherNotesEnabled (teacher-notes)
  - wordsService (visibleProgress, userId, usersWordsData), stateService.current.data.disableWords (vocabulary)
  - isGrammarAllowed (grammar)
- вызов методов
  - grammarService: showMenu, hideMenu (grammar)
  - viewportComponent: registerFocusable, focusNext, setFocusedElement, getChildOffsets, getViewportWidth, getViewportHeight, registerChildComponent (input, select, video, vocabulary)
  - wordsService: addWords, loadingMeanings, loadUserWordsDataByMeanings (media-player, vocabulary)
  - firebaseService: connect (textarea)
  - firepadService: initFirepad (textarea)
  - notesService: loadFirebaseConfig (textarea)
  - eventTrackerService (video, words)
  - popupService: openConfirmPopup (whiteboard, whiteboard-list)
  - usersService: setCurrentUserFeature (exercise-hint)

</p>
</details>


#### Зависимости блоков

<details>
<summary>развернуть</summary>
<p>

Не упомянуты
- мелкие технические штуки по типу TimeoutService
- запросы на бэк если они используются только в этом блоке

.

- audio
  - stepRevId для синхронизации
  - playerСonfig
  - currentRoomService.get().isGroupLesson
  - wbSync
- card-set
  - stepRevId для синхронизации
  - exerciseFactory
  - isTeacher
  - isMobile
- choice
  - stepRevId
  - exerciseFactory
  - wbSync
  - isCms
- choice-image
  - stepRevId
  - exerciseFactory
  - wbSync
  - isCms
- dnd-group
  - colorsService
  - stepRevId, stepIndex
  - isEditAllowed
  - scoreService (showAnswerStatus, isScoreRollbackAllowed)
  - isCms
  - wbSync
  - room hash (шафл дропов)
  - exerciseService
  - mobileViewService.isMobileView
  - isTeacher
- dnd-image
  - showCorrectAnswerHint
  - isEditAllowed
  - isTeacher
  - colorsService
  - stepRevId, stepIndex
  - scoreService (isScoreRollbackAllowed)
  - isCms
  - wbSync
  - mobileViewService.isMobileView
  - exerciseService
  - room hash (шафл дропов)
- dnd-image-audio
  - stepRevId, stepIndex
  - isEditAllowed
  - isTeacher
  - scoreService
  - wbSync
  - isMobile
- dnd-image-set
  - showCorrectAnswerHint
  - showAnswerStatus
  - colorsService
  - stepRevId, stepIndex
  - isEditAllowed
  - scoreService (isScoreRollbackAllowed)
  - isCms
  - wbSync
  - mobileViewService.isMobileView
  - exerciseService
  - room hash (шафл дропов)
- dnd-text
  - showCorrectAnswerHint
  - showAnswerStatus
  - isEditAllowed
  - colorsService
  - stepRevId, stepIndex
  - scoreService
  - isCms
  - wbSync
  - room hash (шафл дропов)
  - mobileViewService.isMobileView
  - exerciseService
- draw
  - stepRevId
  - userId
  - lessonId
  - wbSync
  - isMobile
- exercise-hint
  - isStudent, isAuthenticated
  - authService.getUserWithFeature
  - usersService.setCurrentUserFeature
  - isMobile
- exercise-sound
  - authService.userSettings
  - exerciseService
  - currentRoomService (roomConfig.score.showAnswerStatus)
- ext
  - stepRevId
  - isTeacher, isStudent
  - exerciseFactory
  - currentRoomService.studentId
- grammar
  - grammarService (showMenu, hideMenu, isGrammarAllowed)
- groups
  - isEditAllowed
  - isTeacher
  - stepRevId, stepIndex
  - scoreService
  - wbSync
  - isCms
  - exerciseService
- hover-avatar
  - authService (getUserId, getUserAvatarUrl, isTeacher)
  - vcRtm
- iframe
  - exerciseFactory
  - stepRevId
  - authService.getUserLevel
  - workbook.id (для iframe.setSessionId)
- image
  - imageService.getConfig() (imageOCREnabled, imageDrawEnabled)
  - inViewport
  - stepRevId
  - isMobile
- input
  - showAnswerStatus
  - showCorrectAnswerHint
  - registerFocusable
  - isEditAllowed
  - focusNext
  - mobileViewService.isMobileView
  - isTeacher, isStudent
  - shouldShowKeyHint (проверка по комнате instanceof StudentClassRoom)
  - stepRevId, stepIndex
  - isScoreRollbackAllowed
  - scoreService
  - wbSync
  - isCms
  - exerciseService
- marathon
  - stepRevId
  - isEditAllowed
  - isCms
  - isTeacher
- order-sentence
  - colorsService
  - stepRevId, stepIndex
  - showAnswerStatus
  - isEditAllowed
  - isScoreRollbackAllowed
  - scoreService
  - isCms
  - isTeacher
  - wbSync
  - mobileViewService.isMobileView
  - exerciseService
- order-word
  - colorsService
  - stepRevId, stepIndex
  - showAnswerStatus
  - isEditAllowed
  - isScoreRollbackAllowed
  - scoreService
  - isCms
  - isTeacher
  - wbSync
  - shouldShowKeyHint (проверка по комнате instanceof StudentClassRoom)
  - exerciseService
- media-player
  - isStudent, user.id
  - colorsService
  - currentRoomService.getStudentId
  - wordsService.addWords
- section
  - showAnswerStatus
- select
  - setFocusedElement
  - getChildOffsets
  - getViewportWidth
  - getViewportHeight
  - isEditAllowed
  - isTeacher
  - colorsService
  - registerFocusable, focusNext
  - stepRevId, stepIndex
  - showAnswerStatus
  - showCorrectAnswerHint
  - isScoreRollbackAllowed
  - scoreService
  - wbSync
  - isCms
  - exerciseService
- sticky
  - modernLessonService.isModernLesson
  - alertsService.alert$
- strike-out
  - isEditAllowed
  - showAnswerStatus
  - showCorrectAnswerHint
  - stepRevId, stepIndex
  - isScoreRollbackAllowed
  - scoreService
  - isCms
  - wbSync
  - exerciseService
- teacher-notes
  - stepRevId
  - isTeacher, isStudent
  - exerciseFactory
  - contentService.getConfig().areTeacherNotesEnabled
- test
  - stepRevId, stepIndex
  - isEditAllowed
  - showAnswerStatus
  - showCorrectAnswerHint
  - isScoreRollbackAllowed
  - scoreService
  - wbSync
  - isCms
  - isTeacher
  - exerciseService
- test-image
  - colorsService
  - isCms
  - wbSync
  - stepRevId, stepIndex
  - showAnswerStatus, isEditAllowed
  - getViewportWidth
  - scoreService
- textarea
  - firebaseService.connect
  - firepadService.initFirepad
  - workbookId
  - user.id
  - isCms
  - notesService.loadFirebaseConfig
- video
  - stepRevId
  - viewportComponent.registerChildComponent
  - isGroupLesson
  - wbSync
  - isTeacher, isStudent
  - eventTrackerService
  - partnersOnlineService (isPartnerMobile)
- vocabulary
  - wordsService.visibleProgress
  - stateService.current.data.disableWords
  - viewportComponent.registerChildComponent
  - isTeacher
  - dictionaryService (currentWordsetId) (выносится в метод words сервиса)
  - wordsService (userId, usersWordsData, loadingMeanings, loadUserWordsDataByMeanings, addWords)
- whiteboard
  - wbSync
  - room.getLatestStepRevIdForNavigation
  - user.id
  - vcRtmService
  - popupService.openConfirmPopup
  - translateService.instant
- whiteboard-list
  - stepRevId
  - exerciseFactory
  - popupService.openConfirmPopup
- essay
  - viewportComponent.unregisterElementController, getChildComponents, registerChildComponent
  - stateService.params.studentId
  - stateService.reload
  - stepsService.getCurrentPendingStep
  - stepsService.isCurrentStepAssigned
  - isStudent, isEssayInspector, isTeacher
  - user.id
  - scoreService.addScore, scoreService.newActivity
  - contentService.getLessonLevel
  - currentRoom.getStudentId
  - studentId через currentRoom (getStudentId, getWorkbook)
  - testService.getTimer
  - testService.onTimerUpdated
  - delayedCheckExercises
- magic-box
  - stepRevId
  - isTeacher
  - exerciseFactory
- record
  - viewportComponent.registerChildComponent
  - isEditAllowed
  - stateService.params.studentId
  - popupService.openConfirmPopup
  - stepsService.getCurrentPendingStep
  - stepsService.isCurrentStepTestAssigned
  - isEssayInspector
  - isTeacher
  - isStudent
  - user.id
  - scoreService.addScore, scoreService.newActivity
  - studentId через currentRoom (getStudentId, getWorkbook)
  - delayedCheckExercises
- track-event
  - eventTracker
- words
  - wordsService (isLearned, remainingProgress)
  - config.words.minVisibleProgress
  - contextDirective.getContextName
  - viewportComponent.getCurrentRenderedStepNum
  - tagsService
  - eventTrackerService
  - wordsService.areWordTagsEnabled

</p>
</details>






