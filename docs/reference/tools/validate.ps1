Param(
  [string]$SchemasPath = "$(Split-Path $PSScriptRoot -Parent)\specs\schemas",
  [string]$ExamplesPath = "$(Split-Path $PSScriptRoot -Parent)\specs\examples"
)

Write-Host "Oursynth schema validation starting..." -ForegroundColor Cyan

function Has-Command($name) { Get-Command $name -ErrorAction SilentlyContinue | Out-Null; return $LASTEXITCODE -eq 0 -or $null -ne (Get-Command $name -ErrorAction SilentlyContinue) }

$Pairs = @(
  @{ schema = Join-Path $SchemasPath "covenant.schema.json"; example = (Join-Path (Split-Path $SchemasPath -Parent) "policies\covenant.policy.json") },
  @{ schema = Join-Path $SchemasPath "determinism-hints.schema.json"; example = Join-Path $ExamplesPath "determinism-hints.example.json" },
  @{ schema = Join-Path $SchemasPath "provenance-stamp.schema.json"; example = Join-Path $ExamplesPath "provenance-stamp.example.json" },
  @{ schema = Join-Path (Split-Path $SchemasPath -Parent) "schemas\review-packet.schema.json"; example = Join-Path $ExamplesPath "review-packet.example.json" },
  @{ schema = Join-Path (Split-Path $SchemasPath -Parent) "schemas\agent-result.schema.json"; example = Join-Path $ExamplesPath "agent-oath.example.json" }
)

$used = $false
if (Has-Command "npx") {
  Write-Host "Validating with npx ajv-cli (if present)..." -ForegroundColor Yellow
  foreach ($p in $Pairs) {
    Write-Host "→ $($p.example) against $($p.schema)" -ForegroundColor Gray
    npx -y ajv-cli validate -s "$($p.schema)" -d "$($p.example)"
    if ($LASTEXITCODE -ne 0) { Write-Error "Validation failed for $($p.example)"; exit 1 }
  }
  $used = $true
}
elseif (Has-Command "python") {
  Write-Host "Validating with Python jsonschema (if installed)..." -ForegroundColor Yellow
  $py = @"
import json, sys
from jsonschema import validate

pairs = [
  (r"""${($Pairs[0].schema)}""", r"""${($Pairs[0].example)}"""),
  (r"""${($Pairs[1].schema)}""", r"""${($Pairs[1].example)}"""),
  (r"""${($Pairs[2].schema)}""", r"""${($Pairs[2].example)}"""),
  (r"""${($Pairs[3].schema)}""", r"""${($Pairs[3].example)}"""),
  (r"""${($Pairs[4].schema)}""", r"""${($Pairs[4].example)}""")
]

for s, d in pairs:
    with open(s, 'r', encoding='utf-8') as sf: schema = json.load(sf)
    with open(d, 'r', encoding='utf-8') as df: data = json.load(df)
    validate(instance=data, schema=schema)
print("All validations passed")
"@
  python - <<PY
$py
PY
  if ($LASTEXITCODE -ne 0) { Write-Error "Validation failed"; exit 1 }
  $used = $true
}

if (-not $used) {
  Write-Warning "No validator found. Install one of:\n  - Node: npx ajv-cli validate -s <schema.json> -d <data.json>\n  - Python: pip install jsonschema"
}

Write-Host "Validation complete." -ForegroundColor Green
