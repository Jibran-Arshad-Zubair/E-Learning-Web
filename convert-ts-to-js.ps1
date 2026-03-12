# PowerShell script to remove TypeScript syntax from all .js and .jsx files

$filePattern = @("*.jsx", "*.js")
$files = Get-ChildItem -Recurse -Include $filePattern | Where-Object { 
    $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "\.next" -and $_.FullName -notmatch "pnpm-lock"
}

$patterns = @(
    # Remove type imports: "import { foo, type Bar }" -> "import { foo }"
    @{ Pattern = 'import\s+{([^}]*)type\s+([^,}]+)([^}]*)}\s+from'; Replacement = 'import { $1$3} from' },
    
    # Remove full type imports: "import type { ... } from" -> remove entirely
    # This needs special handling
    
    # Remove type parameter from useState: "React.useState<Type>" -> "React.useState"
    @{ Pattern = 'React\.useState<[^>]+>'; Replacement = 'React.useState' },
    
    # Remove type parameter from useState with variable: "const [x, setX] = React.useState<Type>" -> "const [x, setX] = React.useState"
    @{ Pattern = '\(useState|useEffect|useCallback|useContext)<[^>]+>'; Replacement = '$1' },
    
    # Remove type annotations from function parameters: "param: Type" -> "param"
    @{ Pattern = ':\s*React\.ComponentProps<[^>]+>'; Replacement = '' },
    @{ Pattern = '&\s*(VariantProps<[^>]+>|{[^}]+})\s*(?=\))'; Replacement = '' },
    
    # Remove optional type markers: "param?: string" -> "param"
    @{ Pattern = '(\w+)\s*\?\s*:\s*string(?=\s*[,\)]|,|$)'; Replacement = '$1' },
    
    # Remove "as const"
    @{ Pattern = '\s+as\s+const\s*$'; Replacement = ''; Options = 'Multiline' },
    
    # Remove type declarations: "type Name = ..." - needs line-based handling
    # Remove interface declarations: "interface Name { ... }" - needs block handling
)

Write-Host "Processing $($files.Count) files..."
$count = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    $originalContent = $content
    
    if ($null -eq $content) { continue }
    
    # Remove "import type { ... } from ..." lines
    $content = $content -replace '^\s*import\s+type\s+{[^}]*}\s+from\s+[''"][^''"]+'';?\s*$', '', 'Multiline'
    
    # Remove "type ... =" declarations (single line)
    $content = $content -replace '^type\s+\w+(\s*=.*)?$', '', 'Multiline'
    
    # Remove "interface ... { ... }" blocks - simple case
    $content = $content -replace '^\s*interface\s+\w+\s*{[^}]*}$', '', 'Multiline'
    
    # Remove "as const" at end of lines
    $content = $content -replace '\s+as\s+const\s*$', '', 'Multiline'
    
    # Remove type import portions: "import { x, type Y }" -> "import { x }"
    $content = $content -replace ',?\s*type\s+\w+', '', 'Global'
    $content = $content -replace 'import\s+{\s*}\s+from', '', 'Global'
    
    # Remove React.ComponentProps<...> type annotations
    $content = $content -replace ':\s*React\.ComponentProps<[^>]+(?:>[^)]*)?>', '', 'Global'
    
    # Remove VariantProps<...> from parameter types
    $content = $content -replace '&\s*VariantProps<[^>]+>', '', 'Global'
    
    # Remove generic type parameters: <Type> or <Type | undefined>
    $content = $content -replace 'useState<[^>]+>', 'useState', 'Global'
    $content = $content -replace 'Map<[^>]+>', 'Map', 'Global'
    $content = $content -replace 'Array<([^>]+)>', 'Array', 'Global'
    
    # Remove type annotations from parameters: "param: string" -> "param"
    $content = $content -replace '(\w+)\s*:\s*(?:string|boolean|number|any|void|React\.ReactNode|Partial<[^>]+>|ReturnType<[^>]+>|typeof\s+\w+)(?=\s*[,\)\]:]|$)', '$1', 'Global'
    
    # Remove optional parameter markers with types: "param?: type" -> "param"
    $content = $content -replace '(\w+)\s*\?\s*:\s*\w+', '$1', 'Global'
    
    # Remove remaining type-only function parameters: ": State" style
    $content = $content -replace ':\s*\w+(?=\s*[,\)\]=>])', '', 'Global'
    
    # Remove return type annotations: "): string" -> ")"
    $content = $content -replace '\)\s*:\s*\w+\s*=>', ') =>', 'Global'
    $content = $content -replace '\)\s*:\s*\w+\s*{', ') {', 'Global'
    
    # Clean up extra spaces
    $content = $content -replace '\s+(?=,|\)|})', '', 'Global'
    $content = $content -replace '{\s*}', '', 'Global'
    $content = $content -replace '\(\s*\)', '()', 'Global'
    
    # Remove duplicate blank lines
    $content = $content -replace '^\s*\n\s*\n', "`n`n", 'Multiline'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        $count++
        Write-Host "  ✓ Converted: $($file.Name)"
    }
}

Write-Host "`nConverted $count files"
