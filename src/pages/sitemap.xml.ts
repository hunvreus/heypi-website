import { getPages } from "@/lib/docs";

const site = "https://heypi.dev";

function url(path: string): string {
	return new URL(path, site).toString();
}

export function GET() {
	const paths = [
		"/",
		...getPages().map((page) => `/docs${page.slug ? `/${page.slug}` : ""}/`),
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
	.map(
		(path) => `	<url>
		<loc>${url(path)}</loc>
	</url>`,
	)
	.join("\n")}
</urlset>
`;

	return new Response(body, {
		headers: {
			"content-type": "application/xml; charset=utf-8",
		},
	});
}
