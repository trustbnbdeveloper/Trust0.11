param(
  [Parameter(Mandatory=$false)] [string] $SupabaseUrl,
  [Parameter(Mandatory=$false)] [string] $SupabaseServiceRoleKey,
  [Parameter(Mandatory=$false)] [string] $SupabaseDbUrl,
  [Parameter(Mandatory=$false)] [string] $CfApiToken,
  [Parameter(Mandatory=$false)] [string] $CfAccountId,
  [Parameter(Mandatory=$false)] [string] $SeedOnPush = 'false'
)

Write-Host "Checking for GitHub CLI..."
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI 'gh' is not installed or not on PATH. Install: https://cli.github.com/"
  exit 1
}

# Ensure we are in a git repo and get origin remote
$remote = git remote get-url origin 2>$null
if (-not $remote) {
  Write-Error "Not a git repo or origin remote not found. Run this script from your repo folder and ensure 'origin' remote exists."
  exit 1
}

# Helper to set secret if provided
function Set-SecretIfProvided($name, $value) {
  if (-not [string]::IsNullOrEmpty($value)) {
    gh secret set $name --body $value
    if ($LASTEXITCODE -ne 0) { Write-Error "Failed to set $name"; exit 2 }
    Write-Host "Set secret $name"
  } else {
    Write-Host "Skipping $name (not provided)"
  }
}

Set-SecretIfProvided -name 'SUPABASE_URL' -value $SupabaseUrl
Set-SecretIfProvided -name 'SUPABASE_SERVICE_ROLE_KEY' -value $SupabaseServiceRoleKey
Set-SecretIfProvided -name 'SUPABASE_DB_URL' -value $SupabaseDbUrl
Set-SecretIfProvided -name 'CF_API_TOKEN' -value $CfApiToken
Set-SecretIfProvided -name 'CF_ACCOUNT_ID' -value $CfAccountId
Set-SecretIfProvided -name 'SEED_ON_PUSH' -value $SeedOnPush

Write-Host 'All done. You can now run the GitHub workflow manually or push to main if SEED_ON_PUSH=true.'
