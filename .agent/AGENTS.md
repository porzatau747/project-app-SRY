# Superpowers for Antigravity

You have superpowers.

This profile adapts Superpowers workflows for Antigravity with strict single-flow execution.

## Core Rules

1. Prefer local skills in `.agent/skills/<skill-name>/SKILL.md`.
2. Execute one core task at a time with `task_boundary`.
3. Use `browser_subagent` only for browser automation tasks.
4. Track checklist progress in `<project-root>/docs/plans/task.md` (table-only live tracker).
5. Keep changes scoped to the requested task and verify before completion claims.

## Tool Translation Contract

When source skills reference legacy tool names, use these Antigravity equivalents:

- Legacy assistant/platform names -> `Antigravity`
- `Task` tool -> `browser_subagent` for browser tasks, otherwise sequential `task_boundary`
- `Skill` tool -> `view_file ~/.gemini/skills/<skill-name>/SKILL.md` (or project-local `.agent/skills/<skill-name>/SKILL.md`)
- `TodoWrite` -> update `<project-root>/docs/plans/task.md` task list
- File operations -> `view_file`, `write_to_file`, `replace_file_content`, `multi_replace_file_content`
- Directory listing -> `list_dir`
- Code structure -> `view_file_outline`, `view_code_item`
- Search -> `grep_search`, `find_by_name`
- Shell -> `run_command`
- Web fetch -> `read_url_content`
- Web search -> `search_web`
- Image generation -> `generate_image`
- User communication during tasks -> `notify_user`
- MCP tools -> `mcp_*` tool family

## Skill Loading

- First preference: project skills at `.agent/skills`.
- Second preference: user skills at `~/.gemini/skills`.
- If both exist, project-local skills win for this profile.
- Optional parity assets may exist at `.agent/workflows/*` and `.agent/agents/*` as entrypoint shims/reference profiles.
- These assets do not change the strict single-flow execution requirements in this file.

## Parallel Execution Model

- Allow Parallel Execution for Sub-agents when requested by the user. Ensure proper folder isolation to prevent code conflicts.
- Decompose large work into ordered, explicit steps per agent.
- Keep one active task per agent in `<project-root>/docs/plans/task.md`.
- If browser work is required, isolate it in a dedicated browser step.

## Verification Discipline

Before saying a task is done:

1. Run the relevant verification command(s).
2. Confirm exit status and key output.
3. Update `<project-root>/docs/plans/task.md`.
4. Report evidence, then claim completion.

## Agent Core Behavior (Karpathy Guidelines)

To reduce LLM coding mistakes, bias toward caution and avoid overcomplication. 

1. **Think Before Coding:**
   - State assumptions explicitly. If uncertain, ask.
   - Present multiple interpretations; don't pick silently.
   - Propose simpler approaches and push back when warranted.

2. **Simplicity First:**
   - Minimum code that solves the problem. No speculative features.
   - No abstractions for single-use code or unrequested "flexibility".
   - If 200 lines can be written as 50, rewrite it.

3. **Surgical Changes:**
   - Touch only what you must. Don't refactor or "improve" unrelated code or formatting.
   - Clean up only your own mess (remove unused imports/variables created by your changes).
   - Every changed line must trace directly to the user's request.

4. **Goal-Driven Execution:**
   - Define verifiable success criteria (e.g., write a failing test, make it pass).
   - For multi-step tasks, explicitly output a brief plan with steps and verification checks.
