# Configuration

Configuration lives in TypeScript. heypi does not split settings between a JSON manifest and an
entrypoint.

```ts
import { approval, docker, loadAgent, modelFromEnv, runHeypi, slack } from "@hunvreus/heypi";

const agent = loadAgent("./agent", {
	id: "support",
	model: modelFromEnv(),
	runtime: docker({ workspace: "./workspace", image: "node:22-bookworm" }),
	state: { dir: ".heypi" },
	admin: {},
	tools: {
		bash: { approve: approval.command() },
		write: false,
	},
});

await runHeypi(agent, [
	slack({
		id: "company-slack",
		token: process.env.SLACK_BOT_TOKEN!,
		appToken: process.env.SLACK_APP_TOKEN!,
		allow: { channels: ["C0123456789"] },
		busy: "queue",
	}),
]);
```

## Topics

- [Agent](/docs/configuration/agent/): model, state, feature toggles, and agent resources.
- [Runtimes](/docs/configuration/runtimes/): host, Docker, Gondolin, just-bash, Vercel, and Cloudflare execution.
- [Tools](/docs/configuration/tools/): built-in tools, authored tools, and tool overrides.
- [Approvals](/docs/configuration/approvals/): policies, approvers, layouts, and failure behavior.
- [Access](/docs/configuration/access/): DM, channel, user, group, and bot allowlists.
- [Conversation behavior](/docs/configuration/activity/): status, typing, reactions, queueing, steering, and events.
- [Memory](/docs/configuration/memory/), [attachments](/docs/configuration/attachments/), and [secrets](/docs/configuration/secrets/).
- [Scheduling](/docs/configuration/scheduling/) and [admin and audit](/docs/configuration/admin/).

Adapter credentials and platform-specific behavior live under [Adapters](/docs/adapters/).
