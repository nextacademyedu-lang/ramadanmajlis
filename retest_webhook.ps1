$payload = @{
    type = "TRANSACTION"
    obj = @{
        success = $true
        merchant_order_id = "f43337bb-cdfe-4c59-8096-25fe01d4e087"
        order = @{
            merchant_order_id = "f43337bb-cdfe-4c59-8096-25fe01d4e087"
        }
    }
} | ConvertTo-Json -Depth 5

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/payment-webhook" -Method Post -ContentType "application/json" -Body $payload -ErrorAction Stop
    $debugInfo = $response.debug_info
    
    Write-Host "--- WEBHOOK RESPONSE ---" -ForegroundColor Cyan
    if ($debugInfo) {
        $debugInfo | ConvertTo-Json -Depth 5
    } else {
        $response | ConvertTo-Json -Depth 5
    }
} catch {
    Write-Host "❌ Request Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Response Body: $body" -ForegroundColor Yellow
    }
}
