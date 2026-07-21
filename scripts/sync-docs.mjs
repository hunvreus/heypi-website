import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const localDefault = resolve(root, "../biots");
const sourceRoot = resolve(
	process.env.HEYPI_DOCS_PATH || (existsSync(join(localDefault, "packages/heypi/docs/docs.json")) ? localDefault : ".cache/heypi"),
);
const cacheRoot = resolve(root, ".cache/heypi");
const docsRoot = join(sourceRoot, "packages/heypi");
const outRoot = join(root, "docs");
const legacyOutRoot = join(root, "src/generated/docs");
const publicDocsRoot = join(root, "public/docs");

if (!existsSync(join(docsRoot, "docs/docs.json"))) {
	const repo = process.env.HEYPI_DOCS_REPO || "https://github.com/hunvreus/heypi.git";
	const ref = process.env.HEYPI_DOCS_REF || "main";

	rmSync(cacheRoot, { force: true, recursive: true });
	mkdirSync(dirname(cacheRoot), { recursive: true });
	execFileSync("git", ["clone", "--depth", "1", "--branch", ref, repo, cacheRoot], { stdio: "inherit" });
}

if (!existsSync(join(docsRoot, "docs/docs.json"))) {
	throw new Error(`Missing docs manifest at ${join(docsRoot, "docs/docs.json")}`);
}

rmSync(outRoot, { force: true, recursive: true });
rmSync(legacyOutRoot, { force: true, recursive: true });
rmSync(publicDocsRoot, { force: true, recursive: true });
mkdirSync(outRoot, { recursive: true });
mkdirSync(publicDocsRoot, { recursive: true });

cpSync(join(docsRoot, "docs"), outRoot, { filter: omitMacMetadata, recursive: true });
const manifestPath = join(outRoot, "docs.json");
const manifest = normalizeManifest(manifestPath);
rewriteInternalMarkdownLinks(outRoot, manifest);

const imagesRoot = join(docsRoot, "docs/images");
if (existsSync(imagesRoot)) {
	cpSync(imagesRoot, join(publicDocsRoot, "images"), { filter: omitMacMetadata, recursive: true });
}

const assetsRoot = join(docsRoot, "docs/assets");
if (existsSync(assetsRoot)) {
	cpSync(assetsRoot, join(publicDocsRoot, "assets"), { filter: omitMacMetadata, recursive: true });
}

console.log(`Synced heypi docs from ${sourceRoot}`);

function normalizeManifest(manifestPath) {
	const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
	if (Array.isArray(manifest.menu)) return manifest;
	if (!Array.isArray(manifest.groups)) {
		throw new Error(`Docs manifest must contain either menu or groups: ${manifestPath}`);
	}

	const menu = manifest.groups.map((group) => ({
		type: "group",
		label: group.title,
		items: (group.pages || []).map(normalizeItem),
	}));

	const normalized = {
		title: manifest.title,
		description: manifest.description,
		source: manifest.source,
		menu,
	};

	writeFileSync(manifestPath, `${JSON.stringify(normalized, null, "\t")}\n`);
	return normalized;
}

function normalizeItem(item) {
	if (item.type === "submenu") {
		return {
			type: "submenu",
			label: item.title || item.label,
			icon: item.icon,
			open: item.open,
			items: (item.pages || item.items || []).map(normalizeItem),
		};
	}

	if (item.url) {
		return {
			type: "item",
			label: item.title || item.label,
			url: item.url,
			icon: item.icon,
			attrs: item.attrs,
		};
	}

	return {
		type: "item",
		label: item.title || item.label,
		slug: slugFromFile(item.file, item.slug),
		icon: item.icon,
	};
}

function slugFromFile(file, fallback = "") {
	if (!file) return fallback || "index";
	return file.replace(/\.(md|mdx)$/i, "") || "index";
}

function rewriteInternalMarkdownLinks(root, manifest) {
	const routeByFile = new Map();
	for (const item of manifestItems(manifest.menu || [])) {
		if (!item.slug) continue;
		routeByFile.set(`${item.slug}.md`, routePath(item.slug));
		routeByFile.set(`${item.slug}.mdx`, routePath(item.slug));
	}

	for (const filePath of markdownFiles(root)) {
		const fromDir = dirname(filePath);
		const content = readFileSync(filePath, "utf8");
		const next = content.replace(/\]\(([^)]+)\)/g, (match, href) => {
			if (/^[a-z]+:/i.test(href) || href.startsWith("#")) return match;

			const [target, hash = ""] = href.split("#");
			if (!/\.(md|mdx)$/i.test(target)) return match;

			const absoluteTarget = resolve(fromDir, target);
			const relativeTarget = absoluteTarget.startsWith(root)
				? absoluteTarget.slice(root.length + 1).replaceAll("\\", "/")
				: "";
			const route = routeByFile.get(relativeTarget);
			if (!route) return match;

			return match.replace(href, `${route}${hash ? `#${hash}` : ""}`);
		});

		if (next !== content) writeFileSync(filePath, next);
	}
}

function manifestItems(groups) {
	const out = [];
	const walk = (items = []) => {
		for (const item of items) {
			if (typeof item === "string") {
				out.push({ slug: item });
				continue;
			}
			if (item?.type === "submenu") {
				walk(item.items || []);
				continue;
			}
			if (item?.slug) out.push(item);
		}
	};

	for (const group of groups) {
		if (group?.type === "group") walk(group.items || []);
	}
	return out;
}

function markdownFiles(root) {
	const out = [];
	const walk = (dir) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const fullPath = join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
			} else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
				out.push(fullPath);
			}
		}
	};
	walk(root);
	return out;
}

function routePath(slug) {
	const clean = slug.replace(/^\/+|\/+$/g, "");
	if (!clean || clean === "index") return "/docs/";
	const withoutIndex = clean.endsWith("/index") ? clean.slice(0, -"/index".length) : clean;
	return `/docs/${withoutIndex}/`;
}

function omitMacMetadata(source) {
	return basename(source) !== ".DS_Store";
}
