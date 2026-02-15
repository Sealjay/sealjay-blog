import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

// ---------------------------------------------------------------------------
// Category definitions – deterministic mapping from tags to visual themes
// ---------------------------------------------------------------------------

export interface CategoryTheme {
	name: string;
	/** Bright accent used for the badge and decorative elements */
	accent: string;
	/** Muted version of the accent for pattern fill */
	accentMuted: string;
	/** Pattern generator key */
	pattern: "circuits" | "waves" | "shield" | "diagonal" | "brackets" | "hexagons" | "arrows" | "dots";
}

const CATEGORIES: Record<string, CategoryTheme> = {
	"ai-cognitive": {
		name: "AI & Cognitive",
		accent: "#818cf8", // accent-400 (indigo)
		accentMuted: "#6366f1",
		pattern: "circuits",
	},
	"green-software": {
		name: "Green Software",
		accent: "#34d399", // emerald-400
		accentMuted: "#10b981",
		pattern: "waves",
	},
	security: {
		name: "Security",
		accent: "#fb7185", // rose-400
		accentMuted: "#e11d48",
		pattern: "shield",
	},
	"events-media": {
		name: "Events & Media",
		accent: "#fb923c", // orange-400
		accentMuted: "#ea580c",
		pattern: "diagonal",
	},
	developer: {
		name: "Developer",
		accent: "#22d3ee", // cyan-400
		accentMuted: "#06b6d4",
		pattern: "brackets",
	},
	"open-source": {
		name: "Open Source",
		accent: "#a78bfa", // violet-400
		accentMuted: "#7c3aed",
		pattern: "hexagons",
	},
	"impact-future": {
		name: "Impact & Future",
		accent: "#38bdf8", // sky-400
		accentMuted: "#0284c7",
		pattern: "arrows",
	},
	general: {
		name: "General",
		accent: "#a5b4fc", // accent-300
		accentMuted: "#6366f1",
		pattern: "dots",
	},
};

/** Map individual tags to a category key */
const TAG_TO_CATEGORY: Record<string, string> = {
	AI: "ai-cognitive",
	"Machine Learning": "ai-cognitive",
	"Cognitive Services": "ai-cognitive",
	"Cognitive Search": "ai-cognitive",
	"Anomaly Detector": "ai-cognitive",
	"Text Analytics": "ai-cognitive",
	Agolo: "ai-cognitive",

	"Green Software": "green-software",
	Sustainability: "green-software",

	Security: "security",

	Event: "events-media",
	"External Media": "events-media",

	"How To": "developer",
	Snippets: "developer",
	CLI: "developer",
	Python: "developer",
	API: "developer",
	"Power Automate": "developer",
	PowerBI: "developer",

	"Open Source": "open-source",

	Impact: "impact-future",
	Futurology: "impact-future",
	Future: "impact-future",
	Governance: "impact-future",
	"Digital Twins": "impact-future",
	Microsoft: "impact-future",
};

/** Priority order when a post has multiple tags from different categories */
const CATEGORY_PRIORITY = [
	"ai-cognitive",
	"green-software",
	"security",
	"developer",
	"open-source",
	"impact-future",
	"events-media",
	"general",
];

export function resolveCategory(tags: string[] | undefined): CategoryTheme {
	if (!tags || tags.length === 0) return CATEGORIES.general;

	const matched = new Set<string>();
	for (const tag of tags) {
		const cat = TAG_TO_CATEGORY[tag];
		if (cat) matched.add(cat);
	}

	for (const cat of CATEGORY_PRIORITY) {
		if (matched.has(cat)) return CATEGORIES[cat];
	}

	return CATEGORIES.general;
}

// ---------------------------------------------------------------------------
// Deterministic hash from slug → seed for pattern variation
// ---------------------------------------------------------------------------

function hashSlug(slug: string): number {
	let hash = 0;
	for (let i = 0; i < slug.length; i++) {
		const char = slug.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}
	return Math.abs(hash);
}

// ---------------------------------------------------------------------------
// Pattern element generators – produce arrays of Satori-compatible React nodes
// ---------------------------------------------------------------------------

interface PatternElement {
	type: "div";
	props: {
		style: Record<string, string | number>;
		children?: PatternElement[];
	};
}

function seededRandom(seed: number, index: number): number {
	const x = Math.sin(seed + index * 127.1) * 43758.5453;
	return x - Math.floor(x);
}

