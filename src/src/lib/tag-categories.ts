/** Map individual tags to a visual category key */
export const TAG_TO_CATEGORY: Record<string, string> = {
  // AI & Cognitive
  AI: 'ai-cognitive',
  'Machine Learning': 'ai-cognitive',
  'Cognitive Services': 'ai-cognitive',
  'Cognitive Search': 'ai-cognitive',
  'Anomaly Detector': 'ai-cognitive',
  'Text Analytics': 'ai-cognitive',
  Agolo: 'ai-cognitive',
  'Enterprise AI': 'ai-cognitive',
  'Microsoft Foundry': 'ai-cognitive',
  'Azure AI Foundry': 'ai-cognitive',
  'AI Agents': 'ai-cognitive',
  'Bing Search': 'ai-cognitive',
  MLOps: 'ai-cognitive',

  // Green Software
  'Green Software': 'green-software',
  Sustainability: 'green-software',

  // Security
  Security: 'security',
  'Securing the Realm': 'security',
  'AI Security': 'security',
  AppSec: 'security',
  DevSecOps: 'security',
  'Prompt Injection': 'security',
  'Agent Security': 'security',
  'Supply Chain Security': 'security',
  'Runtime Protection': 'security',
  'Model Security': 'security',
  'ISO 27034': 'security',

  // Events & Media
  Event: 'events-media',
  'External Media': 'events-media',

  // Developer
  'How To': 'developer',
  Snippets: 'developer',
  CLI: 'developer',
  Python: 'developer',
  API: 'developer',
  'Power Automate': 'developer',
  PowerBI: 'developer',
  'MCP Servers': 'developer',
  'Azure APIM': 'developer',
  'API Management': 'developer',

  // Open Source
  'Open Source': 'open-source',

  // Impact & Future
  Impact: 'impact-future',
  Futurology: 'impact-future',
  Future: 'impact-future',
  Governance: 'impact-future',
  'Digital Twins': 'impact-future',
  Microsoft: 'impact-future',
  Azure: 'impact-future',
  'AI Governance': 'impact-future',
}

/** CSS variable suffix for each category */
const CATEGORY_VAR: Record<string, string> = {
  'ai-cognitive': 'ai',
  'green-software': 'green',
  security: 'security',
  'events-media': 'events',
  developer: 'dev',
  'open-source': 'oss',
  'impact-future': 'impact',
}

/** Get the category key for a tag, or 'general' if unmapped */
export function getTagCategory(tag: string): string {
  return TAG_TO_CATEGORY[tag] ?? 'general'
}

/** Get inline style setting --tag-color and --tag-bg CSS custom properties */
export function getTagStyle(tag: string): string | undefined {
  const category = getTagCategory(tag)
  const cssVar = CATEGORY_VAR[category]
  if (!cssVar) return undefined
  return `--tag-color: var(--color-cat-${cssVar}); --tag-bg: var(--color-cat-${cssVar}-bg)`
}
