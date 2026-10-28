# CivicConnect Configuration Reference

Use the committed `.env.example` files as the source of variable names. Never
commit real values.

## Backend

| Variable group | Examples | Purpose |
|---|---|---|
| Runtime | `PORT`, `BASE_URL` | Listener and public callback/base URL |
| Database | `PG_CONNECTION_STRING` | PostgreSQL/Supabase connection |
| Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE` | Auth and project integration |
| Object storage | `AWS_ENDPOINT`, `AWS_PORT`, `AWS_USE_SSL`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `AWS_BUCKET` | S3-compatible media storage |
| Priority | `PRIORITY_WEIGHT_*` | Explainable report priority weighting |
| Language model | `OPEN_SOURCE_LLM_KEY`, `OPEN_SOURCE_LLM_URL`, `LLM_MODEL` | Optional textual analysis integration |
| Classifier | `USE_HF_CLASSIFIER`, `HF_SPACE_ID`, `HF_TOKEN` | Optional hosted image classifier |

## Client configuration

- Dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
- Mobile: `API_BASE_URL`, `LOCAL_API_BASE_URL`, `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`

Only public client values may use a `VITE_` or mobile compile-time prefix.

## Batch processor

The scheduled processor uses GitHub Actions secrets including
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, storage credentials, `HF_TOKEN`, and
the language-model key. Configure these in the repository/organization secret
store, not in workflow YAML.

## Configuration change procedure

1. Add the variable to the relevant `.env.example`.
2. Validate it at startup with a clear error for required values.
3. Update this document and the service README.
4. Add a safe test/default for local or CI execution.
5. Rotate values if a secret was exposed during the change.
