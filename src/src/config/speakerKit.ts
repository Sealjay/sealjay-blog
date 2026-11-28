import { profileRole } from './personal'

export interface SpeakerTopic {
  title: string
  description: string
}

export interface TalkFormat {
  name: string
  duration: string
}

export interface LogisticsItem {
  label: string
  value: string
}

export const speakerBio = {
  short: `Chris Lloyd-Jones (Sealjay) is a Seattle-area ${profileRole} and a seven-time Microsoft MVP in AI and Developer Technologies. He speaks about getting AI agents into production, governing their permissions and measuring software’s carbon impact. He co-leads the Seattle chapter of Global AI Community.`,
  long: `Chris Lloyd-Jones (Sealjay) is a Seattle-area ${profileRole}, a seven-time Microsoft MVP in AI and Developer Technologies and a member of the Institution of Engineering and Technology (MIET). At Kyndryl, he created the Forward Deployed Engineering capability so engineers could build alongside clients and remain responsible for the software they built together. At Avanade, he founded Platforms & Incubation and hired the product team for Avanade.ai. His background in law informs how he thinks about agent permissions and accountability. He is a Green AI doctoral candidate at the University of East London and contributed to ISO/IEC 21031:2024 (Software Carbon Intensity) through the Green Software Foundation, where he served as Steering Committee Vice-Chair. He co-leads the Seattle chapter of Global AI Community and co-hosts Securing the Realm, a podcast on AI governance and AI-driven development, with Josh McDonald.`,
}

export const topics: SpeakerTopic[] = [
  {
    title: 'AI agents in production',
    description: 'Design an AI gateway for agents and learn where to put controls for tool access, traffic and usage.',
  },
  {
    title: 'AI governance and security',
    description: 'Decide who can authorise an agent’s actions and how to audit what it did.',
  },
  {
    title: 'Green software and open source',
    description: 'Choose a software carbon metric and see how open source tools can help you measure it.',
  },
]

export const talkFormats: TalkFormat[] = [
  {
    name: 'Keynote',
    duration: '30–60 min',
  },
  {
    name: 'Conference Talk',
    duration: '20–45 min',
  },
  {
    name: 'Panel Discussion',
    duration: '30–60 min',
  },
  { name: 'Workshop', duration: '2–4 hours' },
  {
    name: 'Podcast / Interview',
    duration: '30–60 min',
  },
]

export const logistics: LogisticsItem[] = [
  { label: 'Based in', value: 'Seattle area, Washington (available globally)' },
  { label: 'Timezone', value: 'Pacific Time (PT)' },
  { label: 'Languages', value: 'English (native)' },
  {
    label: 'AV requirements',
    value: 'Lapel mic preferred; minimal slides; prefer clicker to be provided unless demoing; uses own laptop',
  },
  { label: 'Travel', value: 'Happy to travel for in-person events' },
  { label: 'Recording', value: 'Happy to be recorded and for talks to be published online' },
]

export const selectedAppearances = [
  {
    id: 'scottish-summit-2026-ai-superhighway',
    annotation:
      'The programme and preview cover the gateway Chris and Josh McDonald built with participants using Azure API Management.',
  },
  {
    id: 'yt-9ngj7bauuwo',
    annotation: 'A podcast discussion about the legal and security questions behind AI governance.',
  },
  {
    id: 'environmental-variables-podcast-2022',
    annotation: 'Hear Chris as a guest explaining how open source can help reduce software emissions.',
  },
]

export const contactCta = { url: 'https://uk.linkedin.com/in/chrislloydjones' }
