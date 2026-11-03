# Contributing

This repository is built one feature at a time through pull requests.
Nobody pushes features straight to `main`.

## Branch naming

Create every branch from an up-to-date `main` and name it `<type>/<short-description>`
in lowercase kebab-case:

| Prefix      | Use for                                   | Example                    |
| ----------- | ----------------------------------------- | -------------------------- |
| `feature/`  | New functionality                         | `feature/unit-toggle`      |
| `fix/`      | Bug fixes                                 | `fix/proxy-ipv4`           |
| `docs/`     | Documentation only                        | `docs/readme-setup`        |
| `chore/`    | Tooling, config, dependencies, repo setup | `chore/eslint-config`      |

Keep each branch to one feature so its pull request is small and easy to review.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): summary in the imperative mood

Optional body explaining what changed and why.
```

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **scope**: the area touched, e.g. `backend`, `frontend`, `repo`
- **summary**: imperative ("add", not "added"), no trailing period, at most 72 characters

Examples:

```
feat(backend): add GET /api/route endpoint
fix(frontend): show server-down message when Flask is not running
docs(readme): add setup instructions
```

Never commit `.env`, `node_modules/`, `venv/` or build output. Stage files by
path instead of using `git add .`.

## Pull request process

1. **Sync `main` before branching:**
   ```
   git switch main
   git pull origin main
   git switch -c feature/<name>
   ```
2. Commit in small, logical chunks on your branch.
3. Before pushing, bring in any new commits from `main` and fix conflicts locally:
   ```
   git pull origin main
   ```
4. Push the branch and open a pull request into `main` using the PR template.
   Fill in What, Why and How to test.
5. **One approval is required, from the other account.** The author does not
   approve or merge their own pull request.
6. The reviewer checks out the branch, follows "How to test", and either
   approves or requests changes with comments.
7. After approval, the reviewer merges the pull request and deletes the branch.
8. Everyone syncs `main` again before starting the next branch.
