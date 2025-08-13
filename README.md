# Risk Matrix on GitHub Pages

Interactive 5x5 risk matrix for Likelihood x Impact with import and export. Designed for static hosting. No server required.

## Quick start

1. Create a public repo. Name it anything you like.
2. Copy `index.html` to the repo root. Copy the files in the data section if you want samples.
3. Commit and push.
4. Turn on GitHub Pages.
   - Settings -> Pages -> Build and deployment -> Deploy from a branch.
   - Select `main` and root (`/`).
   - Save. Pages will publish at a URL shown on the same Settings page.

Open your GitHub Pages URL and you will see the matrix.

## Data format

The app accepts JSON and CSV.

### JSON

Structure:

```json
{
  "assets": [
    {
      "name": "Sudan conflict",
      "sector": "Security/Armed Conflict",
      "type": "Threat",
      "likelihood": 4,
      "impact": 5,
      "notes": "Escalated kinetic risk"
    }
  ]
}
```

Fields:
- `name` string. Required.
- `likelihood` integer 1 to 5. Required.
- `impact` integer 1 to 5. Required.
- `sector` string. Optional.
- `type` string. Optional. Use one of: Threat, Hazard, Opportunity, Dependency.
- `notes` string. Optional.
- `v` and `tier` are computed in the app. You do not need to provide them.

See `risk-register.schema.json` for validation.

### CSV

Headers: `name,sector,type,likelihood,impact,notes`

Example:

```csv
name,sector,type,likelihood,impact,notes
Cote d'Ivoire example,Geopolitical/Socioeconomic,Threat,2,4,Macro stability with localized pressures
Ghana example,Geopolitical/Socioeconomic,Threat,3,2,Currency pressure and spillover risk
Sahel regional,Security/Armed Conflict,Threat,3,4,Non-state actor activity
Sudan conflict,Security/Armed Conflict,Threat,4,5,Escalated kinetic risk
```

## Controls

- Upload JSON or CSV. Imports will replace the current list.
- Export JSON or CSV. The CSV includes computed `v` and `tier`.
- Download PNG for reports.
- Copy share URL. State is encoded in the querystring.
- Search, Sector, and Type filters.
- Toggle labels to show counts inside cells.
- Toggle the categorical only tag overlay.
- Switch grid between 5x5 and 3x3. Values are binned for 3x3.
- Change thresholds. Tiers are computed from `v = L x I` with Low <= `low`, Moderate <= `mod`, High <= `high`, and above that is Critical.
- Palette switch with a colorblind friendly option.

## Recommended workflow

1. Import your register from CSV or JSON.
2. Adjust thresholds to match your governance standard.
3. Use filters to build views per sector or threat type.
4. Click cells to review items and prune outliers.
5. Export CSV for an annex or attach the PNG to a SitRep.

## Privacy and security

- Data is stored in localStorage in the browser.
- The share link encodes your data in the URL. Share it only with trusted recipients.
- If you host the shared link publicly, the data will be visible to anyone with that URL.

## Troubleshooting

- Import fails: check that required fields are present. CSV headers must match the documented names.
- Chart looks empty: you may have filter selections active. Clear Sector and Type filters.
- Counts not visible: check the Show labels toggle.
- 3x3 mode: values 1-2 map to 1, 3 maps to 2, 4-5 map to 3.

## Data files in this folder

- `index.html` main app.
- `risk-register.schema.json` JSON Schema for validation.
- `sample-risk-register.json` example payload.
- `sample-risk-register.csv` example CSV.

## License

MIT. You can adapt this for your org or clients.


## New features
- Theme select with Auto, Dark, Light. Saved to localStorage.
- CARVER helper maps C A R V E Rz to Likelihood and Impact as simple averages per your rule.
- Helper can prefill the Add risk form or insert directly.


### Exports
- Export PDF uses jsPDF and includes the chart image and a table of the register.
- Export Excel uses SheetJS and includes a Risk Register sheet and a Matrix Summary sheet.

### CARVER 1-10 support
- In the CARVER helper select 1-10 to enter scores on a 1 to 10 scale. The tool normalizes to 1 to 5 for L and I.
- Mapping is linear: round(avg(scores)/scale*5), then clamp to 1 to 5.
