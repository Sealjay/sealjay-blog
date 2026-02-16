/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  plausible: ((event: string, options?: { props: Record<string, string> }) => void) | undefined
}
