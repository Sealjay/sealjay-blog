import { tagMvpUrl } from '../lib/mvp-url'

// Professional badges/affiliations
export interface Badge {
  text: string
  url?: string
  isFormerRole?: boolean
}

export const profileRole = 'AI transformation and platform engineering executive'
export const aboutDescription = `Chris Lloyd-Jones (Sealjay) is a Seattle-area ${profileRole}, a seven-time Microsoft MVP and a Green AI doctoral candidate.`
export const globalAiOrganizerAward = {
  title: 'Organizer of the Week',
  weekOf: '23 November 2026',
  url: 'https://globalai.community/awards/organizer-of-the-week/2026-W48',
}

export const professionalBadges: Badge[] = [
  {
    text: 'Seven-time Microsoft MVP in AI and Developer Technologies',
    url: tagMvpUrl('https://mvp.microsoft.com/en-US/mvp/profile/224176f9-f3a7-eb11-b1ac-000d3a53daf4'),
  },
  { text: 'Member of the Institution of Engineering and Technology (MIET)' },
  {
    text: 'Seattle Chapter Co-Lead, Global AI Community',
    url: 'https://globalai.community/chapters/seattle/',
  },
  {
    text: 'Data.D Candidate (ABD), Green AI (UEL, 2022\u20132027)',
    url: 'https://orcid.org/0000-0001-7995-7865',
  },
  {
    text: 'OpenUK New Year\u2019s Honours 2025/26 Recipient',
    url: 'https://openuk.uk/honours/',
  },
  {
    text: 'Contributor, ISO/IEC 21031:2024',
  },
  {
    text: 'OpenUK Data Centre Group Lead',
    url: 'https://openuk.uk/datacentregroup/',
  },
  {
    text: 'OpenUK Ambassador',
    url: 'https://openuk.uk/',
  },
  {
    text: 'Securing the Realm',
    url: 'https://securing.quest',
  },
]

// Former roles to display (if any)
export const formerRoles: Badge[] = [
  {
    text: 'Green Software Foundation Steering Committee Vice-Chair',
    url: 'https://greensoftware.foundation/',
    isFormerRole: true,
  },
  {
    text: 'TODO Group Member',
    url: 'https://todogroup.org/',
    isFormerRole: true,
  },
  {
    text: 'Head of Avanade.ai',
    url: 'https://www.avanade.com/',
    isFormerRole: true,
  },
  {
    text: 'Head of Platforms & Incubation at Avanade',
    url: 'https://www.avanade.com/',
    isFormerRole: true,
  },
  {
    text: 'OpenUK Chief Blueprints Officer & Leadership',
    url: 'https://openuk.uk/',
    isFormerRole: true,
  },
  {
    text: 'GSF Open Source Working Group Chair',
    url: 'https://greensoftware.foundation/',
    isFormerRole: true,
  },
  {
    text: 'OpenUK London Meetup Organiser',
    url: 'https://openuk.uk/',
    isFormerRole: true,
  },
]

// YouTube channel feeds auto-populated as speaking entries at build time
export const youtubeFeeds = [
  {
    channelId: 'UCS4KTDaZTiyiMj2yZztwmlg',
    podcastPlaylistId: 'PLo9Ah7HeyG1QVWTBPzOROBQNqinh0ZPWv',
    shortsPlaylistId: 'PLo9Ah7HeyG1Rkqq0cc1QJtttkywXKWd9g',
    event: 'Securing the Realm',
    defaultTags: ['YouTube', 'Security'],
  },
]

export type YouTubeFeedConfig = (typeof youtubeFeeds)[number]
