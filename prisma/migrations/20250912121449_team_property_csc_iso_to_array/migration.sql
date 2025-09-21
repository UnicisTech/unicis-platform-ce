-- Turn "csc_iso" team property from string to array of string
-- Leave arrays as-is; coerce weird types to []; skip rows with no key.

UPDATE "Team"
SET "properties" =
  CASE
    WHEN ("properties"->'csc_iso') IS NULL THEN "properties"  -- no key: leave as is
    WHEN jsonb_typeof("properties"->'csc_iso') = 'string'
      THEN jsonb_set("properties"::jsonb, '{csc_iso}', jsonb_build_array("properties"->>'csc_iso'), true)
    WHEN jsonb_typeof("properties"->'csc_iso') = 'array'
      THEN "properties"  -- already good
    ELSE
      jsonb_set("properties"::jsonb, '{csc_iso}', '[]'::jsonb, true)  -- normalize other types/null
  END
WHERE ("properties"->'csc_iso') IS NOT NULL;
