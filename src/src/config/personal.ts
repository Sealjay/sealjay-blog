// Professional badges/affiliations
export interface Badge {
  text: string;
  url?: string;
  isFormerRole?: boolean;
}

// Current role information
export const currentRole = {
  title: "Principal Architect",
  company: "Kyndryl",
  displayText: "Principal Architect at Kyndryl"
};

export const professionalBadges: Badge[] = [
  {
    text: "Microsoft MVP in AI",
    url: "https://mvp.microsoft.com/en-US/mvp/profile/224176f9-f3a7-eb11-b1ac-000d3a53daf4",
  },
  
  {
    text: "Green Software Foundation Steering Committee Vice-Chair",
    url: "https://greensoftware.foundation/"
  },
  
  {
    text: "TODO Group Member",
    url: "https://todogroup.org/"
  },
  {
    text: "OpenUK Ambassador",
    url: "https://greensoftware.foundation/"
  },
  {
    text: "Securing the Realm",
    url: "https://securing.quest"
  }
];

// Former roles to display (if any)
export const formerRoles: Badge[] = [
    {
        text: "Head of Platforms & Incubation at Avanade",
        url: "https://www.avanade.com/",
        isFormerRole: true
      },
    {
        text: "OpenUK Chief Blueprints Officer & Leadership",
        url: "https://openuk.uk/",
        isFormerRole: true
      },
      {
        text: "GSF Open Source Working Group Chair",
        url: "https://greensoftware.foundation/"
      },
      {
        text: "OpenUK London Meetup Organiser",
        url: "https://openuk.uk/",
        isFormerRole: true
      }
];

// Export all badges together
export const allBadges = [...professionalBadges, ...formerRoles];