# AFU Automated Tests

## Setup
```bash
npx playwright install
```

## Run all tests
```bash
npm test
```

## Run against production
```bash
BASE_URL=https://www.africanfarmingunion.org npm test
```

## Run against local dev
```bash
npm run dev  # in another terminal
BASE_URL=http://localhost:3000 npm test
```

## What's tested
- All public pages load without errors
- No circle of death (stuck spinners)
- Auth flows work
- Navbar/footer render
- Forms have required fields
- Admin routes are protected
- SEO metadata exists
