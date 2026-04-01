# help — Рабочий процесс справочника команд

### Логика

Когда пользователь вводит «help», генерируется контекстно-зависимое руководство по командам, а не просто статический список.1. **Прочитайте `coaching_state.md`**, чтобы понять, на каком этапе своего тренерского пути находится кандидат.
2. **Покажите полное руководство по командам** (см. схему вывода ниже) с подкомандами и ключевыми функциями для каждой команды.
3. **Выделите 2–3 наиболее актуальные команды прямо сейчас** в зависимости от состояния тренировки:
   - Если тренерского статуса не существует: выделите «начало».
   - Если банк историй пуст: выделите «истории».
   - Если в банке историй более 5 историй, но нет анализа повествовательной идентичности: выделите «истории» (упомяните вариант 7).
   - Если собеседование запланировано в течение 48 часов: выделите «ажиотаж» и «подготовка».
   – Если стенограммы существуют, но не были проанализированы: выделите «анализировать».
   – Если существует более 3 сеансов с оценкой: выделите «прогресс».
   - Если предложение поступило: выделите «переговоры».
   - Если прогресс тренировки показывает, что кандидат не завершил этап 1: выделите «лестницу практики».
   - Если LinkedIn Analysis не существует, а в банке историй более 3 историй: выделите `linkedin`
   - Если LinkedIn Analysis существует и в целом имеет статус «Слабый» или «Требует доработки»: выделите `linkedin` (упомяните ожидающие исправления)
   - Если оптимизация резюме не существует и запуск был запущен: выделите `resume`
   - Если оптимизация резюме существует и в целом она «Слабая» или «Требует доработки»: выделите «резюме» (упомяните ожидающие исправления).
   - Если Заявление о позиционировании не существует, а в банке историй более 3 историй: выделите «питч».
   – Если заявление о позиционировании существует и в статусе согласованности имеются пробелы: выделите «питч» (упомяните об обновлении).
   - Если стратегия информационно-пропагандистской деятельности не существует, стартовый этап уже запущен, а анализ LinkedIn не является «слабым»: выделите «охват»
   - Если кандидат упоминает сообщение рекрутера, холодную разъяснительную работу, налаживание связей или информационное интервью: выделите слово «разъяснительная работа».
   – Если кандидат упоминает отзыв рекрутера или результат в разговоре, но не использовал «обратную связь», выделите «обратная связь».
   - Если JD был упомянут или вставлен, но JD Analysis не существует и подготовка не была запущена: выделите `decode`
   - Если кандидат упоминает сравнение объявлений о вакансиях или решение о том, на какую должность ему претендовать: выделите «декодирование» (пакетная сортировка).
   - Если в циклах интервью отображается формат раунда презентации (из подготовки или обнаружения формата), выделите «настоящее».
   - Если кандидат упоминает презентацию, обзор портфолио или презентацию кейса: выделите слово «присутствует».
   - Если стратегия вознаграждения не существует, и кандидат упоминает проверку рекрутера или вопрос о зарплате: выделите слово «зарплата».
   - Если кандидат упоминает зарплатные ожидания, вопросы о компенсации или «что мне сказать об оплате»: выделите слово «зарплата».
4. **Диагностический маршрутизатор**. Если кандидат описывает проблему, а не запрашивает команду, направьте его в нужное место:
   - «Я не получаю обратные вызовы» → «возобновить» (проблемы с ATS) или «декодировать» (неправильные роли)
   - «Я продолжаю проваливать первые раунды» → «анализировать» (если существуют стенограммы) или «практиковаться по лестнице» (если нет данных)
   - «Я замираю на собеседованиях» → «лестница практики» (наращивание количества представителей) + «хайп» (поднятие настроения перед собеседованием)
   - «Не знаю, что сказать по поводу зарплаты» → `зарплата`
   - «У меня есть предложение, но оно кажется заниженным» → «переговоры»
   - «Не знаю, с чего начать» → `начало`
   - «Я не получаю ответа от сети» → «outreach» + «linkedin» (ворота качества профиля)
   - «Я продолжаю доходить до финальных раундов, но не получаю предложений» → «прогресс» (анализ закономерностей) + «проблемы» (что вас сбивает с толку)
   - «У меня презентация» → «настоящее»
   Не просто перечисляйте команду — объясните, ПОЧЕМУ эта команда решает конкретную проблему.
