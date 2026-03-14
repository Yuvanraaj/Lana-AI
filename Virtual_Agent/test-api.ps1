# Test script for Interview Bot APIs
$baseUrl = "http://localhost:8001"

Write-Host "========================================"
Write-Host "Interview Bot API Test Suite"
Write-Host "========================================"
Write-Host ""

# Test 1: Health Check
Write-Host "[1] Testing Health Check..."
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method Get -UseBasicParsing -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host "PASS: Health Check"
    Write-Host "  Status: $($data.status)"
} catch {
    Write-Host "FAIL: Health Check - $_"
}
Write-Host ""

# Test 2: Register New User
Write-Host "[2] Testing User Registration..."
$testUsername = "testuser_$(Get-Random -Maximum 99999)"
$testPassword = "TestPass123"
$testEmail = "test_$(Get-Random -Maximum 99999)@example.com"
$testName = "Test User"

$registerBody = @{
    username = $testUsername
    password = $testPassword
    passwordConfirm = $testPassword
    name = $testName
    email = $testEmail
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/analytics/user/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody `
        -UseBasicParsing `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "PASS: Registration"
    Write-Host "  User ID: $($data.user.id)"
    Write-Host "  Username: $($data.user.username)"
    
    $global:testUserId = $data.user.id
} catch {
    $errorInfo = $_.Exception.Response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
    Write-Host "FAIL: Registration - $($errorInfo.error)"
}
Write-Host ""

# Test 3: Login
Write-Host "[3] Testing User Login..."
$loginBody = @{
    username = $testUsername
    password = $testPassword
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/analytics/user/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "PASS: Login"
    Write-Host "  User ID: $($data.user.id)"
    Write-Host "  Username: $($data.user.username)"
} catch {
    $errorInfo = $_.Exception.Response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
    Write-Host "FAIL: Login - $($errorInfo.error)"
}
Write-Host ""

# Test 4: Check Username Availability
Write-Host "[4] Testing Username Availability Check..."
$randomUser = "available_user_$(Get-Random -Maximum 99999)"
$checkBody = @{
    username = $randomUser
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/analytics/user/check-username" `
        -Method Post `
        -ContentType "application/json" `
        -Body $checkBody `
        -UseBasicParsing `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "PASS: Username Check"
    Write-Host "  Available: $($data.available)"
} catch {
    $errorInfo = $_.Exception.Response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
    Write-Host "FAIL: Username Check - $($errorInfo.error)"
}
Write-Host ""

# Test 5: Get User Profile
Write-Host "[5] Testing Get User Profile..."
if ($global:testUserId) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/analytics/user/$($global:testUserId)" `
            -Method Get `
            -UseBasicParsing `
            -ErrorAction Stop
        
        $data = $response.Content | ConvertFrom-Json
        Write-Host "PASS: Get User Profile"
        Write-Host "  User: $($data.user.username)"
        Write-Host "  Email: $($data.user.email)"
    } catch {
        $errorInfo = $_.Exception.Response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
        Write-Host "FAIL: Get User Profile - $($errorInfo.error)"
    }
} else {
    Write-Host "SKIP: Get User Profile (User ID not available)"
}
Write-Host ""

Write-Host "========================================"
Write-Host "API Test Suite Complete"
Write-Host "========================================"
