# Руководство по обработке транскриптов

В этом руководстве рассказывается, как очищать, анализировать и анализировать стенограммы интервью для максимального обучения.

---

## Шаг 0.5: Обнаружение и нормализация формата

**Перед очисткой определите исходный формат расшифровки и нормализуйте ее до стандартного представления.** Полный протокол см. в `references/transcript-formats.md`.

1. Проверьте первые 30–50 строк на наличие сигналов формата (заголовки VTT, стили временных меток, шаблоны меток говорящих, заголовки тем).
2. Определите исходный формат: Otter.ai, Grain, Google Meet, Zoom VTT, Granola, Microsoft Teams, Tactiq или Руководство/общее.
3. Примените правила нормализации, специфичные для формата, для создания внутреннего представления (один поворот динамика на блок, метки времени удалены, метки динамиков стандартизированы).
4. Определить количество говорящих: 2 говорящих → Интервьюер/Кандидат. 3+ докладчика → пометить как потенциальную панель, сохранить отдельные ярлыки.
5. Сигналы качества отчета: покрытие меток динамиков, достоверность нормализации, обнаружение нескольких динамиков, обнаружение артефактов.

Если обнаружение сомнительно, по умолчанию выберите «Ручная/общая обработка» и обратите внимание на двусмысленность.

Нормализованная расшифровка является входными данными для этапа 1 (очистка). Временные метки уже должны быть удалены путем нормализации — шаг 1 фокусируется только на очистке на уровне контента.

---

## Шаг 1. Очистите транскрипт

Нормализованная расшифровка (из шага 0.5) чище, чем необработанный ввод, но все равно требует очистки на уровне содержимого. Временные метки уже должны быть удалены путем нормализации.

### Что удалить
- Слова-вставки: «хм», «э-э», «типа», «ну знаешь», «в основном».
- Фальстарты: «Я собирался… на самом деле, позвольте мне сказать…»
- Дублированные линии динамиков (все оставшиеся после нормализации)
- Любые остаточные временные метки, не обнаруженные нормализацией.

### Что оставить
- Ярлыки докладчиков (Интервьюер/Кандидат)
- Содержательное содержание, даже если оно коряво сформулировано.
- Паузы помечаются как [пауза], если они имеют смысл (показывает размышление)
- Вопросы точно по заданию (не перефразируйте)

### Подсказка по очистке```
TASK: Clean this interview transcript.

INPUT: [paste raw transcript]

INSTRUCTIONS:
- Remove filler words (um, uh, like, you know, basically) without changing meaning
- Remove false starts and self-corrections, keeping the final version
- Fix obvious transcription errors
- Keep speaker labels
- Preserve the actual content and meaning

