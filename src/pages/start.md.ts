import { getPages } from "@/lib/docs";

export function GET() {
	const pages = getPages();

	const links = pages
		.filter((page) => page.slug)
		.map((page) => `- [${page.title}](https://heypi.dev/docs/${page.slug}.md)`)
		.join("\n");

	return new Response(
		`# Skill: Create a First heypi Agent

You are helping the user create their first heypi agent. Build the smallest useful TypeScript app for their goal, then validate it.

## Step 1: Gather context

First, read:

- [heypi introduction](https://heypi.dev/docs.md)
- [heypi quickstart](https://heypi.dev/docs/quickstart.md)

Use those docs as the source of truth for what heypi is, how \`createHeypi()\` is shaped, how \`agentFrom()\` loads the Pi agent, and how state and runtime workspaces differ.

## Step 2: Discover requirements

Determine these choices from the conversation. Ask only for missing information that materially changes the setup.

1. What should the agent do?
2. Which adapter should it use: Slack, Discord, Telegram, or webhook?
3. Which runtime should it use: built-in just-bash, Docker, Gondolin, or a custom provider?
4. Should memory, scoped skills, secret requests, generated-file attachments, or scheduling be enabled?
5. Which actions should require approval?
6. Which model/provider should Pi use?

## Step 3: Build the starter

Create one minimal app with:

- \`package.json\` dependencies.
- \`index.ts\` with \`createHeypi()\`, one adapter, \`agentFrom()\`, and a scoped runtime root.
- An \`agent/AGENTS.md\` prompt.
- A \`.env.example\` listing required environment variables.
- Memory, skills, secrets, scheduling, or custom tools only when the user's goal needs them.

Prefer the simplest runtime that satisfies the goal. Do not add Docker, Gondolin, or webhook GitHub automation unless the user asked for that capability.

## Step 4: Validate

Run the most relevant checks available in the project:

- install dependencies if needed;
- typecheck or build;
- run \`npx @hunvreus/heypi check\` when the app config is present;
- explain any validation that could not be run because credentials are missing.

## Reference docs

${links}

## Output

Finish with:

- files created or changed;
- adapter, runtime, scope, and enabled features;
- required environment variables;
- validation result;
- exact next command to run the agent.
`,
		{
			headers: {
				"content-type": "text/markdown; charset=utf-8",
			},
		},
	);
}
