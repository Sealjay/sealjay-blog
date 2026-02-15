export interface SpeakerTopic {
  title: string
  description: string
  icon: string
}

export interface TalkFormat {
  name: string
  duration: string
  description: string
}

export interface Testimonial {
  quote: string
  author: string
  role: string
  event?: string
}

export interface LogisticsItem {
  label: string
  value: string
}

export const speakerBio = {
  short:
    'Chris Lloyd-Jones (Sealjay) is a VP of AI Consulting Transformation at Kyndryl, six-time Microsoft MVP in AI, and doctoral researcher in Green Software Engineering. He speaks on open source, sustainability in tech, and the responsible adoption of AI.',
  long: "With over a decade of experience bridging technology strategy and engineering, Chris brings a unique perspective to every stage. A former Head of AI at Avanade, Vice-Chair of the Green Software Foundation Steering Committee, and contributor to ISO/IEC 21031:2024, he combines deep technical knowledge with a passion for making technology more sustainable and accessible. Chris is co-host of Securing the Realm, a cybersecurity community initiative, and an OpenUK Ambassador recognised in the 2025/26 New Year's Honours.",
}

export const topics: SpeakerTopic[] = [
  {
    title: 'AI Strategy & Adoption',
    description:
      'Practical guidance on embedding AI across organisations responsibly, from proof-of-concept to production at scale.',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    title: 'Green Software Engineering',
    description:
      'How to measure, reduce, and report on the carbon impact of software systems, drawing on ISO/IEC 21031 and the SCI specification.',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Open Source in the Enterprise',
    description:
      'Building open source programmes, contribution strategies, and the business case for open collaboration.',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  },
  {
    title: 'AI Security & AppSec',
    description:
      'Securing AI-powered applications, threat modelling for LLMs, and building defence-in-depth for intelligent systems.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    title: 'Responsible AI & Governance',
    description:
      'Frameworks for ethical AI deployment, bias detection, and building governance structures that organisations can actually use.',
    icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  },
]

export const talkFormats: TalkFormat[] = [
  {
    name: 'Keynote',
    duration: '30-60 min',
    description: 'High-energy presentations on strategic themes for large audiences.',
  },
  {
    name: 'Conference Talk',
    duration: '20-45 min',
    description: 'Deep-dive technical or strategic sessions with Q&A.',
  },
  {
    name: 'Panel Discussion',
    duration: '30-60 min',
    description: 'Moderated conversations on industry trends with fellow experts.',
  },
  { name: 'Workshop', duration: '2-4 hours', description: 'Hands-on, interactive sessions for smaller groups.' },
  {
    name: 'Podcast / Interview',
    duration: '30-60 min',
    description: 'Conversational formats for audio, video, or written media.',
  },
]

export const testimonials: Testimonial[] = [
  {
    quote:
      'Chris delivered an incredibly engaging session that combined deep technical insight with practical advice our audience could act on immediately.',
    author: 'Event Organiser',
    role: 'State of Open Con',
    event: 'SOOCon 2023',
  },
  {
    quote: 'One of the most thoughtful speakers on the intersection of sustainability and software engineering.',
    author: 'Conference Chair',
    role: 'Green Software Foundation Global Summit',
    event: 'GSF Summit 2022',
  },
]

export const logistics: LogisticsItem[] = [
  { label: 'Based in', value: 'London, UK (available globally)' },
  { label: 'Languages', value: 'English (native)' },
  { label: 'AV requirements', value: 'Lapel mic preferred; own clicker' },
  { label: 'Travel', value: 'Happy to travel for in-person events' },
]

export const contactCta = {
  heading: 'Invite Chris to Speak',
  description:
    'Interested in having Chris speak at your event? Get in touch to discuss topics, formats, and availability.',
  url: 'https://uk.linkedin.com/in/chrislloydjones',
}

export const headshot = '/chris/portrait.jpg'