5. **Показать текущую сводку состояния коучинга** (если она существует): трек, диапазон стажа, этап тренировки, количество историй, количество реальных собеседований и активные циклы компании.
6. **Завершите подсказкой**: «Над чем бы вы хотели поработать?»### Схема вывода```markdown
## Command Guide

### Getting Started
| Command | What It Does |
|---|---|
| `kickoff` | Set up your profile, choose a track (Quick Prep or Full System), and get a prioritized action plan based on your timeline |

### Interview Round Prep
| Command | What It Does |
|---|---|
| `research [company]` | Company research + structured fit assessment (seniority, domain, trajectory) before committing to full prep. Three depth levels: Quick Scan (target list building), Standard (default), Deep Dive (high-priority targets). Includes structured search protocol and claim verification. |
| `decode` | JD decoder + batch triage — analyze job descriptions with confidence-labeled interpretations, 6 decoding lenses, fit assessment, and recruiter verification questions. Compare 2-5 JDs to find your sweet spot and prioritize applications. Three depth levels: Quick Scan, Standard, Deep Decode. Includes a teaching layer so you learn to read JDs yourself. At Level 5 Deep: Challenge Protocol. |
| `prep [company]` | Full prep brief — role-fit assessment (5 dimensions — identifies frameable vs. structural gaps), format guidance, culture read, interviewer intelligence (from LinkedIn URLs), predicted questions (weighted by real questions from past interviews when available), story mapping, and a day-of cheat sheet |
| `concerns` | Anticipate likely interviewer concerns about your profile + counter-evidence strategies |
| `questions` | Generate 5 tailored, non-generic questions to ask your interviewer |
| `present` | Presentation round coaching — narrative structure, timing calibration, opening/closing optimization, Q&A preparation (10 predicted questions with answer strategies). Works for system design presentations, business cases, portfolio reviews, strategy presentations, and technical deep dives. Three depth levels: Quick Structure, Standard, Deep Prep. At Level 5 Deep: Challenge Protocol. |

### Application Materials
| Command | What It Does |
|---|---|
| `linkedin` | LinkedIn profile optimization — section-by-section audit, recruiter search optimization, content strategy. Three depth levels: Quick Audit, Standard, Deep Optimization. At Level 5 Deep: Challenge Protocol applied to your profile. |
| `resume` | Resume optimization — ATS compatibility, recruiter scan, bullet quality, seniority calibration, keyword coverage, structure, concern management, consistency. Three depth levels: Quick Audit, Standard, Deep Optimization. Storybank-to-bullet pipeline when storybank exists. JD-targeted optimization when JD available. At Level 5 Deep: Challenge Protocol applied to your resume. |
| `pitch` | Core positioning statement — your "who I am" in 10-90 seconds. Foundational artifact with context variants (interview TMAY, networking, recruiter call, career fair, LinkedIn hook). Three depth levels: Quick Draft, Standard, Deep Positioning. Saved to coaching state and referenced by resume, linkedin, and outreach for consistency. At Level 5 Deep: Challenge Protocol. |
| `outreach` | Networking outreach coaching — cold LinkedIn, warm intros, informational interview asks, recruiter replies, follow-ups, referral requests. Three depth levels: Quick (templates), Standard (critique + rewrite), Deep (full campaign strategy). Consumes Positioning Statement from `pitch`. At Level 5 Deep: Challenge Protocol. |

### Pre-Conversation
| Command | What It Does |
|---|---|
| `salary` | Early/mid-process comp coaching — scripts for "what are your salary expectations?", salary history deflection, range construction from research, total comp education. Covers application forms through pre-offer discussions. Hands off to `negotiate` when a formal offer arrives. Three depth levels: Quick Script, Standard, Deep Strategy. At Level 5 Deep: Challenge Protocol. |
| `hype` | Pre-interview boost — 60-second hype reel, 3x3 sheet (concerns + counters + questions), warmup routine, and mid-interview recovery playbook |

### Practice and Simulation
| Command | What It Does |
|---|---|
| `practice` | Drill menu with 8 gated stages + standalone retrieval. Sub-commands: `ladder` (constraint drills), `pushback` (handle skepticism), `pivot` (redirect), `gap` (no-example moments), `role` (specialist scrutiny), `panel` (multiple personas), `stress` (high-pressure), `technical` (system design communication). Standalone: `retrieval` (rapid-fire story matching). Includes interviewer's perspective on every round. At Level 5: expanded inner monologue from the interviewer's perspective, challenge notes on rounds 3+, and optional warmup skip. |
| `mock [format]` | Full 4-6 question simulated interview with holistic arc feedback and interviewer's inner monologue. Formats: `behavioral screen`, `deep behavioral`, `panel`, `bar raiser`, `system design/case study`, `technical+behavioral mix` |

