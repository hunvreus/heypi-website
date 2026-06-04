import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
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

cpSync(join(docsRoot, "docs"), outRoot, { recursive: true });

const imagesRoot = join(docsRoot, "docs/images");
if (existsSync(imagesRoot)) {
	cpSync(imagesRoot, join(publicDocsRoot, "images"), { recursive: true });
}

const assetsRoot = join(docsRoot, "docs/assets");
if (existsSync(assetsRoot)) {
	cpSync(assetsRoot, join(publicDocsRoot, "assets"), { recursive: true });
}

console.log(`Synced heypi docs from ${sourceRoot}`);
