$procs = Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match 'next|start-server' }
foreach ($proc in $procs) {
  Write-Output ("Killing PID " + $proc.ProcessId)
  Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
}
Write-Output "Done. Remaining listeners on 3000-3010:"
netstat -ano | Select-String ":30(0[0-9]|10).*LISTENING"
