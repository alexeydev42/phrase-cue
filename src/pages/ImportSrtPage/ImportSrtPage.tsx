import { useRef, useState, type ChangeEvent } from 'react'
import { useParams, Link } from 'react-router'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { selectShows, addEpisode } from '../../features/source/sourceSlice'
import { BackLink } from '../../components/BackLink/BackLink'
import { useTranslation } from '../../i18n/useTranslation'
import { parseSrt, type SrtParseResult } from '../../features/source/srtParser'
import { detectEpisodeNumber } from '../../features/source/episodeNumber'
import { Input } from '../../components/Input/Input'
import { Surface } from '../../components/Surface/Surface'
import { Button } from '../../components/Button/Button'

import styles from './ImportSrtPage.module.css'

interface ImportFileItem {
  id: string
  name: string
  episodeNumber: number | null
  needsManualNumber: boolean
  parseResult: SrtParseResult | null
  readError: boolean
}

interface ImportedEpisode {
  id: string
  number: number
  skippedCount: number
}

export const ImportSrtPage = () => {
  const t = useTranslation()
  const dispatch = useAppDispatch()
  const selectionIdRef = useRef(0)
  const [files, setFiles] = useState<ImportFileItem[]>([])
  const [importedEpisodes, setImportedEpisodes] = useState<ImportedEpisode[] | null>(null)
  const { showId, seasonId } = useParams()
  const shows = useAppSelector(selectShows)
  const show = shows.find((show) => show.id === showId)
  const season = show?.seasons.find((season) => season.id === seasonId)

  if (!show) {
    return <p>{t.source.showNotFound}</p>
  }

  if (!season) {
    return <p>{t.source.seasonNotFound}</p>
  }

  const handleFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.currentTarget.files ?? [])
    const selectionId = ++selectionIdRef.current
    setFiles([])
    const processedFiles: ImportFileItem[] = []

    for (const file of selectedFiles) {
      const detectedNumber = detectEpisodeNumber(file.name)

      try {
        const srtText = await file.text()
        const result = parseSrt(srtText)

        processedFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          episodeNumber: detectedNumber,
          needsManualNumber: detectedNumber === null,
          parseResult: result,
          readError: false,
        })
      } catch {
        processedFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          episodeNumber: detectedNumber,
          needsManualNumber: detectedNumber === null,
          parseResult: null,
          readError: true,
        })
      }
    }

    if (selectionId === selectionIdRef.current) {
      setFiles(processedFiles)
    }
  }

  const handleEpisodeNumberChange = (id: string, value: string) => {
    const number = value === '' ? null : Number(value)

    const episodeNumber =
      number !== null && Number.isSafeInteger(number) && number > 0 ? number : null

    setFiles((currentFiles) =>
      currentFiles.map((file) => (file.id === id ? { ...file, episodeNumber } : file)),
    )
  }

  const readyFiles = files.filter(
    (file) => file.parseResult?.ok === true && file.episodeNumber !== null,
  )

  const handleImport = () => {
    const imported: ImportedEpisode[] = []

    for (const file of readyFiles) {
      if (!file.parseResult?.ok || file.episodeNumber === null) {
        continue
      }

      const cues = file.parseResult.cues.map((cue) => ({
        ...cue,
        id: crypto.randomUUID(),
      }))

      const episode = {
        id: crypto.randomUUID(),
        number: file.episodeNumber,
        cues,
      }

      dispatch(
        addEpisode({
          showId: show.id,
          seasonId: season.id,
          episode,
        }),
      )

      imported.push({
        id: episode.id,
        number: episode.number,
        skippedCount: file.parseResult.skippedCount,
      })
    }

    setImportedEpisodes(imported)
  }

  if (importedEpisodes !== null) {
    const skippedFiles = files.length - importedEpisodes.length

    return (
      <section className={styles.page}>
        <div className={styles.head}>
          <BackLink to={`/episode/shows/${show.id}`}>{show.title}</BackLink>

          <h1 className={styles.title}>
            {t.source.season.replace('{number}', String(season.number))}
          </h1>

          <p className={styles.subtitle}>{t.source.importComplete}</p>
        </div>

        <div className={styles.results}>
          <ul className={styles.fileList}>
            <li>
              <Surface className={styles.fileCard}>
                <p className={styles.fileName}>
                  {t.source.episodesImported.replace('{count}', String(importedEpisodes.length))}
                </p>

                {skippedFiles > 0 && (
                  <p className={styles.fileMeta}>
                    {t.source.filesSkipped.replace('{count}', String(skippedFiles))}
                  </p>
                )}
              </Surface>
            </li>

            {importedEpisodes.map((episode) => (
              <li key={episode.id}>
                <Surface className={styles.fileCard}>
                  <p className={styles.fileName}>
                    {t.source.episode.replace('{number}', String(episode.number))}
                  </p>

                  <p className={styles.fileMeta}>
                    {episode.skippedCount > 0
                      ? t.source.importedWithWarning.replace(
                          '{count}',
                          String(episode.skippedCount),
                        )
                      : t.source.importedSubtitles}
                  </p>

                  <Link
                    to={`/episode/shows/${show.id}/seasons/${season.id}/episodes/${episode.id}`}
                    className={styles.openEpisode}
                  >
                    {t.source.openEpisode}
                    <span className={styles.forwardArrow} aria-hidden='true'>
                      →
                    </span>
                  </Link>
                </Surface>
              </li>
            ))}
          </ul>

          <Button
            variant='secondary'
            fullWidth
            onClick={() => {
              setFiles([])
              setImportedEpisodes(null)
            }}
          >
            {t.source.importMoreSrt}
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <BackLink to={`/episode/shows/${show.id}/seasons/${season.id}`}>
          {t.source.season.replace('{number}', String(season.number))}
        </BackLink>

        <h1 className={styles.title}>{t.source.importSubtitles}</h1>

        <p className={styles.subtitle}>
          {show.title} · {t.source.season.replace('{number}', String(season.number))}
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.actions}>
          <input
            id='srt-files'
            className={styles.fileInput}
            type='file'
            accept='.srt'
            multiple
            onChange={handleFilesChange}
          />

          <label htmlFor='srt-files' className={styles.filePicker}>
            {t.source.chooseSrtFiles}
          </label>

          <Button
            variant='primary'
            fullWidth
            onClick={handleImport}
            disabled={readyFiles.length === 0}
            className={styles.importButton}
          >
            {t.source.importValidFiles}
          </Button>
        </div>

        {files.length > 0 && (
          <div className={styles.listPanel}>
            <ul className={styles.fileList}>
              {files.map((file) => (
                <li key={file.id}>
                  <Surface className={styles.fileCard}>
                    <p className={styles.fileName}>{file.name}</p>

                    {file.readError || file.parseResult?.ok === false ? (
                      <>
                        <p className={styles.fileMeta}>{t.source.cannotImportFile}</p>
                        <p className={styles.errorMessage}>{t.source.invalidSrt}</p>
                      </>
                    ) : file.needsManualNumber ? (
                      <>
                        <p className={styles.fileMeta}>{t.source.episodeNumberNotDetected}</p>

                        <p className={file.episodeNumber !== null ? styles.ready : styles.fileMeta}>
                          {file.episodeNumber !== null
                            ? t.source.readyToImport
                            : t.source.enterEpisodeNumber}
                        </p>

                        <div className={styles.field}>
                          <label className={styles.fieldLabel} htmlFor={`episode-${file.id}`}>
                            {t.source.episodeNumber}
                          </label>

                          <Input
                            id={`episode-${file.id}`}
                            type='number'
                            min={1}
                            step={1}
                            value={file.episodeNumber ?? ''}
                            placeholder={t.source.episodeNumberPlaceholder}
                            onChange={(event) =>
                              handleEpisodeNumberChange(file.id, event.currentTarget.value)
                            }
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p className={styles.fileMeta}>
                          {t.source.episodeDetected.replace('{number}', String(file.episodeNumber))}
                        </p>

                        <p className={styles.ready}>{t.source.readyToImport}</p>
                      </>
                    )}
                  </Surface>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
