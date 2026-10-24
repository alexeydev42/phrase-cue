const en = {
  common: {
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    search: 'Search',
  },

  navigation: {
    episode: 'Episode',
    library: 'Library',
    study: 'Study',
    settings: 'Settings',
  },

  episode: {
    findPhrase: 'Find a phrase',
    approximateTimecodeHint: 'Enter an approximate timecode from the episode.',
    activeEpisode: 'Active episode',
    currentEpisode: 'Current episode',
    changeEpisode: 'Change episode',
    enterApproximateTimecode: 'Enter approximate timecode',

    searchResults: 'Search results',
    searchResultsHint: 'Search to see subtitle cues around the selected timecode.',
    noSubtitleList: 'No subtitle list yet',
    noSubtitleListHint: 'Enter a timecode and press Search.',

    nearbyCues: 'Nearby subtitle cues',
    nearbyCuesHint: 'Three cues before the specified time, the nearest cue, and three after.',

    noActiveEpisode: 'No active episode',
    noActiveEpisodeHint: 'Choose an episode to start finding phrases.',
    chooseEpisode: 'Choose episode',

    noShowsYet: 'No shows yet',
    noShowsYetHint: 'Add a show and import subtitles to get started.',
    translationNotice:
      'Automatic translations are limited to keep running costs under control. If the limit is reached, you can save a phrase without translation and translate it later.',
    addShow: 'Add show',

    loadEarlier: 'Show earlier cues',
    loadLater: 'Show later cues',
    timeStampPlaceholder: 'mm:ss',
  },

  selectPhrase: {
    title: 'Select phrase',
    selectedCues: 'Selected cues · {count} of 3',
    previous: '+ Previous',
    next: '+ Next',
    resetSelection: 'Reset selection',
    selectionHint: 'Choose up to three consecutive cues.',

    draftLabel: 'Phrase draft',
    draftHint: 'Edit the draft if you want to remove unnecessary subtitle text.',

    translate: 'Translate',
    saveWithoutTranslation: 'Save without translation',

    phraseLabel: 'Phrase',
    translationLabel: 'Translation',
    translating: 'Translating…',
    translationFailed: 'Translation failed',
    translationLimitReached:
      'Translation limit reached. You can save the phrase without translation and translate it later.',
    saveFailed: 'Could not save the phrase. Please try again.',
    saving: 'Saving…',

    phraseSaved: 'Phrase saved',
    savedWithoutTranslation: 'Saved without translation',

    cueNotFound: 'Selected subtitle cue not found.',
    characterLimitExceeded: 'Shorten the phrase to 300 characters to translate it.',
  },

  library: {
    title: 'Saved phrases',

    tabs: {
      new: 'New',
      learning: 'Learning',
      learned: 'Learned',
    },

    emptyStates: {
      new: {
        title: 'No new phrases yet',
        hint: 'Find and save a phrase from an episode to see it here.',
      },
      learning: {
        title: 'No phrases in Learning',
        hint: 'Move phrases from New to start learning them.',
      },
      learned: {
        title: 'No learned phrases yet',
        hint: 'Phrases you mark as learned will appear here.',
      },
    },

    newestFirst: 'Newest first',

    statusNew: 'Status: New',
    statusLearning: 'Status: Learning',
    statusLearned: 'Status: Learned',

    startLearning: 'Start learning',
    noTranslation: 'No translation',
    translate: 'Translate',
    learnAgain: 'Learn again',

    deletePhraseTitle: 'Delete phrase?',
    deletePhraseBody: 'This phrase will be permanently removed from the Library.',
    deleteFailed: 'Could not delete the phrase. Please try again.',
    translationLimitReached: 'Translation limit reached. Please try translating this phrase later.',
  },

  study: {
    learningPhrases: 'Learning phrases',
    currentCycle: 'current cycle',
    showTranslation: 'Show translation',
    nextPhrase: 'Next phrase',
    learned: 'Learned',

    noPhrases: 'No phrases to study',
    noPhrasesHint: 'Move phrases from New to Learning to start a study cycle.',
    goToNew: 'Go to New',
    updateFailed: 'Could not update the phrase. Please try again.',
  },

  settings: {
    title: 'Settings',
    subtitle: 'Interface, learning and local data',

    interfaceSection: 'Interface',
    language: 'Language',

    languageEnglish: 'English',
    languageRussian: 'Русский',

    theme: 'Theme',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',

    learningSection: 'Learning',
    learningLimit: 'Learning limit',
    learningLimitHint: '1–50 · current Learning: {count}',
    learningLimitInvalid: 'Enter a whole number from 1 to 50.',
    saveFailed: 'Could not save the settings. Please try again.',

    localData: 'Local data',
    localDataDescription:
      'Create or restore a JSON backup of saved phrases, subtitles and Learning limit.',

    storedLocally: 'Stored locally',
    storedLocallyHint:
      'Your data is stored on this device. Create a backup to keep a separate copy.',

    learningLimitError: 'Cannot be lower than current Learning count: {count}.',

    aboutTitle: 'About PhraseCue',
    aboutDescription:
      'A personal project for learning English with TV series subtitles, built with React, TypeScript, and Redux Toolkit.',
    developedBy: 'Developed by',
    authorName: 'Alexey Surkov',
    portfolio: 'Portfolio',
    analyticsNotice:
      'Anonymous traffic statistics are collected with Cloudflare Web Analytics. No analytics cookies are used.',
  },

  source: {
    shows: 'Shows',
    yourShows: 'Your shows',
    addShow: 'Add show',

    showTitle: 'Show title',
    showTitlePlaceholder: 'Enter show title',
    saveShow: 'Save show',
    showNotFound: 'Show not found',
    seasonNotFound: 'Season not found',

    seasons: 'Seasons',
    addSeason: 'Add season',
    deleteShow: 'Delete show',
    season: 'Season {number}',
    seasonsCount: 'Seasons: {count}',

    episodes: 'Episodes',
    episode: 'Episode {number}',
    importedSubtitles: 'Imported subtitles',
    episodesImported: 'Episodes imported: {count}',

    importSrt: 'Import SRT',
    importSubtitles: 'Import subtitles',
    chooseSrtFiles: 'Choose .srt files',

    episodeDetected: 'Episode number detected: {number}',
    readyToImport: 'Ready to import',

    episodeNumberNotDetected: 'Episode number not detected',
    episodeNumber: 'Episode number',
    episodeNumberPlaceholder: 'Enter episode number',
    enterEpisodeNumber: 'Enter the episode number to continue.',

    cannotImportFile: 'Cannot import this file',
    invalidSrt: 'Invalid or unreadable SRT. Other files are unaffected.',

    importValidFiles: 'Import valid files',
    importComplete: 'Import complete',
    filesSkipped: 'Files skipped: {count}',

    openEpisode: 'Open episode',
    importedWithWarning: 'Imported with warning · Cues skipped: {count}',
    importMoreSrt: 'Import more SRT',

    subtitlesImported: 'Subtitles imported',
    openingSetsActive: 'Opening this episode sets it as the active episode.',

    deleteEpisode: 'Delete episode',
    deleteEpisodeTitle: 'Delete episode?',
    deleteEpisodeBody:
      'The episode and its imported subtitles will be removed. Saved phrases keep their saved source metadata.',

    seasonNumber: 'Season number',
    seasonNumberPlaceholder: 'Enter season number',
    saveSeason: 'Save season',

    deleteShowTitle: 'Delete show?',
    deleteShowBody:
      'The show, its seasons, episodes, and imported subtitles will be removed. Saved phrases keep their saved source metadata.',

    deleteSeason: 'Delete season',
    deleteSeasonTitle: 'Delete season?',
    deleteSeasonBody:
      'The season, its episodes, and imported subtitles will be removed. Saved phrases keep their saved source metadata.',
  },

  backup: {
    create: 'Create backup',
    restore: 'Restore backup',

    restoreTitle: 'Restore backup?',
    restoreBody:
      'Current shows, subtitles, saved phrases and Learning limit will be replaced. Data will not be merged.',
    restoreAction: 'Restore',

    invalidFile: 'Invalid backup file',
    nothingChanged: 'Nothing was changed.',
    createFailed: 'Could not create the backup. Please try again.',
    restoreFailed: 'Could not restore the backup. Nothing was changed.',
  },

  metadata: {
    seasonEpisode: 'Season {season} · Episode {episode}',
    shortSeasonEpisode: 'S{season} E{episode}',
  },
}

