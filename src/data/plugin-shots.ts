/**
 * A screenshot for an open-source plugin's page, in both themes, shown under the hero of
 * /plugins/<id>/. Kept apart from plugins.ts because `npm run sync:plugins` imports that file in
 * plain Node, which cannot load an image. Captured like every other frame
 * (src/assets/screens/MANIFEST.md).
 */
import type { ImageMetadata } from 'astro'
import guideDark from '../assets/screens/plugin-guide.dark.png'
import guideLight from '../assets/screens/plugin-guide.light.png'

export interface PluginShot {
	light: ImageMetadata
	dark: ImageMetadata
	alt: string
	url?: string
}

const SHOTS: Record<string, PluginShot> = {
	guide: {
		light: guideLight,
		dark: guideDark,
		alt: 'The user guide open on Getting started, with Ask the Guide beside it answering “How do I invite a colleague?” in numbered steps.',
		url: 'acme.example.com/guide',
	},
}

export function shotFor(id: string): PluginShot | undefined {
	return SHOTS[id]
}
