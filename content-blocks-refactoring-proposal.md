# Предложение по архитектуре блоков контента

Под блоками контента подразумеваются любые блоки (теги), используемые сейчас в разметке слайдов уроков, включая как сами упражнения так и технические компоненты стилизации/статичные компоненты.


TODO
- пример упрощённого конечного результата (в стакблице, или несколько примеров для разных кейсов)
- прописать базово апи синхронизации/скоринга
- прописать базово формат конфига (общего и индивидуального) и работу с ним
- прописать базово формат компонента-контейнера и работу с ним
- работа с мобильным режимом с возможностью переключения на лету
- коммон функционал по типу указки/автарок/звуков, что из этого коммон а что выносить наружу
- набросок блока-упражнения как основы для создания новых
- скопипастить с гугла пример синхронизации на платформе в виде п2п между вкладками для блока в стакблице
- как обновлять конфиг в BlocksApi при изменениях в конфиге блока/компонента-настроек
- добавить пример скор счётчика в стакблиц, включить fail состояния в пример
- добавить компонет для настроек
- (проблема) возможность создать событие синка/скора из консоли
- добавить пример упражнения со сложной моделью (а ля днд, без перетаскиваний с подобной логикой)
- отдельными разделами рефакторинг моделей, синк и скор стратегий (понадобится помощь)
- скоринг индикатор для упражнения
- как получить начальные данные из синка на появление упражнения
- добавить включение/отключение скоринга
- восстановление данных из синка
- резет упражнений (состояние, скоринг)
- добавить в тестовый инпут скоринг фейлов
- проверить скоринг на множестве упражнений
- мерж локального конфига элемента и группового, только локальный конфиг


## Текущие проблемы

- дичайшая связность самих блокови их синхронизации/скоринга с вимбоксом
- невозможность быстро и просто прототипировать и разрабатывать блоки вне вимбокса
- невозможность использования вне вимбокса
- отсутствие адекватной архитектуры и стандартов разработки блоков
- устаревшее апи синхронизации/скоринга, на котором завязываются многие блоки
- разрастание числа блоков (в уроках используется несколько, но скачивается код для всех)
- невозможность разработки блоков (кроме содержимого iframe'ов) не командой вимбокса, вне вимбокса и без знания архитектуры вимбокса и его легаси частей
- высокая сложность в дальнейшем создания визуального редактора блоков (из-за связности с вимбоксом, логики рендера блоков)
- низкая скорость разработки (как следствие части вышеперечисленного)


## Чего далее нет

- рефакторинга моделей и скоринг/синк классов блоков (по большей части независимая проблема, нужно делать отдельно). Отсутствует их упоминание в апи скоринга/синхронизации, но подразумевается что они там используются (базово в текущем виде)
- рефакторинга вьюшек блоков (например вынос общего кода у дндшек)
- 


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


## Известные проблемы

- ~~использованию блоков как CustomElements мешают проблемы с content projection у вложенных элементов в плане получения text/html content прокинутого в чайлд компоненты. Частично решается использованием `ViewEncapsulation.ShadowDom` и `<slot (slotchange)></slot>` вместо `<ng-content></ng-content>`, но требует проверки работоспособности в IE11 с полифилами (shaddydom/shaddycss).  
  Так же необходимо дополнительное исследование на тему получения HTML содержимого слотов или templateRef для переноса значений в произвольное место.~~  
  Получилось завести с `ng-content` и таймаутом в OnInit (содержимое `ng-content` заполняется несколько странно по таймингу)
- на данный момент созданные через `@angular/elements` кастом элементы не прокидывают по дефолту паблик методы в инстанс созданого кастом элемента. Требуется использование хака с прописыванием `@Input` декторатора для методов, которые должны быть доступны публично (https://github.com/angular/angular/issues/22114)


## Приложения

#### Мелочи

- работа с глобальными событиями идёт через методы-хэлперы, скрывающие конкретную реализацию этого взаимодействия (использование CustomEvent). Подписка реализуется через хэлпер, возвращающий Observable  (TODO: стакблиц с примером)
- для custom elements получение инстансов компонентов-родителей реализуется через метод-хэлпер по некоторому токену (видимо строковому). У соответствующего компонента-родителя через другой метод-хэлпер по такому же токену проставляется уникальное поле, которое метод-геттер и ищет среди родителей текущего компонента (TODO: стакблиц с примером)


#### Категории зависимостей

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






