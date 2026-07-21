import { defineConfig } from "astro/config";
import reallySimpleDocs from "reallysimpledocs/astro";

export default defineConfig({
	site: "https://heypi.dev",
	output: "static",
	integrations: [
		reallySimpleDocs({
			docsDir: "./docs",
			routeBase: "/docs",
			style: "vega",
			customCss: ["./src/site.css"],
			bodyAttrs: {
				"hx-boost": "true",
				"hx-target": "#content",
				"hx-select": "#content",
				"hx-swap": "outerHTML",
				"hx-push-url": "true",
			},
			shiki: {
				themes: {
					light: "min-light",
					dark: "min-dark",
				},
				defaultColor: false,
			},
			components: {
				Head: "./src/components/DocsHead.astro",
				SidebarHeader: "./src/components/DocsSidebarHeader.astro",
				ContentHeader: "./src/components/DocsContentHeader.astro",
			},
			site: {
				title: "heypi",
				description: "Team chat agents with approvals, audit, and sandboxed tools.",
				url: "https://heypi.dev",
				favicon: "/favicon.svg",
				socialImage: "/social.png",
				author: {
					name: "Ronan Berder",
					x: "@hunvreus",
				},
			},
		}),
	],
});