function generatePatternElements(
	pattern: CategoryTheme["pattern"],
	accent: string,
	seed: number,
): PatternElement[] {
	const elements: PatternElement[] = [];
	const count = 12;

	switch (pattern) {
		case "circuits": {
			// Circles connected by lines – tech/AI feel
			for (let i = 0; i < count; i++) {
				const x = seededRandom(seed, i * 3) * 500 + 700;
				const y = seededRandom(seed, i * 3 + 1) * 500 + 60;
				const size = 8 + seededRandom(seed, i * 3 + 2) * 24;
				elements.push({
					type: "div",
					props: {
						style: {
							position: "absolute",
							left: `${x}px`,
							top: `${y}px`,
							width: `${size}px`,
							height: `${size}px`,
							borderRadius: "50%",
							border: `2px solid ${accent}`,
							opacity: 0.15 + seededRandom(seed, i + 100) * 0.15,
						},
					},
				});
			}
			// Connecting lines
			for (let i = 0; i < 6; i++) {
				const x = seededRandom(seed, i * 5 + 50) * 400 + 750;
				const y = seededRandom(seed, i * 5 + 51) * 400 + 100;
				const w = 60 + seededRandom(seed, i * 5 + 52) * 120;
				const rotation = seededRandom(seed, i * 5 + 53) * 360;
				elements.push({
					type: "div",
					props: {
						style: {
							position: "absolute",
							left: `${x}px`,
							top: `${y}px`,
							width: `${w}px`,
							height: "2px",
							backgroundColor: accent,
							opacity: 0.08,
							transform: `rotate(${rotation}deg)`,
						},
					},
				});
			}
			break;
		}
		case "waves": {
			// Concentric arcs – organic/sustainability feel
			for (let i = 0; i < 8; i++) {
				const size = 100 + i * 60;
				elements.push({
					type: "div",
					props: {
						style: {
							position: "absolute",
							right: `${-size / 3}px`,
							bottom: `${-size / 3 + seededRandom(seed, i) * 40}px`,
							width: `${size}px`,
							height: `${size}px`,
							borderRadius: "50%",
							border: `2px solid ${accent}`,
							opacity: 0.08 + (8 - i) * 0.02,
						},
					},
				});
			}
			break;
		}
		case "shield": {
			// Diamond/shield shapes – security feel
			for (let i = 0; i < count; i++) {
				const x = seededRandom(seed, i * 4) * 450 + 720;
				const y = seededRandom(seed, i * 4 + 1) * 450 + 80;
				const size = 16 + seededRandom(seed, i * 4 + 2) * 40;
				elements.push({
					type: "div",
					props: {
						style: {
							position: "absolute",
							left: `${x}px`,
							top: `${y}px`,
							width: `${size}px`,
							height: `${size}px`,
							backgroundColor: accent,
							opacity: 0.06 + seededRandom(seed, i + 200) * 0.1,
							transform: "rotate(45deg)",
							borderRadius: "4px",
						},
					},
				});
			}
			break;
		}
		case "diagonal": {
			// Diagonal stripes – dynamic/event feel
			for (let i = 0; i < 10; i++) {
				const x = 650 + i * 55;
				elements.push({
					type: "div",
					props: {
						style: {
							position: "absolute",
							left: `${x}px`,
							top: "-20px",
							width: "3px",
							height: "700px",
							backgroundColor: accent,
							opacity: 0.06 + seededRandom(seed, i + 300) * 0.08,
							transform: `rotate(${25 + seededRandom(seed, i) * 10}deg)`,
						},
					},
				});
			}
			break;
		}
		case "brackets": {
			// Code bracket shapes – developer feel
			for (let i = 0; i < 8; i++) {
				const x = seededRandom(seed, i * 6) * 400 + 750;
				const y = seededRandom(seed, i * 6 + 1) * 400 + 80;
				const size = 20 + seededRandom(seed, i * 6 + 2) * 30;
				const isLeft = i % 2 === 0;
				elements.push({
					type: "div",
					props: {
						style: {
							position: "absolute",
							left: `${x}px`,
							top: `${y}px`,
							width: `${size}px`,
							height: `${size * 2}px`,
							borderLeft: isLeft ? `3px solid ${accent}` : "none",
							borderRight: isLeft ? "none" : `3px solid ${accent}`,
							borderTop: `3px solid ${accent}`,
							borderBottom: `3px solid ${accent}`,
							borderRadius: isLeft ? "6px 0 0 6px" : "0 6px 6px 0",
							opacity: 0.1 + seededRandom(seed, i + 400) * 0.1,
						},
					},
				});
			}
			break;
		}
		case "hexagons": {
			// Hexagon-ish shapes (rounded squares rotated) – open source / community feel
			for (let i = 0; i < count; i++) {
				const x = seededRandom(seed, i * 7) * 450 + 700;
				const y = seededRandom(seed, i * 7 + 1) * 450 + 60;
				const size = 20 + seededRandom(seed, i * 7 + 2) * 35;
				elements.push({
					type: "div",
					props: {
						style: {
							position: "absolute",
							left: `${x}px`,
							top: `${y}px`,
							width: `${size}px`,
							height: `${size}px`,
							border: `2px solid ${accent}`,
							borderRadius: `${size * 0.25}px`,
							opacity: 0.1 + seededRandom(seed, i + 500) * 0.12,
							transform: `rotate(${30 + seededRandom(seed, i) * 30}deg)`,
						},
					},
				});
			}
			break;
		}
		case "arrows": {
			// Upward chevrons – impact/future/progress feel
			for (let i = 0; i < 8; i++) {
				const x = seededRandom(seed, i * 8) * 400 + 750;
				const y = seededRandom(seed, i * 8 + 1) * 400 + 100;
				const size = 18 + seededRandom(seed, i * 8 + 2) * 28;
				elements.push({
					type: "div",
					props: {
						style: {
							position: "absolute",
							left: `${x}px`,
							top: `${y}px`,
							width: `${size}px`,
							height: `${size}px`,
							borderTop: `3px solid ${accent}`,
							borderRight: `3px solid ${accent}`,
							opacity: 0.1 + seededRandom(seed, i + 600) * 0.12,
							transform: `rotate(-45deg)`,
						},
					},
				});
			}
			break;
		}
		case "dots":
		default: {
			// Subtle dot grid – general/neutral
			for (let i = 0; i < 20; i++) {
				const x = seededRandom(seed, i * 2) * 480 + 700;
				const y = seededRandom(seed, i * 2 + 1) * 520 + 50;
				const size = 4 + seededRandom(seed, i * 2 + 2) * 10;
				elements.push({
					type: "div",
					props: {
						style: {
							position: "absolute",
							left: `${x}px`,
							top: `${y}px`,
							width: `${size}px`,
							height: `${size}px`,
							borderRadius: "50%",
							backgroundColor: accent,
							opacity: 0.06 + seededRandom(seed, i + 700) * 0.08,
						},
					},
				});
			}
			break;
		}
	}

	return elements;
}