OUTPUT: Cleaned transcript ready for analysis
```
---

## Шаг 1.5: Контроль качества транскрипта

После очистки оцените, какая часть транскрипта пригодна для использования, прежде чем переходить к анализу.

### Оценка качества

| Уровень качества | Критерии | Действие |
|---|---|---|
| **Высокая** (чистота >80 %) | Четкие обозначения говорящих, большая часть контента подлежит восстановлению, вопросы идентифицируются | Приступите к полному анализу. Нормальная достоверность доказательств. |
| **Средний** (чистота 60–80%) | Некоторые разделы искажены, иногда отсутствуют названия докладчиков, большинство пар вопросов и ответов можно восстановить | Продолжайте, но отметьте: «В этой стенограмме есть пробелы. Я отмечу, где моя уверенность снижается». Будьте откровенны, когда претензии основаны на неполных данных. |
| **Низкая** (чистота <60%) | Серьезные пробелы, отсутствующие названия докладчиков, искаженные разделы, невозможно определить все вопросы | Скажите заранее: «Эта стенограмма имеет серьезные проблемы с качеством. Я могу оценить [N] из [M] ответов, но в целом моя уверенность низкая. Вот что я могу и не могу оценить». Вы можете спросить: «Помните ли вы какие-либо ответы, которые пропущены или искажены? Ваша память + частичная расшифровка лучше, чем только неполная расшифровка». |

### Факторы качества, зависящие от формата

Включите эти сигналы из шага 0.5 в оценку качества:
– **Охват меток говорящего**. Если при нормализации не удалось идентифицировать говорящих в >20 % текстовых блоков, понизьте уровень качества на один уровень.
- **Достоверность нормализации**: низкая достоверность (по умолчанию для общей обработки) добавляет неопределенность — обратите внимание на оценку качества.
- **Обнаружение нескольких говорящих**: обнаружено более 3 говорящих → установите флажок для синтаксического анализа с учетом панели на шаге 2. Если роли говорящих не удалось назначить, попросите кандидата уточнить, кто есть кто.
- **Обнаружены артефакты**: эхо-артефакты, неправильная атрибуция или искаженные участки, обнаруженные во время нормализации, должны учитываться при оценке качества.

Укажите уровень качества в начале анализа. Не притворяйтесь, что плохие данные — это хорошие данные.

---

## Шаг 2: Анализ с учетом формата

Структурируйте стенограмму для систематического анализа. Подход к разбору зависит от формата интервью.

### Шаг 2.0: Обнаружение форматаОпределите формат собеседования, используя эту цепочку приоритетов:
1. **Состояние коучинга**: проверьте `coaching_state.md` → Циклы интервью → Форматы раундов для этой компании/раунда.
2. **Заявление кандидата**. Возможно, кандидат сообщил вам формат в разговоре.
3. **Вывод по стенограмме**. В панельных интервью участвуют более 3 спикеров. Транскрипты системного проектирования содержат длинные монологи кандидатов с последующими исследованиями. Сочетание технических и поведенческих факторов демонстрирует отчетливые переключения режимов.
4. **Спросите**. В случае двусмысленности спросите: «Какого типа это было интервью — поведенческое, системное, групповое или смешанное?»
5. **По умолчанию**: если неизвестно, по умолчанию используется путь A (поведенческий).

### Путь A: Поведенческое интервью (по умолчанию)

Используется для: поведенческого скрининга, глубокого поведенческого анализа, повышения планки, соответствия культуре, менеджера по найму 1:1.```
FOR EACH Q&A PAIR, CAPTURE:
- unit_id: Q1, Q2, etc.
- question_text (verbatim)
- answer_text (verbatim, trimmed of filler)
- topic: behavioral / technical / strategic / situational / cultural
- competency_tested: leadership / collaboration / problem-solving / communication / technical / etc.
- word_count: number of words in answer
- did_answer_question: Yes / Partial / No
- follow_up_triggered: Yes / No (did interviewer ask for more?)

SUMMARY STATS:
- Total questions: ___
- Fully answered: ___
- Partially answered: ___
- Not answered: ___
- Average answer length: ___ words
- Longest answer: ___ words (flag if >300)
- Follow-ups triggered: ___
```
### Путь Б: Панельное интервью

Используется, когда: обнаружено более 3 отдельных динамиков или известно, что формат — панель.

Разобрать на **обмены** (не пары). В каждом обмене информацией могут участвовать несколько интервьюеров.```
FOR EACH EXCHANGE, CAPTURE:
- unit_id: E1, E2, etc.
- lead_interviewer: [name/label of who asked the primary question]
- question_text (verbatim)
- answer_text (verbatim)
- follow_up_chain: [list of follow-ups from ANY interviewer, with interviewer label for each]
- cross_examiner: [did a different interviewer jump in? who?]
- competency_tested:
- word_count:

