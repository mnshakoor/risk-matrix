# Convert CARVER List to Risk Register JSON Prompt for ChatGPT or any other LLM of choice

## Task

Convert a plain text list or table of risks that includes CARVER scores into valid JSON using the schema below. Do not add any explanations before or after the JSON.

## Input

Paste the source list or table here:

```text
<<PASTE YOUR LIST OR TABLE HERE>>
```

Typical CARVER fields per item: `C`, `A`, `R` (Recuperability), `V`, `E`, `Rz`. Items may also include `name`, `sector`, `type`, `notes`.

## Parameters

- `SCALE = {{SCALE}}`  allowed values: `5`, `10`, or `auto`
  - If `SCALE = auto`, detect per item: if any CARVER value > 5 use 10, else 5.

## Output format

Return exactly this JSON and nothing else:

```json
{
  "assets": [
    {
      "name": "string",
      "sector": "string",
      "type": "string",
      "likelihood": 1,
      "impact": 1,
      "notes": "string optional"
    }
  ]
}
```

## Mapping and rules

1. **Field extraction**

   - `name`: short title of the risk from the item
   - `sector`: carry through if present, else empty string
   - `type`: carry through if present, else `"Risk"`
   - `notes`: carry through any narrative text that is not CARVER fields

2. **CARVER to L and I on a 1 to 5 scale**

   Let `S` be the CARVER scale for the item (5 or 10).

   Interim means on scale `S`:

   ```
   L_S = round((A + V + Rz) / 3)
   I_S = round((C + E + R) / 3)
   ```

   Normalize each to 1 to 5:

   ```
   L = clamp_1..5(round(L_S * 5 / S))
   I = clamp_1..5(round(I_S * 5 / S))
   ```

3. **Validation**

   - Require all of `A`, `V`, `Rz` for `L` and all of `C`, `E`, `R` for `I`. If any are missing, skip that item.
   - `likelihood` and `impact` must be integers in 1 to 5.
   - Preserve the original item order in the output list.

4. **Output constraints**

   - Return only valid JSON as defined in **Output format**.
   - Omit any keys that would be empty except the required ones above.
   - Do not include commentary or markdown outside the JSON block.

## Begin

Parse the input robustly. Build the `assets` array following **Mapping and rules**. Return the JSON only.

## End

