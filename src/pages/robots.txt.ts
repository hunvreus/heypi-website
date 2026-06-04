const site = "https://heypi.dev";

export function GET() {
	return new Response(
		`User-agent: *
Allow: /

Sitemap: ${site}/sitemap.xml
`,
		{
			headers: {
				"content-type": "text/plain; charset=utf-8",
			},
		},
	);
}
