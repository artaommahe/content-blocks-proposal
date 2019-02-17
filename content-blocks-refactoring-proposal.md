# Предложение по архитектуре блоков контента

Под блоками контента подразумеваются любые компоненты, используемые сейчас в разметке слайдов уроков, включая как сами упражнения так и технические компоненты стилизации/статичные компоненты.  
Под платформой подразумевается любой проект (сайт) куда вставляются блоки.


## Текущие проблемы

- дичайшая связность самих блоков и их синхронизации/скоринга с вимбоксом
- невозможность быстро и просто прототипировать и разрабатывать блоки вне вимбокса
- невозможность использования вне вимбокса
- отсутствие адекватной архитектуры и стандартов разработки блоков
- устаревшее апи синхронизации/скоринга, на котором завязываются многие блоки
- много легаси в формате данных синхронизации и работе скоринга, которое не локализовано, а размазано по сервисам/стратегиям
- разрастание числа блоков (в уроках используется несколько, но скачивается код для всех)
- невозможность разработки блоков (кроме содержимого iframe'ов) не командой вимбокса, вне вимбокса и без знания архитектуры вимбокса и его легаси частей
- высокая сложность в дальнейшем создания визуального редактора блоков (из-за связности с вимбоксом, логики рендера блоков)
- каша в моделях/скор-синк стратегиях
- низкая скорость разработки новых блоков и поддержки имеющихся (как следствие части вышеперечисленного)


## Конечный результат

Описанное далее является сферически конём в вакууме, не все пункты обязательны к реализации/будут реализованы, примерный план постепенного перехода будет расписан отдельно и раскидан в таски по приоритетности.

Блок контента
- представляет собой независимый [custom element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) (несколько элементов)
- реализует минимально необходимый для работы функционал
- работает независимо от наличия чего-либо другого на странице (без конфига/синхронизации/скоринга/...)
- получает необходимые параметры и конфигурацию из инпутов и/или компонент-контейнер
- общается с внешним миром через CustomEvents и/или BlockApi (описано ниже)
- в случае использования параметров конфигурации (общие, точечные под компонент)
  - умеет получать из компонента-контейнера
  - умеет получать через инпуты
  - реагирует на изменение
  - может работать без этих параметров/их части (не падает с ошибкой, работает или выдаёт предупреждение что они обязательны)
- для работы с синхронизацией/скорингом
  - использует минимальное, нижеописанное API через BlockApi
  - может работать при их отсутствии или если они отключены (не падает с ошибкой, работает или выдаёт предупреждение что они обязательны)
- насколько возможно, ничего не знает о других блоках (кроме общеиспользуемых), взаимодействует с нек-ми из них через чётко прописанное API
- разделяет основную логику блока и вьюшку на разные компоненты (`smth.ts` и `smth-view.ts` e.x.)

Блоки собираются каждый в свой отдельный бандл, грузятся лениво (можно сделать предзагрузку по известному списку) и регистрируются как кастом элементы.


#### Использование в разметке
(произвольный проект на произвольном фреймворке/нативе)

```html
<sky-block-group config="JSON.stringify({ ... })">
  <vim-select id="select1">
    <vim-select-answer>answer</vim-select-answer>
    <vim-select-answer right="true">answer2</vim-select-answer>
  </vim-select>

  <vim-teacher-notes>
    <vim-input id="input1">
      <vim-input-answer>answer</vim-input-answer>
    </vim-input>
  </vim-teacher-notes>
</sky-block-group>
```

#### Конфиг

Класс для работы с конфигурацией блоков, переданной через инпут `sky-block-group` компонента или напрямую в сам компонент. Построен на основе стора, позволяет подписаться на изменения в любой части конфига или получить текущее значение. Изменение происходит через передачу нового объекта конфигурации или частичного, который будет смержен с текущим.  
Объект конфигурации может содержать общие параметры, параметры для синка/скоринга, параметры для конкретного типа блоков. Изменение любого параметра производится через передачу нового объекта (строки через аттрибут) конфига.

Хэлпер `getBlockConfig` позволяет блоку получить его конфиг с учётом ближайшего `sky-block-group` компонента.

Пример конфига
```ts
export interface IBlockConfig {
  score?: IBlockScoreConfig;
  sync?: IBlockSyncConfig;
  isMobile?: boolean;
}
```

[API](libs/blocks/base/config)
- [класс конфига](libs/blocks/base/config/config.ts)
- [хэлперы](libs/blocks/base/config/helpers.ts)

На данный момент не реализована упрощённая поддержка передачи конфига в сам блок и мерж такого конфига с общим, т.е. подразумевается только кейс работы с `sky-block-group` компонентом.


#### Глобальные события

Взаимодействие между блоками (sync, score, что угодно) и платформой идёт через CustomEvents с использованием готовых [хэлперов](libs/blocks/base/events/events.ts)
```ts
export interface IBlocksEvent<T> {
  name: string;
  data: T;
}

blocksListenAllGlobalEvents(): Observable<IBlocksEvent<any>>;
blocksListenGlobalEvent<T>(eventName: string): Observable<T>;
blocksDispatchGlobalEvent<T>(eventName: string, data: T): void;
```

Используются в синхронизации/скоринге, могут использоваться в дополнительных модулях или в самих блоках для взаимодействия с платформой.  
Платформа использует эти же хэлперы для взаимодействия с блоками со своей стороны.


#### Модель

Унифицированный класс для работы с ответами упражнения. Хранит историю ответов, позволяет её заменить, добавить новый ответ, добавить/получить правильны(й/е) ответы. Может расширяться для предоставления отформатированных или дополнительных данных.

Синхронизация/скоринг базово работают на основе стандартного интерфейса модели и ответа.

```ts
export interface IBlockAnswer<TValue> {
  value: TValue;
  createdAt: number;
  isCorrect: boolean | null;
}
```

[API](libs/blocks/base/model)
- [интерфейсы данных](libs/blocks/base/model/interface.ts)
- [основная модель](libs/blocks/base/model/base.ts)


#### Синхронизация

Если включена в конфиге, то шлются глобальные события для синхронизации, там же слушаются события восстановления данных.  

Для работы синхронизации вимбокса на сторонних проектах (если будет такая необходимость) можно будет выделить синхронизацию из вимбокса с её апи/пушером в отдельный виджет, который использовать и в вимбоксе и в других проектах.

Все сложности, завязки на комнатах/студентах и подобном выносятся в модуль синхронизации проекта, которому эта синхронизация нужна (вимбокс например). Основной код блоков контента от этого максимально абстрагирован и знает только о возможном существовании синхронизации и апи взаимодействия с ней с использованием минимально возможного набора параметров.

Блок работает с синхронизацией через [BlockApi](#BlockApi) (с привязкой к модели или без), или напрямую создавая синк стратегию (с привязкой модели или без), или напрямую используя api методы.

[API](libs/blocks/base/sync)
- [типы событий](libs/blocks/base/sync/const.ts)
- [интерфейсы данных](libs/blocks/base/sync/interface.ts)
- [api методы](libs/blocks/base/sync/service/sync-api.ts)
- [основная стратегия](libs/blocks/base/sync/strategy/base.ts)

Есть возможность слать произвольные события с произвольными данными для прямого общения с партнёром без сохранения этих данных на бэк (события `event` и `sendEvent`).

На уровне платформы может быть реализован модуль синхронизации, который будет слушать соответствующие события из синка блоков и передавать их в транспорт/из транспорта прокидывать в блоки, возможно что-то сохранять на бэкенд.


#### Скоринг

Если включен в конфиге, то шлём глобальные события на которые кто-нибудь может подписаться.

Всё остальное выносится в модуль скоринга того проекта, которому скоринг нужен. Взаимодействие между ним и блоками идёт асинхронно через глобальные события.

Блок работает со скорингом через [BlockApi](#BlockApi) (с привязкой к модели или без), или напрямую создавая скор стратегию (с привязкой к модели или без), или напрямую используя api методы.

[API](libs/blocks/base/score)
- [типы событий](libs/blocks/base/score/const.ts)
- [интерфейсы данных](libs/blocks/base/score/interface.ts)
- [api методы](libs/blocks/base/score/service/score-api.ts)
- [основная стратегия без хэндлеров](libs/blocks/base/score/strategy/base.ts)
- [простая стратегия с базовыми хэндлерами](libs/blocks/base/score/strategy/simple.ts)

На уровне платформы может быть реализован модуль скоринга, который будет слушать события из блоков и формировать итоговый скор/сохранять это значение на бэк.


#### BlockApi

Базовый фасад для работы с синхронизацией/скорингом и привязки их к моделям. Может расширяться дополнительным функционалом, связанным с конкретным блоком, для предоставления дополнительных данных/методов на основе имеющихся модели/синхронизации/скоринг классов. Аналог текущего AbstractExercise.  
В базовом виде предоставляет доступ к переданным модели/синку/скорингу и методы init/destroy для инициализации/дестроя синк/скоринг стратегий.

BlockApiService предоставляет метод для создания BlockApi инстанса по переданным параметрам.

[API](libs/blocks/base/api)
- [базовый фасад](libs/blocks/base/api/base.ts)
- [сервис](libs/blocks/base/api/service/block-api.ts)


#### Взаимодействие с другими блоками

В идеале блок ничего не знает и не хочет знать о других блоках на странице. В случае же явной необходимости используется несколько стандартизированных подходов
- отправка/прослушка глобальных событий
- получение инстанса компонента-родителя (конкретного или реализующего определённый интерфейс, например Visibility) через аналог инжектов по некоторому токену и прямой вызов его методов


#### Процесс разработки

Разработка каждого блока, включая обшие, ведётся в `libs/blocks` либе в рамках соответствущей стори сторибука, т.е. независимо от основной платформы. В стори используются специальные компоненты для работы с параметрами внешнего окружения блока (смена параметров конфига, просмотр улетающих из блока событий, отправка событий для блока). Накидывается несколько кейсов под разные варианты использования блока, проверяется в разных конфигурациях.  
По окончанию разработки блок должен сходу заработать в рамках платформы (кроме случаев изменения в архитектуре блоков/конфигах), если это не так то допиливается недостающее в окружении сторибука.  
Тестирование блока проводится и в рамках сторибука и в рамках основной платформы (как минимум до момента когда мы сможем доверять разработанному в рамках сторибука, т.е. не будет багов вылезающих только в рамках использрвания в платформе).


## Решение проблем

Развязка блоков и платформы осуществляется с помощью перехода на события вместо прямого вызова методов и получения всех необходимых параметров через единый конфиг из родительского компонента.  
Это решает следующие проблемы
- связность с кодом платформы
- невозможности разработки вне вимбокса (можем использовать сторибук, стакблиц, что угодно)
- невозможность разработки блоков не командой вимбокса (можем отдавать на аутсорс)
- возможность использования блоков вне вимбокса (лендинги, другие проекты со своими уроками)
- упрощает создание модульного редактора страниц с упражнениями (т.к. они могут работать без взаимодействия с платформой в базовом виде)

Принятие нового формата моделей, скор/синк стратегий
- упростит работу с ними как основной команде, так и сторонним разработчикам
- упростит взамодействие с платформой и понимание того как оно происходит
- позволит избавиться от легаси костылей хотя бы в рамках разработки новых блоков

Переход на кастом элементы 
- позволит использовать блоки на произвольных страницах без ангуляра
- позволит разрабатывать новые блоки на произвольных фреймворках/нативе (аутсорсерам например)
- упростит динамическую загрузку только используемых на странице упражнений (почти 20% текущего app.js бандла это код блоков, в рамках ангуляр компонентов это сделать реально, но сложнее)
- упростит рендеринг блоков (достаточно сделать innerHTML с разметкой и помолиться)


## Обсудить

- критичность открытости апи для третьего лица (возможность отправки события из консоли). По идее не критично т.к. всегда можно получить доступ ко всем сервисам и вызвать у них соответствующие методы/посмотреть дебаггером что там происходит
- проработать модели/скор-синк стратегии в будущем


## Приложения

#### Известные проблемы

- ~~использованию блоков как CustomElements мешают проблемы с content projection у вложенных элементов в плане получения text/html content прокинутого в чайлд компоненты. Частично решается использованием `ViewEncapsulation.ShadowDom` и `<slot (slotchange)></slot>` вместо `<ng-content></ng-content>`, но требует проверки работоспособности в IE11 с полифилами (shaddydom/shaddycss).  
  Так же необходимо дополнительное исследование на тему получения HTML содержимого слотов или templateRef для переноса значений в произвольное место.~~  
  Получилось завести с `ng-content` и таймаутом в OnInit (содержимое `ng-content` заполняется несколько странно по таймингу)
- на данный момент созданные через `@angular/elements` кастом элементы не прокидывают по дефолту паблик методы в инстанс созданого кастом элемента. Требуется использование хака с прописыванием `@Input` декторатора для методов, которые должны быть доступны публично (https://github.com/angular/angular/issues/22114)
- и ещё кучка багов с `@angular/elements`
-- https://github.com/angular/angular/issues/28265
-- https://github.com/angular/angular/issues/28266
-- https://github.com/angular/angular/issues/27858


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






