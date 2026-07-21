import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function GET() {
	return new Response(readFileSync(resolve(process.cwd(), "docs/index.md"), "utf8"), {
		headers: {
			"content-type": "text/markdown; charset=utf-8",
		},
	});
}
