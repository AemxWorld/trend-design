# Trend Design - publish to GitHub Pages
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
$branch = (& $git branch --show-current).Trim()
if (-not $branch) { $branch = "master" }

$user = & $gh api user --jq .login
$repoExists = $false

& $gh repo view "${user}/${repoName}" 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { $repoExists = $true }

$remotes = @(& $git remote 2>$null)
$hasOrigin = $remotes -contains "origin"

if ($hasOrigin -and -not $repoExists) {
  Write-Host "Removing broken origin remote..." -ForegroundColor Yellow
  & $git remote remove origin
  $hasOrigin = $false
}

if (-not $repoExists) {
  Write-Host "Creating GitHub repo ${user}/${repoName}..." -ForegroundColor Cyan
  if (-not $hasOrigin) {
    & $gh repo create $repoName --public --description "Trend Design client preview site"
    & $git remote add origin "https://github.com/${user}/${repoName}.git"
  }
} else {
  Write-Host "Repo already exists on GitHub." -ForegroundColor Cyan
  if (-not $hasOrigin) {
    & $git remote add origin "https://github.com/${user}/${repoName}.git"
  }
}

Write-Host "Pushing branch $branch..." -ForegroundColor Cyan
& $git push -u origin $branch
if ($LASTEXITCODE -ne 0) {
  Write-Host "Push failed. Check errors above." -ForegroundColor Red
  exit 1
}

Write-Host "Enabling GitHub Pages (branch deploy)..." -ForegroundColor Cyan
$pagesResult = & $gh api -X PUT "/repos/${user}/${repoName}/pages" `
  -f "build_type=legacy" `
  -f "source[branch]=$branch" `
  -f "source[path]=/" 2>&1

if ($LASTEXITCODE -ne 0 -and $pagesResult -notmatch "already") {
  Write-Host $pagesResult -ForegroundColor Yellow
}

Start-Sleep -Seconds 2
$pagesUrl = & $gh api "/repos/${user}/${repoName}/pages" --jq .html_url 2>$null

Write-Host ""
Write-Host "Deploy complete!" -ForegroundColor Green
if ($pagesUrl) {
  Write-Host "Live site:" -ForegroundColor Green
  Write-Host $pagesUrl
  Write-Host "(May take 1-2 minutes to go live after first publish.)" -ForegroundColor DarkGray
} else {
  Write-Host "Check Pages settings:" -ForegroundColor Green
  Write-Host "https://github.com/${user}/${repoName}/settings/pages"
}

Write-Host ""
Write-Host "Repository:" -ForegroundColor Green
Write-Host "https://github.com/${user}/${repoName}"