const ru: typeof en = {
  common: {
    back: 'Назад',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    search: 'Найти',
  },

  navigation: {
    episode: 'Эпизод',
    library: 'Библиотека',
    study: 'Изучение',
    settings: 'Настройки',
  },

  episode: {
    findPhrase: 'Найти фразу',
    approximateTimecodeHint: 'Введите примерный таймкод из эпизода.',
    activeEpisode: 'Активный эпизод',
    currentEpisode: 'Текущий эпизод',
    changeEpisode: 'Сменить эпизод',
    enterApproximateTimecode: 'Введите примерный таймкод',

    searchResults: 'Результаты поиска',
    searchResultsHint: 'Выполните поиск, чтобы увидеть реплики рядом с выбранным таймкодом.',
    noSubtitleList: 'Реплики пока не показаны',
    noSubtitleListHint: 'Введите таймкод и нажмите «Найти».',

    nearbyCues: 'Реплики рядом с таймкодом',
    nearbyCuesHint: 'Три реплики до указанного времени, ближайшая к нему и три после.',

    noActiveEpisode: 'Нет активного эпизода',
    noActiveEpisodeHint: 'Выберите эпизод, чтобы искать фразы.',
    chooseEpisode: 'Выбрать эпизод',

    noShowsYet: 'Сериалов пока нет',
    noShowsYetHint: 'Добавьте сериал и импортируйте субтитры, чтобы начать.',
    translationNotice:
      'Количество автоматических переводов ограничено, чтобы контролировать расходы на работу приложения. Если лимит исчерпан, вы можете сохранить фразу без перевода и перевести её позже.',
    addShow: 'Добавить сериал',

    loadEarlier: 'Показать предыдущие реплики',
    loadLater: 'Показать следующие реплики',
    timeStampPlaceholder: 'мм:сс',
  },

  selectPhrase: {
    title: 'Выбрать фразу',
    selectedCues: 'Выбрано реплик: {count} из 3',
    previous: '+ Предыдущая',
    next: '+ Следующая',
    resetSelection: 'Сбросить выбор',
    selectionHint: 'Выберите до трёх последовательных реплик.',

    draftLabel: 'Черновик фразы',
    draftHint: 'При необходимости удалите из черновика лишний текст субтитров.',

    translate: 'Перевести',
    saveWithoutTranslation: 'Сохранить без перевода',

    phraseLabel: 'Фраза',
    translationLabel: 'Перевод',
    translating: 'Переводим…',
    translationFailed: 'Не удалось перевести',
    translationLimitReached:
      'Лимит переводов достигнут. Вы можете сохранить фразу без перевода и перевести её позже.',
    saveFailed: 'Не удалось сохранить фразу. Попробуйте ещё раз.',
    saving: 'Сохраняем…',

    phraseSaved: 'Фраза сохранена',
    savedWithoutTranslation: 'Сохранено без перевода',

    cueNotFound: 'Выбранная реплика не найдена.',
    characterLimitExceeded: 'Сократите фразу до 300 символов, чтобы перевести её.',
  },

  library: {
    title: 'Сохранённые фразы',

    tabs: {
      new: 'Новые',
      learning: 'Изучаемые',
      learned: 'Выученные',
    },

    emptyStates: {
      new: {
        title: 'Новых фраз пока нет',
        hint: 'Найдите и сохраните фразу из эпизода, чтобы она появилась здесь.',
      },
      learning: {
        title: 'Нет изучаемых фраз',
        hint: 'Перенесите фразы из «Новые», чтобы начать их изучать.',
      },
      learned: {
        title: 'Выученных фраз пока нет',
        hint: 'Здесь появятся фразы, которые вы отметите как выученные.',
      },
    },

    newestFirst: 'Сначала новые',

    statusNew: 'Статус: новая',
    statusLearning: 'Статус: изучается',
    statusLearned: 'Статус: выучена',

    startLearning: 'Начать изучение',
    noTranslation: 'Нет перевода',
    translate: 'Перевести',
    learnAgain: 'Учить снова',

    deletePhraseTitle: 'Удалить фразу?',
    deletePhraseBody: 'Фраза будет безвозвратно удалена из библиотеки.',
    deleteFailed: 'Не удалось удалить фразу. Попробуйте ещё раз.',
    translationLimitReached: 'Лимит переводов достигнут. Попробуйте перевести эту фразу позже.',
  },

  study: {
    learningPhrases: 'Изучаемые фразы',
    currentCycle: 'текущий цикл',
    showTranslation: 'Показать перевод',
    nextPhrase: 'Следующая фраза',
    learned: 'Выучено',

    noPhrases: 'Нет фраз для изучения',
    noPhrasesHint: 'Перенесите фразы из «Новые» в «Изучаемые», чтобы начать цикл.',
    goToNew: 'Перейти в «Новые»',
    updateFailed: 'Не удалось обновить статус фразы. Попробуйте ещё раз.',
  },

  settings: {
    title: 'Настройки',
    subtitle: 'Интерфейс, изучение и локальные данные',

    interfaceSection: 'Интерфейс',
    language: 'Язык',

    languageEnglish: 'English',
    languageRussian: 'Русский',

    theme: 'Тема',
    themeSystem: 'Системная',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',

    learningSection: 'Изучение',
    learningLimit: 'Лимит изучаемых фраз',
    learningLimitHint: '1–50 · сейчас изучается: {count}',
    learningLimitInvalid: 'Введите целое число от 1 до 50.',
    saveFailed: 'Не удалось сохранить настройки. Попробуйте ещё раз.',

    localData: 'Локальные данные',
    localDataDescription: 'Создание и восстановление JSON-копии фраз, субтитров и лимита изучения.',

    storedLocally: 'Хранится на устройстве',
    storedLocallyHint:
      'Данные хранятся на этом устройстве. Создайте резервную копию, чтобы сохранить их отдельно.',

    learningLimitError:
      'Значение не может быть меньше текущего количества изучаемых фраз: {count}.',

    aboutTitle: 'О приложении',
    aboutDescription:
      'Личный проект для изучения английского по субтитрам сериалов, созданный на React, TypeScript и Redux Toolkit.',
    developedBy: 'Разработал',
    authorName: 'Алексей Сурков',
    portfolio: 'Портфолио',
    analyticsNotice:
      'Анонимная статистика посещений собирается с помощью Cloudflare Web Analytics. Аналитические куки не используются.',
  },

  source: {
    shows: 'Сериалы',
    yourShows: 'Ваши сериалы',
    addShow: 'Добавить сериал',

    showTitle: 'Название сериала',
    showTitlePlaceholder: 'Введите название сериала',
    saveShow: 'Сохранить сериал',
    showNotFound: 'Сериал не найден',
    seasonNotFound: 'Сезон не найден',

    seasons: 'Сезоны',
    addSeason: 'Добавить сезон',
    deleteShow: 'Удалить сериал',
    season: 'Сезон {number}',
    seasonsCount: 'Сезонов: {count}',

    episodes: 'Эпизоды',
    episode: 'Эпизод {number}',
    importedSubtitles: 'Субтитры импортированы',
    episodesImported: 'Импортировано эпизодов: {count}',

    importSrt: 'Импортировать SRT',
    importSubtitles: 'Импортировать субтитры',
    chooseSrtFiles: 'Выбрать .srt файлы',

    episodeDetected: 'Определён номер эпизода: {number}',
    readyToImport: 'Готов к импорту',

    episodeNumberNotDetected: 'Номер эпизода не определён',
    episodeNumber: 'Номер эпизода',
    episodeNumberPlaceholder: 'Введите номер эпизода',
    enterEpisodeNumber: 'Введите номер эпизода, чтобы продолжить.',

    cannotImportFile: 'Не удалось импортировать файл',
    invalidSrt: 'Некорректный или нечитаемый SRT. Остальные файлы не затронуты.',

    importValidFiles: 'Импортировать корректные файлы',
    importComplete: 'Импорт завершён',
    filesSkipped: 'Пропущено файлов: {count}',

    openEpisode: 'Открыть эпизод',
    importedWithWarning: 'Импортировано с предупреждением · пропущено реплик: {count}',
    importMoreSrt: 'Импортировать ещё SRT',

    subtitlesImported: 'Субтитры импортированы',
    openingSetsActive: 'При открытии эпизод станет активным.',

    deleteEpisode: 'Удалить эпизод',
    deleteEpisodeTitle: 'Удалить эпизод?',
    deleteEpisodeBody:
      'Эпизод и его импортированные субтитры будут удалены. Сохранённые фразы сохранят данные об источнике.',

    seasonNumber: 'Номер сезона',
    seasonNumberPlaceholder: 'Введите номер сезона',
    saveSeason: 'Сохранить сезон',

    deleteShowTitle: 'Удалить сериал?',
    deleteShowBody:
      'Сериал, его сезоны, эпизоды и импортированные субтитры будут удалены. Сохранённые фразы сохранят данные об источнике.',

    deleteSeason: 'Удалить сезон',
    deleteSeasonTitle: 'Удалить сезон?',
    deleteSeasonBody:
      'Сезон, его эпизоды и импортированные субтитры будут удалены. Сохранённые фразы сохранят данные об источнике.',
  },

  backup: {
    create: 'Создать резервную копию',
    restore: 'Восстановить резервную копию',

    restoreTitle: 'Восстановить резервную копию?',
    restoreBody:
      'Текущие сериалы, субтитры, сохранённые фразы и лимит изучения будут заменены данными из резервной копии. Объединения данных не будет.',
    restoreAction: 'Восстановить',

    invalidFile: 'Некорректный файл резервной копии',
    nothingChanged: 'Ничего не изменено.',
    createFailed: 'Не удалось создать резервную копию. Попробуйте ещё раз.',
    restoreFailed: 'Не удалось восстановить резервную копию. Данные не изменены.',
  },

  metadata: {
    seasonEpisode: 'Сезон {season} · Эпизод {episode}',
    shortSeasonEpisode: 'С{season} Э{episode}',
  },
}

export const translations = {
  en,
  ru,
}
