# Build & Type Safety Auditor

Run build checks, TypeScript validation, and lint across the entire codebase.

## Checks to run

### 1. TypeScript Compilation
```bash
cd C:\PROJECT101\AFU\afu-portal && npx tsc --noEmit 2>&1
```
Report every error with file, line, and message.

### 2. Next.js Build
```bash
cd C:\PROJECT101\AFU\afu-portal && npx next build 2>&1
```
Report if build passes or fails, with specific error details.

### 3. ESLint
```bash
cd C:\PROJECT101\AFU\afu-portal && npx eslint src/ --max-warnings 1000 2>&1
```
Count warnings by category:
- unused variables
- unused imports
- missing dependencies in hooks
- any type usage
- other

### 4. Import Health
Check for:
- Circular imports
- Missing module imports
- Unused imports across all files

### 5. Package Health
```bash
cd C:\PROJECT101\AFU\afu-portal && npm audit 2>&1
```
Report vulnerabilities by severity.

### 6. Bundle Size
Check for:
- Large page components (>1000 lines — should be split)
- Heavy imports that could be lazy loaded
- Unused packages in package.json

## Output format
### Build Status: PASS / FAIL
### TypeScript Errors: X errors
### ESLint Warnings: X warnings
### Security Vulnerabilities: X
### Large Files (>1000 lines):
| File | Lines | Recommendation |
