import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize, resolve } from "node:path";
import { marked, type Token, type Tokens } from "marked";
import GithubSlugger from "github-slugger";
import { codeToHtml } from "shiki";

const root = resolve(process.cwd(), "docs");
const manifestPath = join(root, "docs.json");

export interface DocsManifest {
	title: string;
	description: string;
	source: {
		repo: string;
		branch: string;
		base: string;
	};
	groups: DocsGroup[];
}

export interface DocsLink {
	title: string;
	url: string;
	icon?: string;
	attrs?: Record<string, string>;
}

export interface DocsGroup {
	title: string;
	pages: DocsNavItem[];
}

export type DocsNavItem = DocsPage | DocsLink | DocsSubmenu;

export interface DocsSubmenu {
	type: "submenu";
	title: string;
	icon?: string;
	open?: boolean;
	pages: DocsNavItem[];
}

export interface DocsPage {
	title: string;
	slug: string;
	file: string;
	icon?: string;
}

export interface RenderedDoc {
	page: DocsPage;
	html: string;
	headings: Heading[];
	sourceUrl: string;
	editUrl: string;
}

export interface Heading {
	depth: number;
	id: string;
	text: string;
}

export function getManifest(): DocsManifest {
	return JSON.parse(readFileSync(manifestPath, "utf8")) as DocsManifest;
}

export function getPages(): DocsPage[] {
	return getManifest().groups.flatMap((group) => navPages(group.pages));
}

export function getPage(slug: string): DocsPage | undefined {
	return getPages().find((page) => page.slug === slug);
}

export function isDocsPage(item: DocsNavItem): item is DocsPage {
	return "slug" in item && "file" in item;
}

export function isDocsSubmenu(item: DocsNavItem): item is DocsSubmenu {
	return "type" in item && item.type === "submenu";
}

export function navPages(items: DocsNavItem[]): DocsPage[] {
	return items.flatMap((item) => {
		if (isDocsSubmenu(item)) return navPages(item.pages);
		return isDocsPage(item) ? [item] : [];
	});
}

export function getDocMarkdown(page: DocsPage): string {
	const filePath = resolve(root, page.file);

	if (!filePath.startsWith(root) || !existsSync(filePath)) {
		throw new Error(`Invalid docs page file for ${page.slug}: ${page.file}`);
	}

	return rewriteLinks(rewriteHtmlAssets(readFileSync(filePath, "utf8")), dirname(page.file));
}

export async function renderDoc(page: DocsPage): Promise<RenderedDoc> {
	const manifest = getManifest();
	const markdown = getDocMarkdown(page);
	const headings: Heading[] = [];
	const slugger = new GithubSlugger();
	const renderer = new marked.Renderer();

	renderer.heading = ({ tokens, depth }) => {
		const text = renderer.parser.parseInline(tokens);
		const headingText = plainText(tokens);
		const id = slugger.slug(headingText);
		if (depth > 1 && depth < 4) headings.push({ depth, id, text: headingText });
		return `<h${depth} id="${id}" tabindex="-1"><a class="header-anchor" href="#${id}">${text}</a></h${depth}>`;
	};

	renderer.table = (token: Tokens.Table) => {
		const header = renderer.tablerow({
			text: token.header.map((cell) => renderer.tablecell(cell)).join(""),
		});
		const body = token.rows
			.map((row) =>
				renderer.tablerow({
					text: row.map((cell) => renderer.tablecell(cell)).join(""),
				}),
			)
			.join("");
		const tbody = body ? `<tbody>${body}</tbody>` : "";
		return `<div class="relative my-6 w-full overflow-auto"><table class="table"><thead>${header}</thead>${tbody}</table></div>`;
	};

	const tokens = marked.lexer(markdown);
	await highlightCode(tokens);
	const html = marked.parser(tokens, { renderer });
	const sourcePath = normalize(join(manifest.source.base, "docs", page.file)).replaceAll("\\", "/");
	const sourceUrl = `${manifest.source.repo}/blob/${manifest.source.branch}/${sourcePath}`;
	const editUrl = `${manifest.source.repo}/edit/${manifest.source.branch}/${sourcePath}`;

	return { page, html, headings, sourceUrl, editUrl };
}

