# Contributing to CivicConnect

## Development workflow

1. Copy the relevant `.env.example` files and keep local values untracked.
2. Install only the dependencies for the service you are changing.
3. Run the targeted checks listed in the service README and the root scripts.
4. Update documentation and configuration examples when behavior or paths
   change.

## Pull requests

- Keep changes focused and explain cross-service impact.
- Include validation commands and their results.
- Do not commit credentials, model training output, caches, or build artifacts.
- Update `docs/` when changing public APIs, deployment, or repository layout.