// ---------------------------------------------------------------------------
// Satori template – the visual design of the OG card
// ---------------------------------------------------------------------------

interface OGTemplateInput {
	title: string;
	tags: string[] | undefined;
	pubDate: Date | undefined;
	slug: string;
}

function buildTemplate(input: OGTemplateInput) {
	const category = resolveCategory(input.tags);
	const seed = hashSlug(input.slug);
	const patternElements = generatePatternElements(
		category.pattern,
		category.accent,
		seed,
	);

	const formattedDate = input.pubDate
		? input.pubDate.toLocaleDateString("en-GB", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: "";

	// Truncate title for display – max ~90 chars to fit comfortably
	const displayTitle =
		input.title.length > 90
			? `${input.title.substring(0, 87)}...`
			: input.title;

	return {
		type: "div",
		props: {
			style: {
				width: "1200px",
				height: "630px",
				display: "flex",
				position: "relative",
				overflow: "hidden",
				// Deep indigo-to-slate gradient background
				background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #020617 100%)",
				fontFamily: "Manrope, Inter, sans-serif",
			},
			children: [
				// Subtle gradient overlay for depth
				{
					type: "div",
					props: {
						style: {
							position: "absolute",
							top: "0",
							left: "0",
							width: "1200px",
							height: "630px",
							background: `radial-gradient(ellipse at 20% 50%, ${category.accentMuted}15 0%, transparent 60%)`,
						},
					},
				},
				// Pattern elements (right side, decorative)
				...patternElements,
				// Accent bar on the left edge
				{
					type: "div",
					props: {
						style: {
							position: "absolute",
							left: "0",
							top: "0",
							width: "6px",
							height: "630px",
							background: `linear-gradient(180deg, ${category.accent} 0%, ${category.accentMuted} 100%)`,
						},
					},
				},
				// Content area
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							padding: "56px 60px",
							width: "1200px",
							height: "630px",
							position: "relative",
						},
						children: [
							// Top: Site branding
							{
								type: "div",
								props: {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "12px",
									},
									children: [
										// Small accent dot as logo stand-in
										{
											type: "div",
											props: {
												style: {
													width: "12px",
													height: "12px",
													borderRadius: "50%",
													backgroundColor: category.accent,
												},
											},
										},
										{
											type: "div",
											props: {
												style: {
													fontSize: "18px",
													fontWeight: 600,
													color: "#a5b4fc",
													letterSpacing: "0.05em",
												},
												children: "sealjay.com",
											},
										},
									],
								},
							},
							// Middle: Title
							{
								type: "div",
								props: {
									style: {
										display: "flex",
										flexDirection: "column",
										gap: "20px",
										maxWidth: "900px",
									},
									children: [
										{
											type: "div",
											props: {
												style: {
													fontSize:
														displayTitle.length > 60
															? "36px"
															: displayTitle.length > 40
																? "42px"
																: "48px",
													fontWeight: 700,
													color: "#f4f4f5",
													lineHeight: 1.25,
													letterSpacing: "-0.02em",
												},
												children: displayTitle,
											},
										},
									],
								},
							},
							// Bottom: Category badge + date + author
							{
								type: "div",
								props: {
									style: {
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
									},
									children: [
										// Left: category badge + date
										{
											type: "div",
											props: {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "16px",
												},
												children: [
													// Category badge
													{
														type: "div",
														props: {
															style: {
																display: "flex",
																alignItems: "center",
																gap: "8px",
																padding: "6px 16px",
																borderRadius: "9999px",
																backgroundColor: `${category.accent}22`,
																border: `1px solid ${category.accent}44`,
															},
															children: [
																{
																	type: "div",
																	props: {
																		style: {
																			width: "8px",
																			height: "8px",
																			borderRadius: "50%",
																			backgroundColor:
																				category.accent,
																		},
																	},
																},
																{
																	type: "div",
																	props: {
																		style: {
																			fontSize: "14px",
																			fontWeight: 600,
																			color: category.accent,
																		},
																		children: category.name,
																	},
																},
															],
														},
													},
													// Date
													formattedDate
														? {
																type: "div",
																props: {
																	style: {
																		fontSize: "14px",
																		color: "#a1a1aa",
																	},
																	children: formattedDate,
																},
															}
														: {
																type: "div",
																props: {
																	style: { display: "none" },
																},
															},
												],
											},
										},
										// Right: author
										{
											type: "div",
											props: {
												style: {
													fontSize: "14px",
													fontWeight: 500,
													color: "#71717a",
												},
												children: "Chris Lloyd-Jones",
											},
										},
									],
								},
							},
						],
					},
				},
			],
		},
	};
}

