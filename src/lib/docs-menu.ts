import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

export interface DocsMenuItem {
	type?: string;
	label?: string;
	slug?: string;
	url?: string;
	items?: DocsMenuItem[];
}

export interface DocsManifest {
	menu: Array<{
		type: "group";
		label: string;
		items: DocsMenuItem[];
	}>;
}

const docsRoot = resolve(process.cwd(), "docs");

export function getDocsManifest(): DocsManifest {
	return JSON.parse(readFileSync(join(docsRoot, "docs.json"), "utf8")) as DocsManifest;
}

export function getDocsPages(): Array<{ title: string; slug: string; path: string; markdownPath: string }> {
	const pages: Array<{ title: string; slug: string; path: string; markdownPath: string }> = [];

	const walk = (items: DocsMenuItem[]) => {
		for (const item of items) {
			if (typeof item === "string") continue;
			if (item.type === "submenu") {
				walk(item.items || []);
				continue;
			}
			if (!item.slug) continue;
			pages.push({
				title: item.label || titleFromSlug(item.slug),
				slug: item.slug,
				path: routePath(item.slug),
				markdownPath: `/docs/${item.slug}.md`,
			});
		}
	};

	for (const group of getDocsManifest().menu || []) {
		walk(group.items || []);
	}

	return pages;
}

export function routePath(slug: string): string {
	const clean = slug.replace(/^\/+|\/+$/g, "");
	if (!clean || clean === "index") return "/docs/";
	const withoutIndex = clean.endsWith("/index") ? clean.slice(0, -"/index".length) : clean;
	return `/docs/${withoutIndex}/`;
}

function titleFromSlug(slug: string): string {
	const parts = slug.split("/");
	const last = parts.at(-1) === "index" ? parts.at(-2) : parts.at(-1);
	return (last || "Introduction").replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
