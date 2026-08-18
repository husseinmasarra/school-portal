$cacertsSource = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot\lib\security\cacerts"
$cacertsDest = "c:\Users\Hussein\Desktop\school-portal\android\cacerts"
$keytoolPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot\bin\keytool.exe"

if (!(Test-Path $cacertsSource)) {
    # Try Android Studio JBR cacerts as fallback
    $cacertsSource = "C:\Program Files\Android\Android Studio\jbr\lib\security\cacerts"
    $keytoolPath = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
}

Write-Output "Using JDK cacerts source: $cacertsSource"
Write-Output "Using keytool path: $keytoolPath"

# Copy cacerts to writable project directory
Copy-Item -Path $cacertsSource -Destination $cacertsDest -Force

# Get Windows Root certificates (both LocalMachine and CurrentUser)
$certs = Get-ChildItem -Path Cert:\LocalMachine\Root, Cert:\CurrentUser\Root -ErrorAction SilentlyContinue | Unique

Write-Output "Found $($certs.Count) Windows Root certificates to import."

$i = 1
foreach ($cert in $certs) {
    if ($cert.Subject -like "*AVG*" -or $cert.Subject -like "*Antivirus*" -or $cert.Subject -like "*Shield*" -or $cert.Issuer -like "*AVG*" -or $cert.Subject -like "*Eset*" -or $cert.Subject -like "*Kaspersky*" -or $cert.Subject -like "*Avast*") {
        Write-Output "Targeting security certificate: $($cert.Subject)"
    }
    
    $tempPath = "$env:TEMP\win_cert_$i.cer"
    try {
        [System.IO.File]::WriteAllBytes($tempPath, $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert))
        
        $alias = "win_root_cert_$i"
        
        # Import certificate into local cacerts copy
        $process = Start-Process -FilePath $keytoolPath -ArgumentList "-importcert", "-trustcacerts", "-alias", $alias, "-file", $tempPath, "-keystore", $cacertsDest, "-storepass", "changeit", "-noprompt" -NoNewWindow -PassThru -Wait
        
        Remove-Item $tempPath -ErrorAction SilentlyContinue
    } catch {
        # Skip errors for individual certificates
    }
    $i++
}

Write-Output "Successfully imported root certificates into local cacerts at: $cacertsDest"
