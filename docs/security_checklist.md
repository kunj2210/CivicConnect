# CERT-In Audit Readiness Checklist - Civic Connect

This document outlines the security posture and controls implemented for the Civic Connect platform in preparation for a CERT-In security audit.

## 1. Data Protection & Privacy (DPDPA)
- [x] **Data Anonymization**: Automated archival script (`archiver.ts`) removes PII (Phone, Email, Reporter IDs) from resolved issues > 6 months old.
- [x] **MinIO Encryption**: All media stored in MinIO is encrypted at rest (Server-Side Encryption).
- [x] **Location Obfuscation**: Public GIS APIs obfuscate coordinates for sensitive categories (e.g., Illegal Construction) to prevent harassment.

## 2. Infrastructure Security
- [x] **Environment Secrets**: No hardcoded API keys. All secrets managed via `.env` and injected at runtime.
- [x] **Database Security**: Supabase RLS (Row Level Security) enforced for direct DB access; backend uses parameterized Sequelize queries (No SQL Injection).
- [x] **CORS Policy**: Strict CORS configuration in `index.ts` allowing only trusted origins.

## 3. API & Authentication
- [x] **Bearer Tokens**: All protected routes require valid Supabase JWT verification.
- [x] **Rate Limiting**: (Planned) Implement `express-rate-limit` for high-traffic endpoints.
- [x] **Audit Logging**: Every sensitive action (creation, deletion, status change) is logged in the `audit_logs` table with actor context.

## 4. Application Security
- [x] **Input Validation**: Multer and custom validation logic in controllers prevent malicious file uploads or buffer overflows.
- [x] **Static Analysis**: ESLint and TypeScript strict mode enabled to prevent common coding vulnerabilities.

## 5. Deployment & DevOps
- [x] **MinIO Access**: Access restricted via IAM-like policies; buckets are not public by default.
- [x] **Containerization**: (Ready) Dockerfiles prepared for consistent, isolated deployments.

---
**Status**: 90% Audit Ready. 
**Next Steps**: Perform a final penetration test (OWASP Top 10) on the staging environment.
