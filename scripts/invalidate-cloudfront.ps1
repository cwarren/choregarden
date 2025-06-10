# Get the CloudFront domain name from Terraform output or set it here
$cloudfrontDomain = terraform "-chdir=../infrastructure/envs/dev" output -raw frontend_cloudfront_url

if (-not $cloudfrontDomain) {
  Write-Host "Could not determine CloudFront domain from Terraform output. Please set it manually in the script."
  exit 1
}

# Fetch all distributions and find the one matching the domain name
$distributions = aws cloudfront list-distributions | ConvertFrom-Json
$dist = $distributions.DistributionList.Items | Where-Object { $_.DomainName -eq $cloudfrontDomain }

if (-not $dist) {
  Write-Host "Could not find a CloudFront distribution matching domain $cloudfrontDomain."
  exit 1
}

$DistributionId = $dist.Id
$Paths = @('/config.json', '/index.html')
$pathsArg = $Paths -join ' '

Write-Host "Invalidating CloudFront distribution $DistributionId for paths: $pathsArg"

aws cloudfront create-invalidation --distribution-id $DistributionId --paths $Paths

if ($LASTEXITCODE -eq 0) {
  Write-Host "CloudFront invalidation request submitted successfully."
} else {
  Write-Host "CloudFront invalidation failed. Check your AWS credentials and distribution ID."
  exit 1
}