async function highlightCode(tokens: Token[]): Promise<void> {
	for (const token of tokens) {
		if (isCodeToken(token)) {
			const html = await highlightToken(token);
			Object.assign(token, {
				type: "html",
				raw: html,
				text: html,
				block: true,
			});
			continue;
		}

		for (const childTokens of nestedTokenLists(token)) {
			await highlightCode(childTokens);
		}
	}
}

function isCodeToken(token: Token): token is Tokens.Code {
	return token.type === "code" && "text" in token;
}

async function highlightToken(token: Tokens.Code): Promise<string> {
	const lang = normalizeLanguage(token.lang);

	try {
		return await codeToHtml(token.text, {
			lang,
			themes: {
				light: "github-light-default",
				dark: "github-dark-default",
			},
			defaultColor: false,
			colorReplacements: {
				"github-dark-default": {
					"#24292e": "oklch(0.145 0 0)",
				},
			},
		});
	} catch {
		return codeToHtml(token.text, {
			lang: "text",
			themes: {
				light: "github-light-default",
				dark: "github-dark-default",
			},
			defaultColor: false,
		});
	}
}

function normalizeLanguage(lang: string | undefined): string {
	const value = lang?.trim().split(/\s+/)[0].toLowerCase() || "text";
	if (value === "njk") return "html";
	if (value === "sh" || value === "shell") return "bash";
	if (value === "tsx" || value === "jsx" || value === "ts" || value === "js") return value;
	return value;
}

function nestedTokenLists(token: Token): Token[][] {
	const lists: Token[][] = [];
	const value = token as Token & {
		tokens?: Token[];
		items?: Array<{ tokens?: Token[] }>;
		rows?: Array<{ tokens?: Token[] }>;
		header?: Array<{ tokens?: Token[] }>;
	};

	if (value.tokens) lists.push(value.tokens);
	if (value.items) lists.push(...value.items.flatMap((item) => (item.tokens ? [item.tokens] : [])));
	if (value.rows) lists.push(...value.rows.flatMap((cell) => (cell.tokens ? [cell.tokens] : [])));
	if (value.header) lists.push(...value.header.flatMap((cell) => (cell.tokens ? [cell.tokens] : [])));

	return lists;
}

function plainText(tokens: Token[]): string {
	return tokens
		.map((token) => {
			const value = token as Token & { text?: string; tokens?: Token[] };
			if (value.tokens) return plainText(value.tokens);
			return value.text ?? token.raw ?? "";
		})
		.join("");
}

function rewriteLinks(markdown: string, fromDir: string): string {
	const slugsByFile = pageSlugsByFile();

	return markdown.replace(/\]\(([^)]+)\)/g, (match, href: string) => {
		if (/^[a-z]+:/i.test(href) || href.startsWith("#")) return match;

		const [target, hash = ""] = href.split("#");
		if (!target.endsWith(".md")) {
			return match.replace(href, publicAssetPath(target, fromDir, hash));
		}

		const normalized = normalize(join(fromDir, target)).replaceAll("\\", "/");
		const slug = slugsByFile.get(normalized);
		if (slug === undefined) return match;
		return match.replace(href, `/docs${slug ? `/${slug}` : ""}${hash ? `#${hash}` : ""}`);
	});
}

function pageSlugsByFile(): Map<string, string> {
	return new Map(getPages().map((page) => [normalize(page.file).replaceAll("\\", "/"), page.slug]));
}

function publicAssetPath(target: string, fromDir: string, hash: string): string {
	const normalized = normalize(join(fromDir, target)).replaceAll("\\", "/");
	if (normalized.startsWith("assets/")) return `/docs/${normalized}${hash ? `#${hash}` : ""}`;
	if (normalized.startsWith("images/")) return `/docs/${normalized}${hash ? `#${hash}` : ""}`;
	if (normalized.endsWith("/docs/assets") || normalized.includes("/docs/assets/")) {
		return `/docs/assets/${normalized.split("/docs/assets/").pop() || ""}${hash ? `#${hash}` : ""}`;
	}
	return `${target}${hash ? `#${hash}` : ""}`;
}

function rewriteHtmlAssets(markdown: string): string {
	return markdown.replaceAll("docs/assets/", "/docs/assets/");
}
