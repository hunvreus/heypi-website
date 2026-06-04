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

Use those docs as the source of truth for what heypi is, how \`npm create heypi@latest\` scaffolds a project, how \`createHeypi()\` is shaped, how \`agentFrom()\` loads the Pi agent, and how state and runtime workspaces differ.

When possible, use the installed package exports and TypeScript types to confirm API details instead of guessing.

## Step 2: Discover requirements

Infer defaults from the user's goal. Ask only for missing information that materially changes the setup.

1. What should the agent do?
2. Which adapter should it use: [Slack](https://heypi.dev/docs/adapters/slack.md), [Discord](https://heypi.dev/docs/adapters/discord.md), [Telegram](https://heypi.dev/docs/adapters/telegram.md), or [webhook](https://heypi.dev/docs/adapters/webhook.md)?

Default to:

- Slack if the user does not specify an adapter;
- built-in just-bash unless the user needs Docker, Gondolin, or a custom [runtime provider](https://heypi.dev/docs/configuration/runtime.md);
- no memory, scoped skills, secret requests, generated-file attachments, or scheduling unless the goal needs them;
- approval for risky shell commands;
- \`openai/gpt-5.4-mini\` unless the user chooses another Pi model/provider.

Mention optional features only when relevant to the user's goal: [memory](https://heypi.dev/docs/configuration/memory.md), [skills](https://heypi.dev/docs/configuration/skills.md), [secrets](https://heypi.dev/docs/configuration/secrets.md), [attachments](https://heypi.dev/docs/configuration/attachments.md), [scheduling](https://heypi.dev/docs/configuration/scheduling.md), [tools](https://heypi.dev/docs/configuration/tools.md), and [approvals](https://heypi.dev/docs/configuration/approvals.md).

## Step 3: Build the starter

For a new project, prefer the official scaffolder:

\`\`\`bash
npm create heypi@latest my-agent
cd my-agent
\`\`\`

Use the interactive answers that fit the user's goal. Use \`-- --yes\` only when defaults are correct: Slack, just-bash, default model, admin UI, and no samples.

If the user is adding heypi to an existing project or explicitly wants manual setup, create one minimal app with:

- \`package.json\` dependencies, including \`@hunvreus/heypi\`. Add optional runtime packages only when used, such as \`@hunvreus/heypi-runtime-docker\` or \`@hunvreus/heypi-runtime-gondolin\`.
- \`index.ts\` with \`createHeypi()\`, one adapter, \`agentFrom()\`, and a named scoped runtime root.
- \`agent/AGENTS.md\`, \`agent/SOUL.md\`, \`agent/skills/\`, and \`tools/\` when the project does not already have them.
- \`.env\` and \`.env.example\` listing required environment variables without filling real secret values.
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
- exact file contents when creating the app from scratch;
- adapter, runtime, scope, and enabled features;
- required environment variables;
- validation result;
- install, check, and run commands.
`,
		{
			headers: {
				"content-type": "text/markdown; charset=utf-8",
			},
		},
	);
}
