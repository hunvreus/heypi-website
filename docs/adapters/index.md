# Adapters

Adapters authenticate platform events, normalize them into `ChatMessage`, and render replies,
activity, approvals, todos, and attachments through native APIs.

| Adapter | Transport | Default trigger | Continuation |
| --- | --- | --- | --- |
| [Slack](/docs/adapters/slack/) | Socket Mode | DMs and app mentions | Native thread |
| [Discord](/docs/adapters/discord/) | Gateway | DMs, mentions, and replies | Reply chain |
| [Telegram](/docs/adapters/telegram/) | Long polling | Private chat, mentions, and replies | Reply chain or forum topic |
| [Webhook](/docs/adapters/webhook/) | HTTP | Every accepted request | Supplied session/thread IDs |
| [Local](/docs/adapters/local/) | In-process | Every received message | Supplied IDs |

Bot self-messages never trigger a turn. Other bots are denied unless enabled by `allow.bots`.

## Shared configuration

- `id`: stable storage and routing identity;
- `allow`: DM, channel, user, group, and bot filters;
- `admins`: actors with administrative and approval privileges;
- `approvers`: additional actors who may answer approvals;
- `approvals`: native layout and timeout;
- `busy`: queue, steer, or reject follow-ups during active work;
- `events`: replace or disable normalized lifecycle handlers.

See [Access control](/docs/configuration/access/), [Approvals](/docs/configuration/approvals/), and
[Conversation behavior](/docs/configuration/activity/) for shared semantics.

Use stable adapter IDs. Changing an ID creates a new storage, memory, workspace, and conversation
namespace.
