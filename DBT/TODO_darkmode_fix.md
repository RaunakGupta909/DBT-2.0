# Fix Dark Mode on DEO and BEO Dashboards

## Overview
Dark mode is not working on DEO and BEO dashboards due to inconsistencies in class names and missing scripts.

## Issues Identified
- script.js uses 'dark' class, but dashboards expect 'dark-mode'.
- BEO dashboard CSS uses 'body.dark', but script adds 'dark-mode'.
- DEO dashboard has dark-mode CSS but no script to apply it on load.
- BEO has a local toggle button, but dark mode is controlled centrally from index.html.

## Plan
- [x] Update script.js to use 'dark-mode' class instead of 'dark'.
- [x] Update BEO dashboard CSS to use 'body.dark-mode' instead of 'body.dark'.
- [x] Add localStorage check script to DEO dashboard to apply dark-mode on load.
- [x] Remove dark toggle button from BEO dashboard.
- [x] Test dark mode functionality on both dashboards.

## Files to Edit
- DBT_BACKEND/frontend/script.js
- DBT_BACKEND/frontend/beo_dashboard.html
- DBT_BACKEND/frontend/deo_dashboard.html
