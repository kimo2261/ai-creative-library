# AI Creative Library V5 Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Review, verify, and publish AI Creative Library V5 to the existing GitHub repository and confirm the GitHub Pages deployment.

**Architecture:** Preserve the supplied dependency-free static site: `data.js` owns catalog data, `app.js` owns browser behavior, and `index.html` owns markup and presentation. Add only focused fixes and repository-level validation needed for a reliable GitHub Pages release.

**Tech Stack:** HTML5, CSS, browser JavaScript, Node.js validation scripts, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-10-23-v5-deployment-design.md`

## Global Constraints

- Preserve the static architecture and current product decisions.
- Keep exactly 111 commands across exactly 11 categories.
- Preserve Arabic RTL behavior and responsive desktop/mobile layouts.
- Do not add secrets, APIs, a backend, or a database.
- Do not claim the site is live before verifying the public URL.

## Review Focus

- Corrupted or unexpected `localStorage` favorites must not break startup.
- Search must cover Arabic names, English command codes, and category names.
- Category and favorites filtering must produce consistent counts and empty states.
- Copy behavior must provide a usable fallback when Clipboard API access is unavailable.
- Pages must load scripts correctly from the repository subpath and return the reviewed 111-command application.

---

### Task 1: Import and baseline the supplied V5 project

**Files:**
- Create: `index.html`
- Create: `data.js`
- Create: `app.js`
- Create: `README.md`

**Interfaces:**
- Consumes: `ai-creative-library-v5.zip` supplied in the prior conversation
- Produces: a dependency-free static site at the repository root

- [ ] **Step 1: Extract the four supplied project files without changing their architecture**
- [ ] **Step 2: Confirm `commands.length === 111` and `Object.keys(catalog).length === 11`**
- [ ] **Step 3: Confirm the repository remote and default branch state**

### Task 2: Add automated regression validation and focused fixes

**Files:**
- Modify: `index.html`
- Modify: `data.js`
- Modify: `app.js`
- Create: `tests/site.test.js`
- Create: `package.json`

**Interfaces:**
- Consumes: globals `catalog` and `commands`, DOM IDs defined in `index.html`
- Produces: `npm test` validation for catalog integrity, static asset wiring, search/filter behavior, favorites recovery, prompt output, copy fallback, and export behavior

- [ ] **Step 1: Write regression tests for the catalog counts and critical browser flows**
- [ ] **Step 2: Run the tests and record concrete failures**
- [ ] **Step 3: Apply the smallest fixes required by the failures and code review**
- [ ] **Step 4: Run tests until all pass**

### Task 3: Perform browser and responsive verification

**Files:**
- Modify when required: `index.html`, `app.js`

**Interfaces:**
- Consumes: the static site served from a local HTTP server
- Produces: verified desktop and mobile behavior with no console errors

- [ ] **Step 1: Serve the site locally over HTTP**
- [ ] **Step 2: Verify search, categories, favorites persistence, studio updates, copy, and export in a browser**
- [ ] **Step 3: Verify desktop and mobile viewport layouts**
- [ ] **Step 4: Re-run automated tests after any browser-driven fixes**

### Task 4: Publish and verify GitHub Pages

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: reviewed files and GitHub repository permissions
- Produces: `main` branch content and a verified public Pages URL, or an explicit permissions blocker

- [ ] **Step 1: Commit the reviewed project with a focused release message**
- [ ] **Step 2: Push the commit to `origin/main`**
- [ ] **Step 3: Configure Pages to deploy from `main` and `/(root)` when permissions allow**
- [ ] **Step 4: Wait for the Pages deployment to complete**
- [ ] **Step 5: Open the public URL and verify the application content and assets**
- [ ] **Step 6: Report the verified URL, commit, test evidence, and any remaining permission limitation**
