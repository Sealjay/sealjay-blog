import type { CollectionEntry } from 'astro:content'
import { extractYouTubeId, type YouTubeSpeakingEntry } from './youtube'

type Appearance = CollectionEntry<'speaking'>['data']
type FeedFormat = Pick<YouTubeSpeakingEntry, 'eventType' | 'isFullPodcastEpisode'>

export function describeAppearance(data: Appearance, feed?: FeedFormat) {
  const isShort = data.eventType === 'Short' || feed?.eventType === 'Short'
  const isFullPodcastEpisode =
    !isShort &&
    data.event === 'Securing the Realm' &&
    (data.isFullPodcastEpisode ?? feed?.isFullPodcastEpisode) === true
  const eventType = isShort ? 'Short' : isFullPodcastEpisode ? 'Podcast' : data.eventType
  const recording = extractYouTubeId(data.videoEmbedUrl)
  const urlRecording = extractYouTubeId(data.url)
  const embedOnly = recording && !urlRecording
  let label = embedOnly ? 'Watch recording' : data.cta
  if (urlRecording || embedOnly) {
    if (eventType === 'Short') label = 'Watch short'
    else if (eventType === 'Podcast') label = 'Watch episode'
    else if (eventType === 'Conference') label = 'Watch talk'
    else if (eventType === 'Workshop') label = 'Watch workshop'
  }

  const actions = embedOnly
    ? [
        { url: `https://www.youtube.com/watch?v=${recording}`, label },
        { url: data.url, label: data.cta },
      ]
    : [{ url: data.url, label }]
  actions.push(...(data.additionalLinks ?? []))
  if (data.previewUrl) actions.push({ url: data.previewUrl, label: 'Watch workshop preview' })
  if (data.blogPostSlug) {
    const url = `/blog/${data.blogPostSlug}/`
    if (!actions.some((action) => new URL(action.url, 'https://sealjay.com').href === `https://sealjay.com${url}`)) {
      actions.push({ url, label: 'Read write-up' })
    }
  }
  return { data: { ...data, eventType, isFullPodcastEpisode, url: actions[0].url, cta: label }, actions }
}

export function splitAppearances<T extends { id: string; data: { date: Date } }>(entries: T[], now = new Date()) {
  const compare = (a: T, b: T) => a.data.date.valueOf() - b.data.date.valueOf()
  const upcoming = entries
    .filter(({ data }) => data.date > now)
    .sort((a, b) => compare(a, b) || a.id.localeCompare(b.id))
  const past = entries.filter(({ data }) => data.date <= now).sort((a, b) => compare(b, a) || a.id.localeCompare(b.id))
  return { upcoming, past }
}
