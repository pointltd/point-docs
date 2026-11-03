# Resources owned by the platform (partha-global-ops), looked up by their contract names.

data "google_service_account" "docs_runtime" {
  account_id = "docs-runtime"
}

data "google_dns_managed_zone" "main" {
  name = var.dns_zone_name
}