### Analysis and Scoring
| Command | What It Does |
|---|---|
| `analyze` | Paste a transcript for per-answer 5-dimension scoring, triage-based coaching (branches based on YOUR bottleneck), answer rewrites showing what a 4-5 version looks like, intelligence updates (tracks questions and patterns across interviews), and a specific recommended next step |
| `debrief` | Post-interview rapid capture — works same-day with or without a transcript. Captures questions, interviewer signals, stories used, recruiter feedback, and checks for question patterns from past interviews |

### Storybank
| Command | What It Does |
|---|---|
| `stories` | Full storybank management. Options: `view`, `add` (guided discovery, not just "tell me a story"), `improve` (structured upgrade with before/after), `find gaps` (prioritized by target roles), `retire`, `drill` (rapid-fire retrieval practice), `narrative identity` (extract your 2-3 core career themes and see how every story connects). At Level 5: stories get red-teamed with 5 challenge lenses after add/improve. |

### Progress and Tracking
| Command | What It Does |
|---|---|
| `progress` | Score trends, self-assessment calibration (are you an over-rater or under-rater?), storybank health, outcome tracking (correlates practice scores with real interview results), targeting insights (correlates rejection patterns with company type and fit assessments), question-type performance analysis, accumulated patterns from real interviews, and coaching meta-check |

### Post-Interview
| Command | What It Does |
|---|---|
| `feedback` | Capture recruiter feedback, report outcomes (advanced/rejected/offer), correct assessments, add context the system should remember, or give meta-feedback on the coaching itself. The system learns from your real interview experiences over time. |
| `thankyou` | Thank-you note and follow-up drafts tailored to the interview |
| `negotiate` | Post-offer negotiation coaching — market analysis, strategy, exact scripts, and fallback language |
| `reflect` | Post-search retrospective — journey arc, breakthroughs, transferable skills, archived coaching state |

### Meta
| Command | What It Does |
|---|---|
| `help` | This command guide (context-aware recommendations based on where you are) |

---

## Where You Are Now
[Brief coaching state summary — track, seniority, drill stage, story count, active company loops — or "No coaching state found. Run `kickoff` to get started."]

## Recommended Next
**Recommended next**: `[command]` — [why this is the highest-leverage move right now]. **Alternatives**: `[command]`, `[command]`, `[command]`

---

## Tips
- Share a real resume during `kickoff` — it powers everything downstream (concerns, positioning, story seeds)
- Use `debrief` the same day as a real interview — capture signals while they're fresh
- When you hear back from a recruiter — good or bad — run `feedback` to capture it. The system learns from your real interview experiences over time.
- Run `progress` weekly — it tracks your self-assessment accuracy, not just scores
- After real interviews, log outcomes — the system correlates practice scores with real results
- Set your feedback directness level (1-5) during `kickoff` — the diagnosis stays the same, only the delivery changes
- Run `research` before applying — the fit assessment helps you focus on roles where you're competitive, and flags stretch targets that need extra prep
- For high-priority targets, ask for a deep dive research — `research [company]` and mention you want comprehensive intelligence
- Paste raw transcripts from any tool (Otter, Zoom, Grain, etc.) — the system auto-detects the format and cleans it up
- The coach will recommend a specific next step after every command — just follow the flow if you're not sure what to do next
- Your LinkedIn profile is a search engine, not a resume. Run `linkedin` to optimize for how recruiters actually find candidates.
- Your resume is ranked by ATS before a human ever sees it. Run `resume` to optimize for both machines and the 7-second recruiter scan.
- Your pitch is the consistency anchor for everything else. Run `pitch` before `resume` or `linkedin` — it gives both commands a positioning reference to align to.
- Referrals account for 30-50% of hires. Run `outreach` to craft messages that actually get responses — not generic templates.
- Don't apply to every JD that looks interesting. Run `decode` to analyze the language, assess fit, and decide where your time is best spent — or compare multiple JDs with batch triage.
- Presentation rounds are won in the preparation, not the delivery. Run `present` to structure your content, calibrate timing, and prepare for Q&A before you ever open PowerPoint.
- The highest-leverage salary moment is the recruiter screen, not the offer negotiation. Run `salary` before that first call so you don't anchor yourself low.
- Everything saves automatically to `coaching_state.md` — pick up where you left off, even weeks later

What would you like to work on?
```
