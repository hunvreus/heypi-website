import { getDocMarkdown, getPages } from "@/lib/docs";

export function GET() {
	const page = getPages().find((item) => item.slug === "");
	if (!page) return new Response("Not found", { status: 404 });

	return new Response(getDocMarkdown(page), {
		headers: {
			"content-type": "text/markdown; charset=utf-8",
		},
	});
}
