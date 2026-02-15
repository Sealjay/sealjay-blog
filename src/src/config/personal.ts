// Professional badges/affiliations
export interface Badge {
  text: string
  url?: string
  isFormerRole?: boolean
}

// Current role information
export const currentRole = {
  title: 'VP, AI Consulting Transformation',
  company: 'Kyndryl',
  displayText: 'VP, AI Consulting Transformation at Kyndryl',
}

// Location
export const location = 'London'

export const professionalBadges: Badge[] = [
  {
    text: '6x Microsoft MVP in AI',
    url: 'https://mvp.microsoft.com/en-US/mvp/profile/224176f9-f3a7-eb11-b1ac-000d3a53daf4',
  },
  {
    text: 'Co-author, ISO/IEC 21031:2024',
  },
  {
    text: 'Doctoral Researcher, Green AI (UEL, 2022\u20132027)',
    url: 'https://orcid.org/0000-0001-7995-7865',
  },
  {
    text: 'Green Software Foundation Steering Committee Vice-Chair',
    url: 'https://greensoftware.foundation/',
  },
  {
    text: 'TODO Group Member',
    url: 'https://todogroup.org/',
  },
  {
    text: 'OpenUK Ambassador',
    url: 'https://openuk.uk/',
  },
  {
    text: 'OpenUK New Year\u2019s Honours 2025/26 Recipient',
    url: 'https://openuk.uk/honours/',
  },
  {
    text: 'Securing the Realm',
    url: 'https://securing.quest',
  },
]

// Former roles to display (if any)
export const formerRoles: Badge[] = [
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

// Export all badges together
export const allBadges = [...professionalBadges, ...formerRoles]
