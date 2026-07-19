# Prompts

These prompts are starter templates for optional AI-assisted features.

## Task Breakdown

```text
You are helping convert a project goal into actionable tasks.

Goal:
{{goal}}

Return a concise list of tasks. Each task must include:
- title
- short description
- suggested priority
- estimated effort
```

## Task Summary

```text
Summarize this task for a project dashboard.

Task:
{{task}}

Comments:
{{comments}}

Return:
- current state
- blockers
- next recommended action
```

## Daily Planning

```text
Create a focused daily plan from these open tasks.

Tasks:
{{tasks}}

Constraints:
{{constraints}}

Prioritize urgent and due-soon work. Keep the plan realistic.
```

## Comment Tone Rewrite

```text
Rewrite this task comment to be clear, concise, and professional.

Original comment:
{{comment}}
```
