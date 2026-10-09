import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type {
  Episode,
  Season,
  Show,
  SourceState,
} from './sourceTypes'

const initialState: SourceState = {
  shows: [],
  activeEpisodeId: null,
}

const sourceSlice = createSlice({
  name: 'source',
  initialState,
  reducers: {
    addShow(state, action: PayloadAction<Show>) {
      state.shows.push(action.payload)
    },
    addSeason(state, action: PayloadAction<{
      showId: string
      season: Season
    }>) {
      const show = state.shows.find((show) => show.id === action.payload.showId)
      if (!show) {
        return
      }
      show.seasons.push(action.payload.season)
    },
    addEpisode(state, action: PayloadAction<{
      showId: string
      seasonId: string
      episode: Episode
    }>) {
      const show = state.shows.find((show) => show.id === action.payload.showId)
      if (!show) {
        return
      }
      const season = show.seasons.find((season) => season.id === action.payload.seasonId)
      if (!season) {
        return
      }
      season.episodes.push(action.payload.episode)
    },
    setActiveEpisodeId(state, action: PayloadAction<string | null>) {
      state.activeEpisodeId = action.payload
    },
    removeEpisode(state, action: PayloadAction<{
      showId: string
      seasonId: string
      episodeId: string
    }>) {
      const show = state.shows.find((show) => show.id === action.payload.showId)
      if (!show) {
        return
      }
      const season = show.seasons.find((season) => season.id === action.payload.seasonId)
      if (!season) {
        return
      }
      season.episodes = season.episodes.filter((episode) => episode.id !== action.payload.episodeId)
      if (state.activeEpisodeId === action.payload.episodeId) {
        state.activeEpisodeId = null
      }
    },
    removeSeason(state, action: PayloadAction<{
      showId: string
      seasonId: string
    }>) {
      const show = state.shows.find((show) => show.id === action.payload.showId)
      if (!show) {
        return
      }
      const season = show.seasons.find((season) => season.id === action.payload.seasonId)
      if (!season) {
        return
      }
      const hasActiveEpisode = season.episodes.some(
        (episode) => episode.id === state.activeEpisodeId
      )
      show.seasons = show.seasons.filter((season) => season.id !== action.payload.seasonId)
      if (hasActiveEpisode) {
        state.activeEpisodeId = null
      }
    },
    removeShow(state, action: PayloadAction<{
      showId: string
    }>) {
      const show = state.shows.find((show) => show.id === action.payload.showId)
      if (!show) {
        return
      }
      const hasActiveEpisode = show.seasons.some((season) => season.episodes.some(
        (episode) => episode.id === state.activeEpisodeId)
      )
      state.shows = state.shows.filter((show) => show.id !== action.payload.showId)
      if (hasActiveEpisode) {
        state.activeEpisodeId = null
      }
    },
    hydrateShows(state, action: PayloadAction<Show[]>) {
      state.shows = action.payload
    }
  },
})

export const {
  addShow,
  addSeason,
  addEpisode,
  setActiveEpisodeId,
  removeEpisode,
  removeSeason,
  removeShow,
  hydrateShows
} = sourceSlice.actions

export const sourceReducer = sourceSlice.reducer

export const selectShows = (state: RootState) => state.source.shows
export const selectActiveEpisodeId = (state: RootState) => state.source.activeEpisodeId
export const selectActiveEpisode = (state: RootState) => {
  const episodes = state.source.shows.flatMap((show) => show.seasons.flatMap((season) => season.episodes))
  return episodes.find((episode) => episode.id === state.source.activeEpisodeId)
}