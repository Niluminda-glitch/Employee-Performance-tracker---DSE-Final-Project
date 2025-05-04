# PowerShell script to kill all Node.js processes
Write-Host "Searching for Node.js processes..."
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Found Node.js processes. Terminating..."
    $nodeProcesses | ForEach-Object {
        Write-Host "Killing Node.js process with PID: $($_.Id)"
        Stop-Process -Id $_.Id -Force
    }
    Write-Host "All Node.js processes have been terminated."
} else {
    Write-Host "No Node.js processes found."
}

# Check for processes using specific ports
$ports = @(5000, 5003)
foreach ($port in $ports) {
    Write-Host "Checking for processes using port $port..."
    $processInfo = netstat -ano | findstr ":$port"
    
    if ($processInfo) {
        Write-Host "Found processes using port $port:"
        Write-Host $processInfo
        
        # Extract PIDs and kill processes
        $processInfo | ForEach-Object {
            if ($_ -match '(\d+)$') {
                $pid = $matches[1]
                if ($pid -ne "0") {  # Skip system process with PID 0
                    Write-Host "Killing process with PID $pid using port $port"
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                }
            }
        }
    } else {
        Write-Host "No processes found using port $port"
    }
}

Write-Host "Server termination complete."
