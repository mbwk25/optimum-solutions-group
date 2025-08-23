# Fix import paths in UI components
Get-ChildItem -Path "src/shared/ui" -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '@/lib/utils', '@/shared/utils/utils'
    Set-Content -Path $_.FullName -Value $content -NoNewline
    Write-Host "Fixed: $($_.Name)"
}

# Fix features that might import from old paths
Get-ChildItem -Path "src/features" -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $changed = $false
    if ($content -match '@/components/ui/') {
        $content = $content -replace '@/components/ui/', '@/shared/ui/'
        $changed = $true
    }
    if ($content -match '@/components/LazyImage') {
        $content = $content -replace '@/components/LazyImage', '@/shared/components/LazyImage'
        $changed = $true
    }
    if ($content -match '@/components/') {
        $content = $content -replace '@/components/', '@/shared/components/'
        $changed = $true
    }
    if ($content -match '@/utils/') {
        $content = $content -replace '@/utils/', '@/shared/utils/'
        $changed = $true
    }
    if ($content -match '@/hooks/') {
        $content = $content -replace '@/hooks/', '@/shared/hooks/'
        $changed = $true
    }
    if ($changed) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Fixed feature: $($_.Name)"
    }
}

# Fix shared components that might import from old paths
Get-ChildItem -Path "src/shared/components" -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $changed = $false
    if ($content -match '@/components/ui/') {
        $content = $content -replace '@/components/ui/', '@/shared/ui/'
        $changed = $true
    }
    if ($content -match '@/components/LazyImage') {
        $content = $content -replace '@/components/LazyImage', '@/shared/components/LazyImage'
        $changed = $true
    }
    if ($content -match '@/components/') {
        $content = $content -replace '@/components/', '@/shared/components/'
        $changed = $true
    }
    if ($content -match '@/utils/') {
        $content = $content -replace '@/utils/', '@/shared/utils/'
        $changed = $true
    }
    if ($content -match '@/hooks/') {
        $content = $content -replace '@/hooks/', '@/shared/hooks/'
        $changed = $true
    }
    if ($content -match '@/lib/') {
        $content = $content -replace '@/lib/', '@/shared/utils/'
        $changed = $true
    }
    if ($changed) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Fixed shared component: $($_.Name)"
    }
}

Write-Host "Import path fixes completed!"