PANEL ANALYSIS:
- Interviewer participation map: [who asked how many questions, who followed up most]
- Cross-interviewer patterns: [did interviewers build on each other's questions? tag-team?]
- Candidate adaptation: [did the candidate adjust style/depth across different interviewers?]
- Energy distribution: [even across the panel, or front-loaded/faded?]
```
### Путь C: Проектирование системы/кейс-стади

Используется для: проектирования системы, технического анализа, архитектурного анализа, проектирования продукта.

Разбивка на **фазы** (не пары). Типы этапов: определение объема, подход, глубокое погружение, компромисс, адаптация, подведение итогов.```
FOR EACH PHASE, CAPTURE:
- unit_id: P1, P2, etc.
- phase_type: scoping / approach / deep-dive / tradeoff / adaptation / summary
- candidate_contributions: [key statements, decisions, reasoning]
- interviewer_probes: [questions, challenges, redirections within this phase]
- key_decisions: [decisions the candidate made and rationale]
- clarification_questions_asked: [by the candidate — critical in system design]
- thinking_out_loud_quality: High / Medium / Low
- duration_estimate: [rough time in this phase if inferable]

SUMMARY STATS:
- Time-in-scoping %: ___ (< 10% is a red flag — candidate skipped scoping)
- Clarification questions count: ___ (0 is a red flag)
- Tradeoffs articulated unprompted: ___ vs. when probed: ___
- Phase progression: [did the candidate manage time across phases?]
```
### Путь D: сочетание техники и поведения

Используется, когда: интервью содержит отдельные поведенческие и технические сегменты.

Сегментируйте расшифровку по режиму, затем проанализируйте каждый сегмент с соответствующим путем.```
SEGMENTATION:
- Identify transition points between behavioral and technical modes
- Label each segment: [behavioral] or [technical]
- Note transition quality: smooth / abrupt / confused

BEHAVIORAL SEGMENTS: Parse via Path A (Q# units)
TECHNICAL SEGMENTS: Parse via Path C (P# phases)
NUMBERING: Number each type sequentially across the full transcript (e.g., Q1, Q2, P1, P2, P3, Q3). Do not reset numbering between segments.

MODE-SWITCHING METADATA:
- Transition points: [where did mode switches happen?]
- Transition quality: [did the candidate shift cleanly?]
- Mode balance: [% behavioral vs. % technical]
- Integration moments: [did the candidate connect technical and behavioral threads?]
```
### Путь E: Практический пример (по инициативе кандидата)

Используется для: кейсов в стиле консалтинга, бизнес-кейсов, кейсов по стратегии продукта, когда кандидат проводит анализ.

Разбивка на **этапы**: определение проблемы, структура, анализ, рекомендации, вопросы и ответы.```
FOR EACH STAGE, CAPTURE:
- unit_id: CS1, CS2, etc.
- stage_type: problem-definition / framework / analysis / recommendation / q-and-a
- information_requests: [what data/clarification did the candidate ask for?]
- hypothesis_statements: [did the candidate state hypotheses?]
- pivots: [did the candidate change direction when given new information?]
- quantitative_rigor: High / Medium / Low / None
- synthesis_quality: [how well did the candidate tie analysis back to the original problem?]

SUMMARY STATS:
- Information requests count: ___
- Hypotheses stated: ___
- Pivots on new information: ___ (0 may indicate rigidity)
- Quantitative elements: ___
- Recommendation clarity: High / Medium / Low
```
### Путь F: Раунд презентаций

Используется для: презентаций системных проектов, презентаций бизнес-кейсов, обзоров портфолио, презентаций стратегий, углубленных технических погружений — в любом раунде, когда кандидат представляет подготовленную презентацию, за которой следуют вопросы и ответы.

Разбейте на **разделы** (а не на пары вопросов и ответов). Типы разделов: открытие, контент-раздел, переход, вопросы и ответы, закрытие.```
FOR EACH SECTION, CAPTURE:
- unit_id: PR1, PR2, etc.
- section_type: opening / content-section / transition / q-and-a / closing
- key_claims: [main assertions or conclusions in this section]
- evidence_quality: [are claims supported with data, examples, or reasoning?]
- content_density_estimate: [approximate words per minute if inferable — target 130-150 wpm for natural delivery]
- visual_references: [did the candidate reference slides, diagrams, or artifacts? Were references integrated or awkward?]
- audience_engagement_cues: [did the candidate check for understanding, invite questions, or read the room?]
- timing_notes: [did this section run long/short relative to its importance?]

FOR Q&A SECTIONS SPECIFICALLY:
- questions_asked: [list questions from the audience/panel]
- answer_quality: [direct vs. evasive, concise vs. rambling, confident vs. defensive]
- follow_up_handling: [did follow-ups indicate interest (positive) or dissatisfaction (negative)?]
- unknown_handling: [when the candidate didn't know, did they acknowledge it or bluff?]

SUMMARY STATS:
- Total estimated duration: ___
- Content-to-Q&A ratio: ___ (< 60% content may indicate underprepared; > 85% may indicate no room for questions)
- Opening hook quality: Strong / Adequate / Weak / Missing
- Closing strength: Clear call-to-action or summary / Trailed off / Ran out of time
- Questions fielded: ___ (0 may indicate no time left or audience disengagement)
- Visual integration: High / Medium / Low / No visuals
```
---

## Шаг 2.5: Сканирование по шаблону

Прежде чем выставлять оценку, отсканируйте стенограмму на предмет соответствия известным шаблонам ошибок. Это обеспечивает объективный контрольный список, который не требует от тренера органического «замечания» проблем.

### Контрольный список обнаружения

| Анти-паттерн | Эвристика обнаружения | Серьезность | Ссылка на исправление |
|---|---|---|---|
| **Беспорядочный** | Любой ответ >3 минут/>300 слов без проверки и паузы | Высокий | Ограничительная дрель по лестнице |
| **Вербальные костыли** | Одна и та же фраза-вставка («Итак, в общем...», «В конце дня...») встречается в ответах более 3 раз | Средний | Запись и воспроизведение — осведомленности зачастую достаточно |
| **"Мы" по умолчанию** | >50% глаголов действия в ответе используют «мы» вместо «я» | Высокий | Я/мы проверяем учения |
| **Никогда не уточняет** | Кандидат не задает уточняющих вопросов на протяжении всего собеседования | Средний | Упражнение «вопросы перед ответом» |
| **Избежание конфликтов** | Истории о «вызовах» не содержат реальных разногласий, напряжения или неудач | Высокий | Натяжно-шахтная буровая установка |
| **Уклонение от вопроса** | Ответ касается связанной темы, но не того, что на самом деле было задано | Высокий | Упражнение по расшифровке вопросов |
| **Чрезмерные требования** | Заявления о влиянии без конкретной роли или «Я», заменяющее очевидные командные усилия | Высокий | Практика ограничений (добавление реалистичных ограничений) |
| **Скрытый жаргон** | >5 терминов, специфичных для предметной области, на 100 слов без объяснения простым языком | Средний | Упражнение «Объясни 10-летнему ребенку» |
| **Изгородь с фронтальной загрузкой** | Ответ начинается с «Думаю, может быть...», «Трудно сказать, но...», «Я не уверен, что...» | Средний | Практика открытия линии |
| **История переработки** | Одна и та же история используется для более чем двух разных вопросов | Средний | Анализ пробелов в Storybank |
| **Резкий финал** | Ответ прекращается без воздействия/результата/вывода — просто затихает | Средний | Упражнение «Посадите самолет»: отработайте последние 15 секунд |
| **Режим монолога** | Ответы в среднем >2 минут без пауз, проверок и чтения сигналов интервьюера | Средний | Практика чтения сигналов |
| **Отсутствует «ну и что»** | В истории есть действия, но она никогда не связана с тем, почему это имело значение | Высокий | Цепная ударная дрель |
| **Защитное отклонение** | При нажатии на слабость перенаправляется на сильные стороны, не признавая разрыва | Средний | Сверло для обработки зазоров |
| **Отрепетированная робототехника** | Ответ звучит заученным — формулировка идентична предыдущей практике, без адаптации к нюансам вопроса | Средний | Вариационная практика: одна и та же история, разные рамки |После сканирования включите обнаруженные антипаттерны в результаты анализа. Каждый обнаруженный шаблон должен указывать, какое устройство (Q#, E#, P#, CS#) его вызвало, и ссылаться на конкретное исправление.

### Антишаблоны, специфичные для формата

В дополнение к поведенческим антипаттернам, описанным выше, обратите внимание на следующие шаблоны, специфичные для формата:

**Антипаттерны панельного интервью:**

| Анти-паттерн | Эвристика обнаружения | Серьезность | Исправить |
|---|---|---|---|
| **Играет одному интервьюеру** | Более 70% сигналов зрительного контакта/вовлечения направлены на одного участника дискуссии | Высокий | Практикуйте распределение внимания. Адресуйте дальнейшие действия задавшему вопрос, а затем снова подключитесь к панели. |
| **Игнорирует молчаливого наблюдателя** | Один участник дискуссии не задает никаких вопросов, а кандидат никогда на них не отвечает | Средний | Активно привлекайте тихих участников дискуссии: «Мне было бы интересно узнать ваше мнение по этому поводу». |
| **Непостоянная глубина** | Ответы сильно различаются по глубине у разных участников дискуссии (подробные для старших, тонкие для младших) | Средний | Калибруйте глубину вопроса, а не предполагаемое старшинство спрашивающего. |
| **Без перекрестных ссылок** | Кандидат никогда не связывает ответ с вопросом предыдущего участника | Низкий | Создайте повествовательную цепочку: «Опираясь на то, что [имя] спросил ранее...» |

**Антишаблоны системного проектирования:**

| Анти-паттерн | Эвристика обнаружения | Серьезность | Исправить |
|---|---|---|---|
| **Пропускает область действия** | Кандидат сразу приходит к решению в течение первых 2 минут, уточняющих вопросов нет | Высокий | Упражнение на поиск разъяснений. Первые 3-5 минут должны быть вопросы. |
| **Фиксация раствора** | Придерживается одного подхода без изучения альтернатив | Высокий | Компромиссное артикуляционное упражнение. Назовите 2+ подхода перед совершением. |
| **Тихие размышления** | Длинные паузы (30+) без описания мыслительного процесса | Средний | Упражнение «Мышление вслух». Расскажите, даже если вы не уверены. |
| **Игнорирует зонды** | Интервьюер задает уточняющий вопрос, кандидат продолжает идти исходным путем | Высокий | Практика чтения сигналов. Относитесь к зондам как к необходимым шарнирам. |
| **Нет тайм-менеджмента** | Тратит более 60% времени на одну фазу, спешит или пропускает другие | Средний | Практика поэтапного темпа с четкими целями по времени. |
| **Блеф на неизвестных** | Заявляют о знании систем/концепций, которые они явно не понимают | Высокий | Упражнение на честность: «Я меньше знаком с X, но вот как бы я подошел к его изучению...» |

**Технические и поведенческие антипаттерны:**| Анти-паттерн | Эвристика обнаружения | Серьезность | Исправить |
|---|---|---|---|
| **Спутанность режимов** | Дает поведенческий ответ на технический вопрос или наоборот | Высокий | Упражнение с переключением режимов. Прежде чем ответить, определите тип вопроса. |
| **Однорежимное доминирование** | 80%+ времени собеседования проводится в одном режиме, несмотря на смешанный формат | Средний | Практика баланса. Намеренно переключайте режимы. |
| **Без интеграции** | Никогда не связывает технические решения с поведенческим контекстом и наоборот | Средний | Упражнение по интеграции: «Технический выбор связан с моим лидерским подходом, потому что...» |
| **Энергетическая скала** | Производительность заметно падает во втором режиме (обычно техническом → поведенческом) | Средний | Практика выносливости. Проводите смешанные занятия продолжительностью более 45 минут. |

**Кейс (по инициативе кандидатов)

| Анти-паттерн | Эвристика обнаружения | Серьезность | Исправить |
|---|---|---|---|
| **Принудительное использование платформы** | Применяет именованную структуру (MECE, 5 сил Портера), которая не соответствует задаче | Высокий | Мышление, ориентированное на проблему. Поймите проблему, прежде чем переходить к фреймворку. |
| **Анализ без гипотез** | Просматривает данные/анализ, не указывая, что они ожидают найти | Средний | Практика «Гипотеза прежде всего»: «Я ожидаю увидеть X, потому что Y. Позвольте мне проверить…» |
| **Игнорирует новую информацию** | При получении дополнительных данных не обновляет анализ или выводы | Высокий | Упражнение на гибкость. Практикуйте поворот, когда предположения подвергаются сомнению. |
| **Нет рекомендаций** | Тщательно анализирует, но никогда не дает рекомендаций | Высокий | Упражнение «Если бы вам пришлось решать прямо сейчас». Вынуждайте давать рекомендации с обоснованием. |
| **Избегание математики** | Пропускает количественный анализ, если доступны цифры | Средний | Количественная практика. Предварительные расчеты повышают доверие. |

**Антипаттерны презентационного раунда:**| Анти-паттерн | Эвристика обнаружения | Серьезность | Исправить |
|---|---|---|---|
| **Чтение слайдов** | Кандидат читает слайды дословно или почти дословно вместо того, чтобы говорить с ними | Высокий | Практика «Слайд как подсказка». Каждый слайд должен вызывать устное повествование, а не чтение. Слайд — это план; говорящий – это история. |
| **Превышение времени** | Превышает отведенное время, торопит последние слайды или полностью пропускает закрытие | Высокий | Калибровка времени. Практикуйтесь с таймером. Цель: 130–150 слов в минуту. Создайте «сжатую версию» каждого раздела на случай, если времени будет мало. |
| **Без открывающего крючка** | Переходит непосредственно к контенту, не объясняя, почему презентация важна или что узнает аудитория | Средний | Сверло с открывающимся крюком. Первые 30 секунд должны ответить: «Почему меня это должно волновать?» перед «Вот что я сделал». |
| **Отклонение вопросов и ответов** | Избегает прямых ответов на вопросы, переходит к отрепетированным тезисам разговора или занимает оборонительную позицию на допросе | Высокий | Практика вопросов и ответов с прогнозируемыми вопросами. Признайте вопрос, ответьте прямо, а затем перейдите к подтверждающим доказательствам. |
| **Монотонная доставка** | Никакого изменения акцента, энергии или темпа — презентация звучит как читаемый отчет | Средний | Практика энергокартирования. Определите 2–3 ключевых момента презентации и отрепетируйте сознательное смещение акцентов в этих точках. |
| **Отсутствует «ну и что»** | Представляет данные, процессы или методологию без привязки к влиянию на бизнес или актуальности для аудитории | Высокий | Цепная ударная дрель. Каждый раздел должен заканчиваться словами: «Это важно, потому что…» |

---

## Шаг 3: Многообъективная оценка

Пропустите анализируемый текст через оценочную призму. **Важно**: какие линзы вы используете, зависит от дерева решений после оценки в `references/commands/analyze.md`. Если основное узкое место выявлено после первоначальной оценки, определите масштаб анализа соответствующим образом, а не запускайте все четыре объектива механически. Всегда следуйте стандарту поиска доказательств от SKILL.md. **Для режима быстрой подготовки**: запустите только Lens 1 и перейдите к дельта-листу.

### Корректировка веса по формату

Ссылайтесь на Таксономию формата интервью `references/commands/prep.md` как на единственный источник достоверной информации о корректировках веса для конкретного формата. Таблица ниже представляет собой удобную копию — если она конфликтует с prep.md, побеждает prep.md:| Формат | Основные параметры (наибольший вес) |
|---|---|
| Поведенческий экран | Структура, Актуальность |
| Глубокий поведенческий | Содержание, Достоверность |
| Проектирование системы / практический пример | Структура, Вещество |
| Панель | Все размеры + Адаптивность |
| Технический + поведенческий микс | Вещество, Структура |
| Презентационный раунд | Структура, дифференциация |
| Штанга / культура подходит | Доверие, дифференциация |
| Менеджер по подбору персонала 1:1 | Релевантность, дифференциация |

### Дополнительные параметры оценки для неповеденческих форматов

Они дополняют пять основных измерений, а не заменяют их. Оцените каждый балл от 1 до 5, если формат соответствует:

**Проектирование системы / практический пример:**
- **Наглядность процесса** (1–5): насколько четко кандидат описал свой мыслительный процесс. 1 = молчание/непрозрачность, 5 = каждое решение объясняется в режиме реального времени.
- **Качество определения объема** (1–5): насколько хорошо кандидат определил проблему перед ее решением. 1 = переход к решению, 5 = тщательный анализ с уточняющими вопросами.
- **Артикуляция компромисса** (1–5): Насколько хорошо кандидат назвал компромиссы и альтернативы. 1 = единый подход без альтернатив, 5 = несколько подходов по сравнению с явным компромиссным обоснованием.
- **Адаптируемость** (1–5): насколько хорошо кандидат реагировал на запросы, перенаправления и новые ограничения. 1 = жесткий, 5 = плавные повороты.

**Панель:**
- **Адаптация интервьюера** (1–5): Насколько хорошо кандидат выверил ответы разных участников дискуссии. 1 = одинаковый стиль для всех, 5 = четко адаптированная глубина, тон и фокус для каждого интервьюера.
- **Энергетическая последовательность** (1–5): Насколько хорошо кандидат поддерживал вовлеченность на протяжении всей групповой сессии. 1 = видимая усталость/отстраненность, 5 = постоянная энергия во всем.
- **Перекрестные ссылки** (1–5): насколько хорошо кандидат связал темы между вопросами разных участников дискуссии. 1 = рассматривал каждый вопрос отдельно, 5 = выстраивал повествовательные связи.

**Технический + поведенческий микс:**
- **Гибкость переключения режима** (1–5): насколько четко кандидат переключался между техническим и поведенческим режимами. 1 = сбивчиво или резко, 5 = плавные переходы.
- **Качество интеграции** (1–5): Насколько хорошо кандидат связал технические решения с поведенческим контекстом. 1 = нет соединения, 5 = естественно сплели оба вместе.
- **Траектория энергии** (1–5): как сохранялась энергия/качество на протяжении всей смешанной сессии. 1 = значительное снижение во второй половине года, 5 = сохранилось или улучшилось.**Презентационный раунд:**
- **Управление плотностью контента** (1–5): насколько хорошо кандидат откалибровал глубину в соответствии с временными ограничениями. 1 = критические разделы были значительно пройдены или пройдены в спешке, 5 = естественный темп с продуманным распределением времени между разделами.
- **Сюжетная линия** (1–5): насколько хорошо презентация рассказывает связную историю от начала до конца. 1 = отдельные секции без сквозной линии, 5 = привлекательная дуга, где каждая секция построена на основе предыдущей, а закрывающаяся часть привязана к открывающемуся крючку.
- **Адаптируемость вопросов и ответов** (1–5): насколько хорошо кандидат отвечал на вопросы аудитории. 1 = оборонительная реакция, уклончивость или потеря самообладания, 5 = изящное взаимодействие, демонстрирующее глубину, превосходящую подготовленный контент.
- **Калибровка аудитории** (1–5): насколько контент соответствует уровню и интересам аудитории. 1 = совершенно неправильный уровень (слишком технический для руководителей, слишком высокий для инженеров), 5 = четко адаптированный, с подходящими для аудитории формулировками, примерами и глубиной.

### Объектив 1: Взгляд менеджера по найму

Человек, который будет защищать вас (или нет) в комитете по найму.```
LENS 1: HIRING MANAGER PERSPECTIVE

Evaluate as the hiring manager for this role.

For each answer, score 1-5 on:
- Substance
- Structure
- Relevance
- Credibility
- Differentiation

After each answer:
- One concrete improvement (specific missing evidence, numbers, or tradeoffs)
- Root cause pattern (if detected — see rubrics-detailed.md root cause taxonomy)
- Would this answer move candidate forward? Y/N/Maybe + brief why

SUMMARY TABLE:
| Q# | Sub | Str | Rel | Cred | Diff | Avg | Forward? | Root Cause | Top Fix |
|----|-----|-----|-----|------|------|-----|----------|------------|---------|

SIGNAL-READING ANALYSIS:
- Questions where follow-up indicated interest (positive signal):
- Questions where interviewer moved on quickly (likely negative):
- Questions where interviewer redirected (answer wasn't landing):
- Missed signals: moments where the candidate should have adapted but didn't

ANTI-PATTERNS DETECTED:
[List from Step 2.5 scan with Q# references]

FINAL OUTPUT:
- Hire Signal: Strong Hire / Hire / Mixed / No Hire
- 3 strongest answers (why they worked)
- 3 weakest answers (specific gaps + root cause patterns)
- Biggest concern about this candidate
- One-sentence justification for your decision
- Primary bottleneck dimension → triage recommendation (see Post-Scoring Decision Tree in `references/commands/analyze.md`)
```
### Линза 2: Специалист-скептик

Старший практикующий проверяет, действительно ли вы знаете, о чем говорите.```
LENS 2: SKEPTICAL SPECIALIST

Evaluate as a skeptical senior specialist in the candidate's field.

For each technical or domain-specific answer, identify where they:
- Hand-waved technical details
- Skipped constraints or edge cases
- Over-claimed impact without methodology
- Used jargon to hide lack of depth
- Missed obvious alternatives or tradeoffs

For each answer:
- One "dig deeper" question that would expose gaps
- Score 1-5: Technical accuracy
- Score 1-5: Depth vs breadth (1=too shallow, 5=appropriate)
- Score 1-5: Acknowledgment of tradeoffs

FLAG: Answers that would make a specialist skeptical
```
### Линза 3: Согласование ценностей компании

Проверка, демонстрирует ли кандидат конкретные принципы компании.```
LENS 3: VALUES ALIGNMENT

Score each answer on alignment with company principles.

FOR EACH PRINCIPLE:
- Which answers touched it? (list Q#s)
- How explicitly? (implicit mention / direct example)
- Score 1-5: How well the story demonstrates this value

IDENTIFY:
- Principles completely missed
- Principles mentioned but not demonstrated with evidence
- Strongest principle alignment (which answers showed which values best)

SUGGEST:
For each missed principle:
1. Which existing story could have surfaced it?
2. How to weave it into an answer next time (specific insertion point)
```
### Объектив 4: Калибровка (краткость и четкость)

Проверка того, не являются ли ответы слишком длинными, перегруженными жаргоном или запутанными.```
LENS 4: CALIBRATION

For each answer >150 words, create:
- 30-second version (≤80 words)
- 90-second version (≤220 words)
- "Explain to a 10-year-old" version

ANALYZE:
- Jargon density (domain-specific terms per 100 words)
- Hedging frequency (count: "maybe," "kind of," "sort of," "I think")
- Passive voice usage (flag sentences)
- Meandering score 1-5 (5 = every sentence advances the answer)

FOR EACH ANSWER:
- Core point (one sentence)
- Redundant phrases or tangents to cut
- Where to cut without losing substance

SUMMARY:
- Average answer length: ___ words
- % of answers that meandered (score <3): ___
- Most common filler phrases: ___
- Clarity grade: A / B / C / D
```
---

## Шаг 4: Синтезируйте дельту интервью

Объедините все результаты объектива в полезную сводку.```
INTERVIEW DELTA SHEET

INTERVIEW: [Company] - [Role] - [Date]

OVERALL SCORES:
Substance: ___ | Structure: ___ | Relevance: ___ | Credibility: ___ | Differentiation: ___
Calibration band: [early career / mid-career / senior/lead / executive]
Hire Signal: Strong Hire / Hire / Mixed / No Hire

PRIMARY BOTTLENECK: [dimension]
TRIAGE PATH: [coaching path chosen per Post-Scoring Decision Tree in references/commands/analyze.md]

ANTI-PATTERNS DETECTED: [list with Q# references]

3 FIXES FOR NEXT TIME (ordered by triage priority):
1. [Specific behavior] - because [evidence from this interview]
   Root cause: [pattern from taxonomy]
   Drill: [exact practice exercise]
2. [Behavior] - because [evidence]
   Root cause: [pattern]
   Drill: [exercise]
3. [Behavior] - because [evidence]
   Root cause: [pattern]
   Drill: [exercise]

2 STORIES TO RETIRE (OR REWORK):
1. [Story title] - Why: overused / thin evidence / low differentiation
2. [Story title] - Why: [reason]

1 NEW STORY TO ADD:
Gap observed: [competency missing]
Suggested source: [which experience could fill this]

CARRY FORWARD:
[One strong behavior from this interview to maintain]

INTERVIEW FORMAT: [detected format]
FORMAT-SPECIFIC ANALYSIS: [include if non-behavioral — see below]

REFLECTION PROMPTS:
- How does this feedback compare to your gut feeling about the interview?
- Of the growth areas above, which feels most within your control?
- What would it look like to practice that this week?

NEXT ACTIONS (co-created with candidate):
[ ] Update storybank: retire [stories], add [new story]
[ ] Run drill: [specific exercise for priority growth area]
[ ] Practice: [weak unit from this interview] until scores 4+
[ ] Review before next interview: this delta sheet
```
### Разделы разностного листа для конкретного формата

Включите соответствующий раздел ниже, если формат интервью не поведенческий:

**Проектирование системы / практический пример:**```
FORMAT-SPECIFIC ANALYSIS: System Design

PROCESS SCORES:
Process Visibility: ___ | Scoping Quality: ___ | Tradeoff Articulation: ___ | Adaptability: ___

PHASE ANALYSIS:
- Scoping %: ___% of total time (target: 15-25%)
- Clarification questions: ___ (0 = red flag)
- Tradeoff breakdown: ___ unprompted / ___ when probed
- Phase progression: [managed time well / rushed end / stuck in one phase]
- Strongest phase: [which phase and why]
- Weakest phase: [which phase and why]
```
**Панель:**```
FORMAT-SPECIFIC ANALYSIS: Panel

PANEL SCORES:
Interviewer Adaptation: ___ | Energy Consistency: ___ | Cross-Referencing: ___

PANEL DYNAMICS:
- Interviewer engagement: [who was most engaged, who was least]
- Strongest exchange: E___ — [why it worked]
- Weakest exchange: E___ — [what went wrong]
- Cross-interviewer threads: [moments where the candidate connected questions across panelists]
- Energy arc: [how energy changed across the session]
```
**Технический + поведенческий микс:**```
FORMAT-SPECIFIC ANALYSIS: Technical + Behavioral Mix

MIX SCORES:
Mode-Switching Fluidity: ___ | Integration Quality: ___ | Energy Trajectory: ___

MODE ANALYSIS:
- Behavioral mode average: Sub ___ / Str ___ / Rel ___ / Cred ___ / Diff ___
- Technical mode average: Sub ___ / Str ___ / Rel ___ / Cred ___ / Diff ___
- Stronger mode: [behavioral / technical / balanced]
- Transition moments: [where mode switches happened and quality of each]
- Integration highlights: [moments where the candidate connected both modes]
```
---

## Шаг 5: Обновите состояние обучения

После анализа обновите `coaching_state.md` в соответствии с триггерами обновления состояния в SKILL.md:

1. **История оценок**. Добавьте строку с оценками на собеседовании, Тип: собеседование и Сигнал найма из общей оценки.
2. **Стратегия активного коучинга**: напишите или обновите стратегию на основе решения о сортировке (см. шаг 15 в `references/commands/analyze.md`). Сохраняйте предыдущие подходы при изменении стратегии.
3. **Журнал сеанса**: добавьте запись об этом сеансе анализа.
4. **Банк историй**: примените все рекомендации по переработке/удалению/добавлению из дельта-листа.

Следующие метрики шаблонов фиксируются в выходных данных анализа (сканирование по шаблонам, системы показателей по каждому ответу и дельта-лист), а не в отдельном трекере. Ключевые показатели, на которые следует обратить внимание в будущих сессиях:
- Средние баллы по каждому измерению
- Обнаружены антишаблоны (со ссылками на Q#)
- Топ-3 слабых компетенций
- Топ-3 часто используемых костылей
- Тенденция по сравнению с предыдущим анализом (улучшение/застой/снижение по каждому параметру)