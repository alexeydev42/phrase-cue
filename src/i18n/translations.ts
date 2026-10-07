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
    searchResultsHint:
      'Search to see subtitle cues around the selected timecode.',
    noSubtitleList: 'No subtitle list yet',
    noSubtitleListHint: 'Enter a timecode and press Search.',

    nearbyCues: 'Nearby subtitle cues',
    nearbyCuesHint:
      'Three cues before the specified time, the nearest cue, and three after.',

    noActiveEpisode: 'No active episode',
    noActiveEpisodeHint: 'Choose an episode to start finding phrases.',
    chooseEpisode: 'Choose episode',

    noShowsYet: 'No shows yet',
    noShowsYetHint: 'Add a show and import subtitles to get started.',
    addShow: 'Add show',
  },

  selectPhrase: {
    title: 'Select phrase',
    selectedCues: 'Selected cues · {count} of 3',
    previous: 'Previous',
    next: 'Next',
    selectionHint: 'Choose up to three consecutive cues.',

    draftLabel: 'Phrase draft',
    draftHint:
      'Edit the draft if you want to remove unnecessary subtitle text.',

    translate: 'Translate',
    saveWithoutTranslation: 'Save without translation',

    phraseLabel: 'Phrase',
    translationLabel: 'Translation',
    translating: 'Translating…',
    translationFailed: 'Translation failed',

    phraseSaved: 'Phrase saved',
    savedWithoutTranslation: 'Saved without translation',
  },

  library: {
    title: 'Saved phrases',

    tabs: {
      new: 'New',
      learning: 'Learning',
      learned: 'Learned',
    },

    newestFirst: 'Newest first',
    newPhrases: 'New phrases',
    learningPhrases: 'Learning phrases',

    statusNew: 'Status: New',
    statusLearning: 'Status: Learning',
    statusLearned: 'Status: Learned',

    startLearning: 'Start learning',
    noTranslation: 'No translation',
    translate: 'Translate',
    learnAgain: 'Learn again',

    learningLimitReached: 'Learning limit reached',
    learningLimitReachedHint:
      'Learning limit reached. Increase the limit in Settings to add more phrases.',

    deletePhraseTitle: 'Delete phrase?',
    deletePhraseBody:
      'This phrase will be permanently removed from the Library.',
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

    localData: 'Local data',
    localDataDescription:
      'Create or restore a JSON backup of saved phrases and Learning limit.',

    storedLocally: 'Stored locally',
    storedLocallyHint:
      'Subtitles and working episode data stay on this device until you delete them.',

    learningLimitError: 'Cannot be lower than current Learning count: {count}.',
  },

  source: {
    shows: 'Shows',
    yourShows: 'Your shows',
    addShow: 'Add show',

    showTitle: 'Show title',
    saveShow: 'Save show',

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
    importSrtFiles: 'Import SRT files',
    importSubtitles: 'Import subtitles',
    chooseSrtFiles: 'Choose .srt files',

    episodeDetected: 'Episode number detected: {number}',
    readyToImport: 'Ready to import',

    episodeNumberNotDetected: 'Episode number not detected',
    episodeNumber: 'Episode number',
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
      'Current saved phrases and Learning limit will be replaced by the selected backup. Data will not be merged.',
    restoreAction: 'Restore',

    invalidFile: 'Invalid backup file',
    nothingChanged: 'Nothing was changed.',
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
    searchResultsHint:
      'Выполните поиск, чтобы увидеть реплики рядом с выбранным таймкодом.',
    noSubtitleList: 'Реплики пока не показаны',
    noSubtitleListHint: 'Введите таймкод и нажмите «Найти».',

    nearbyCues: 'Реплики рядом с таймкодом',
    nearbyCuesHint:
      'Три реплики до указанного времени, ближайшая к нему и три после.',

    noActiveEpisode: 'Нет активного эпизода',
    noActiveEpisodeHint: 'Выберите эпизод, чтобы искать фразы.',
    chooseEpisode: 'Выбрать эпизод',

    noShowsYet: 'Сериалов пока нет',
    noShowsYetHint: 'Добавьте сериал и импортируйте субтитры, чтобы начать.',
    addShow: 'Добавить сериал',
  },

  selectPhrase: {
    title: 'Выбрать фразу',
    selectedCues: 'Выбрано реплик: {count} из 3',
    previous: 'Предыдущая',
    next: 'Следующая',
    selectionHint: 'Выберите до трёх последовательных реплик.',

    draftLabel: 'Черновик фразы',
    draftHint: 'При необходимости удалите из черновика лишний текст субтитров.',

    translate: 'Перевести',
    saveWithoutTranslation: 'Сохранить без перевода',

    phraseLabel: 'Фраза',
    translationLabel: 'Перевод',
    translating: 'Переводим…',
    translationFailed: 'Не удалось перевести',

    phraseSaved: 'Фраза сохранена',
    savedWithoutTranslation: 'Сохранено без перевода',
  },

  library: {
    title: 'Сохранённые фразы',

    tabs: {
      new: 'Новые',
      learning: 'Изучаемые',
      learned: 'Выученные',
    },

    newestFirst: 'Сначала новые',
    newPhrases: 'Новые фразы',
    learningPhrases: 'Изучаемые фразы',

    statusNew: 'Статус: новая',
    statusLearning: 'Статус: изучается',
    statusLearned: 'Статус: выучена',

    startLearning: 'Начать изучение',
    noTranslation: 'Нет перевода',
    translate: 'Перевести',
    learnAgain: 'Учить снова',

    learningLimitReached: 'Лимит изучаемых фраз достигнут',
    learningLimitReachedHint:
      'Лимит изучаемых фраз достигнут. Увеличьте его в Настройках, чтобы добавить новые фразы.',

    deletePhraseTitle: 'Удалить фразу?',
    deletePhraseBody: 'Фраза будет безвозвратно удалена из библиотеки.',
  },

  study: {
    learningPhrases: 'Изучаемые фразы',
    currentCycle: 'текущий цикл',
    showTranslation: 'Показать перевод',
    nextPhrase: 'Следующая фраза',
    learned: 'Выучено',

    noPhrases: 'Нет фраз для изучения',
    noPhrasesHint:
      'Перенесите фразы из «Новые» в «Изучаемые», чтобы начать цикл.',
    goToNew: 'Перейти в «Новые»',
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

    localData: 'Локальные данные',
    localDataDescription:
      'Создайте JSON-резервную копию сохранённых фраз и лимита изучения или восстановите существующую.',

    storedLocally: 'Хранится на устройстве',
    storedLocallyHint:
      'Субтитры и рабочие данные эпизодов остаются на этом устройстве, пока вы их не удалите.',

    learningLimitError:
      'Значение не может быть меньше текущего количества изучаемых фраз: {count}.',
  },

  source: {
    shows: 'Сериалы',
    yourShows: 'Ваши сериалы',
    addShow: 'Добавить сериал',

    showTitle: 'Название сериала',
    saveShow: 'Сохранить сериал',

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
    importSrtFiles: 'Импорт SRT-файлов',
    importSubtitles: 'Импортировать субтитры',
    chooseSrtFiles: 'Выбрать .srt файлы',

    episodeDetected: 'Определён номер эпизода: {number}',
    readyToImport: 'Готов к импорту',

    episodeNumberNotDetected: 'Номер эпизода не определён',
    episodeNumber: 'Номер эпизода',
    enterEpisodeNumber: 'Введите номер эпизода, чтобы продолжить.',

    cannotImportFile: 'Не удалось импортировать файл',
    invalidSrt:
      'Некорректный или нечитаемый SRT. Остальные файлы не затронуты.',

    importValidFiles: 'Импортировать корректные файлы',
    importComplete: 'Импорт завершён',
    filesSkipped: 'Пропущено файлов: {count}',

    openEpisode: 'Открыть эпизод',
    importedWithWarning:
      'Импортировано с предупреждением · пропущено реплик: {count}',
    importMoreSrt: 'Импортировать ещё SRT',

    subtitlesImported: 'Субтитры импортированы',
    openingSetsActive: 'При открытии эпизод станет активным.',

    deleteEpisode: 'Удалить эпизод',
    deleteEpisodeTitle: 'Удалить эпизод?',
    deleteEpisodeBody:
      'Эпизод и его импортированные субтитры будут удалены. Сохранённые фразы сохранят данные об источнике.',

    seasonNumber: 'Номер сезона',
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
      'Сохранённые фразы и лимит изучения будут заменены данными из выбранной резервной копии. Данные не будут объединены.',
    restoreAction: 'Восстановить',

    invalidFile: 'Некорректный файл резервной копии',
    nothingChanged: 'Ничего не изменено.',
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
