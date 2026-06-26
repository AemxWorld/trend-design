# Trend Design — publish to GitHub Pages
# Run once: gh auth login
# Then run: .\deploy.ps1

$ErrorActionPreference = "Stop"
$git = "C:\Program Files\Git\cmd\git.exe"
$gh = "C:\Program Files\GitHub CLI\gh.exe"

Set-Location $PSScriptRoot

& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Log in to GitHub first:" -ForegroundColor Yellow
  & $gh auth login -h github.com -p https -w
}

$repoName = "trend-design"
$remote = & $git remote get-url origin 2>$null

if (-not $remote) {
  Write-Host "Creating GitHub repo and pushing..." -ForegroundColor Cyan
  & $gh repo create $repoName --public --source=. --remote=origin --push
} else {
  Write-Host "Pushing to origin..." -ForegroundColor Cyan
  & $git push -u origin main
}

Write-Host "Enabling GitHub Pages..." -ForegroundColor Cyan
& $gh api -X POST "/repos/{owner}/$repoName/pages" -f "build_type=workflow" 2>$null

$pagesUrl = & $gh api "/repos/{owner}/$repoName/pages" --jq .html_url 2>$null
if ($pagesUrl) {
  Write-Host ""
  Write-Host "Live site (may take 1-2 min after first deploy):" -ForegroundColor Green
  Write-Host $pagesUrl
} else {
  $user = & $gh api user --jq .login
  Write-Host ""
  Write-Host "Repo pushed. Enable Pages in GitHub:" -ForegroundColor Green
  Write-Host "https://github.com/$user/$repoName/settings/pages"
  Write-Host "Source: GitHub Actions"
}
