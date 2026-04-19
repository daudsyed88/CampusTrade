# OWASP ZAP Penetration Testing Guide

This guide explains how to run an OWASP ZAP automated scan against the CampusTrade application for grading purposes.

## Prerequisites
1. Ensure the CampusTrade application is running locally:
   - Backend on `http://localhost:5001`
   - Frontend on `http://localhost:5173`
2. Download and install [OWASP ZAP Desktop](https://www.zaproxy.org/download/).

## Running the Automated Scan
1. Open the OWASP ZAP desktop client.
2. In the "**Quick Start**" tab located in the central workspace, click on "**Automated Scan**".
3. In the "**URL to attack**" field, enter the frontend URL: `http://localhost:5173`
   *(Note: You can also point it at the backend `http://localhost:5001` if you want to test the API directly).*
4. Leave the default settings (Traditional Spider is sufficient for this scope).
5. Click the "**Attack**" button.
6. ZAP will begin spidering the site and subsequently launch the active scan. You can monitor the progress in the bottom tabs ("Spider" and "Active Scan").

## Analyzing the Results
1. Once the scan completes, switch to the "**Alerts**" tab in the bottom pane.
2. ZAP will categorize vulnerabilities into High (Red), Medium (Orange), Low (Yellow), and Informational (Blue).
3. The expected result for CampusTrade is **0 High Risk** and **0 Medium Risk** vulnerabilities.
4. Any Low or Informational alerts (such as missing CSP or minor strictness configurations) are considered acceptable residual risks within the scope of this project.

## Generating the Report
1. To generate a formal report, click "**Report**" -> "**Generate HTML Report...**" from the top menu bar.
2. Save the `.html` file. You can extract the metrics and copy them into the `OWASP_ZAP_Report.md` file provided in this repository.
