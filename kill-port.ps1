# PowerShell script to kill process on port 9002
$port = 9002
$connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connection) {
    $processId = $connection.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Killing process $($process.ProcessName) (PID: $processId) on port $port"
        Stop-Process -Id $processId -Force
        Write-Host "Process killed successfully"
    }
} else {
    Write-Host "No process found on port $port"
}




