import { useAppSelector } from '../../app/hooks'
import { selectShows } from '../../features/source/sourceSlice'

export const ShowsPage = () => {
  const shows = useAppSelector(selectShows)
  return (
    <>
      <h1>{shows.length}</h1>
      {shows.map((show) => {
        return <h2 key={show.id}>{show.title}</h2>
      })}
    </>
  )
}