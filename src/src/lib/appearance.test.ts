import assert from 'node:assert/strict'
import { test } from 'node:test'
import { describeAppearance, splitAppearances } from './appearance'
import { getProjectLinks } from './projects'

const recording = {
  title: 'Red Teaming AI Agents with Pramin Pradeep',
  date: new Date('2026-11-17'),
  event: 'Securing the Realm',
  description: 'An interview with Chris and Josh',
  eventType: 'Video' as const,
  url: 'https://www.youtube.com/watch?v=Z5aPUgfwKQc',
  cta: 'Watch video',
  featured: false,
}

test('a verified full conversation is a podcast and the action matches its recording', () => {
  const episode = describeAppearance({ ...recording, isFullPodcastEpisode: true })
  assert.equal(episode.data.eventType, 'Podcast')
  assert.equal(episode.actions[0].label, 'Watch episode')
  assert.equal(describeAppearance(recording).data.eventType, 'Video')
  assert.equal(
    describeAppearance({ ...recording, eventType: 'Conference', event: 'Summit' }).data.eventType,
    'Conference',
  )

  const short = describeAppearance(
    {
      ...recording,
      title: 'Ignite 2026 - Roundup',
      eventType: 'Short',
      url: 'https://www.youtube.com/shorts/-aSHs2SQwA4',
    },
    { eventType: 'Podcast', isFullPodcastEpisode: true },
  )
  assert.equal(short.data.eventType, 'Short')
  assert.equal(short.data.isFullPodcastEpisode, false)
  assert.equal(short.actions[0].label, 'Watch short')
})

test('the recording precedes the programme, and a linked write-up appears only once', () => {
  const entry = describeAppearance({
    ...recording,
    eventType: 'Conference',
    url: 'https://sealjay.com/blog/conference/',
    cta: 'Read write-up',
    blogPostSlug: 'conference',
    videoEmbedUrl: 'https://www.youtube.com/embed/6V7xETImnMY',
  })
  assert.deepEqual(entry.actions, [
    { url: 'https://www.youtube.com/watch?v=6V7xETImnMY', label: 'Watch talk' },
    { url: 'https://sealjay.com/blog/conference/', label: 'Read write-up' },
  ])
})

test('upcoming appearances are nearest first and past appearances newest first', () => {
  const dates = ['2027-02-14', '2026-11-27', '2026-09-06', '2027-01-10']
  const entries = dates.map((id) => ({ id, data: { date: new Date(id) } }))
  const { upcoming, past } = splitAppearances(entries, new Date('2026-11-27'))
  assert.deepEqual(
    upcoming.map(({ id }) => id),
    ['2027-01-10', '2027-02-14'],
  )
  assert.deepEqual(
    past.map(({ id }) => id),
    ['2026-11-27', '2026-09-06'],
  )
})

test('preferred project links retain usable secondary destinations', () => {
  const repoUrl = 'https://github.com/SecuringTheRealm/securing.quest'
  const demoUrl = 'https://securing.quest'
  const show = getProjectLinks({
    title: 'Securing the Realm',
    repoUrl,
    demoUrl,
    primaryDemoLabel: 'Listen to Securing the Realm',
  })
  assert.deepEqual(
    show.map(({ url }) => url),
    [demoUrl, repoUrl],
  )
  const doctorate = getProjectLinks({
    title: 'Green AI',
    demoUrl: 'https://orcid.org/0000-0001-7995-7865',
    primaryDemoLabel: 'View research profile',
  })
  assert.equal(doctorate[0].label, 'View research profile')
  const software = getProjectLinks({
    title: 'bingnews-cli',
    repoUrl: 'https://github.com/Sealjay/bingnews-cli',
    blogPostSlug: 'bing-news-search-cli',
  })
  assert.deepEqual(
    software.map(({ kind }) => kind),
    ['repo', 'article'],
  )
  assert.equal(getProjectLinks({ title: 'Article only', blogPostSlug: 'project' })[0].url, '/blog/project/')
  assert.deepEqual(getProjectLinks({ title: 'isitadao' }), [])
})
