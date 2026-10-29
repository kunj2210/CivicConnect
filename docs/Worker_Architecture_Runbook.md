# CivicConnect Worker and Batch Runbook

## Work types

CivicConnect has two scheduled patterns:

- Backend cron processes for spatial deduplication and archival.
- The nightly GitHub Actions batch processor for pending AI work.

The `ProcessingJob` model is the durable reference for asynchronous report
processing. A job should have an identifiable status, timestamps, failure
information, and enough context to retry or investigate it.

## Safe processing rules

- Claim work atomically before processing.
- Make retries bounded and observable.
- Do not duplicate notifications or repairs on a retry.
- Store provider failures and job IDs without storing secrets.
- Validate downloaded media before sending it to a model.
- Mark uncertain AI output for review rather than silently promoting it.

## Nightly processor operation

1. Confirm required GitHub secrets are configured.
2. Trigger the workflow manually for a controlled test.
3. Check processed, skipped, failed, and retried counts.
4. Inspect failed job identifiers and provider responses.
5. Re-run only after confirming the failure is transient or corrected.

## Incident actions

If processing is unsafe or repeatedly failing, disable the schedule, preserve
the workflow logs, identify affected `ProcessingJob` records, and prevent
duplicate side effects before retrying. Credential failures require secret
rotation and a manual verification run.
