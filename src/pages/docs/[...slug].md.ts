import { getDocMarkdown, getPages, type DocsPage } from "@/lib/docs";

export function getStaticPaths() {
	return getPages().filter((page) => page.slug).map((page) => ({
		params: { slug: page.slug || undefined },
		props: { page },
	}));
}

export function GET({ props }: { props: { page: DocsPage } }) {
	return new Response(getDocMarkdown(props.page), {
		headers: {
			"content-type": "text/markdown; charset=utf-8",
		},
	});
}