// ---------------------------------------------------------------------------
// Font loading – read from @fontsource npm packages (no network needed)
// ---------------------------------------------------------------------------

function resolveFontPath(pkg: string, fileName: string): string {
	const require = createRequire(import.meta.url);
	const pkgJson = require.resolve(`${pkg}/package.json`);
	const pkgDir = pkgJson.replace(/\/package\.json$/, "");
	return join(pkgDir, "files", fileName);
}

function loadFonts(): { name: string; data: ArrayBuffer; weight: number; style: string }[] {
	const fontFiles = [
		{
			name: "Manrope",
			weight: 700,
			file: resolveFontPath("@fontsource/manrope", "manrope-latin-700-normal.woff"),
		},
		{
			name: "Manrope",
			weight: 600,
			file: resolveFontPath("@fontsource/manrope", "manrope-latin-600-normal.woff"),
		},
		{
			name: "Inter",
			weight: 400,
			file: resolveFontPath("@fontsource/inter", "inter-latin-400-normal.woff"),
		},
	];

	return fontFiles.map((font) => {
		const data = readFileSync(font.file);
		return {
			name: font.name,
			data: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
			weight: font.weight,
			style: "normal" as const,
		};
	});
}

// Cache fonts in module scope so they're only loaded once per build
let fontCache: ReturnType<typeof loadFonts> | null = null;

function getFonts() {
	if (!fontCache) {
		fontCache = loadFonts();
	}
	return fontCache;
}

// ---------------------------------------------------------------------------
// Public API – generate a PNG buffer for a blog post
// ---------------------------------------------------------------------------

export async function generateOGImage(input: OGTemplateInput): Promise<Buffer> {
	const fonts = getFonts();
	const template = buildTemplate(input);

	const svg = await satori(template as any, {
		width: 1200,
		height: 630,
		fonts,
	});

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: "width",
			value: 1200,
		},
	});

	const pngData = resvg.render();
	return Buffer.from(pngData.asPng());
}

export function getOGImagePath(slug: string): string {
	return `/og/${slug}.png`;
}
