# Free Cloud Run domain mapping (no load balancer). partha.co is already verified for the account that runs
# Terraform, which covers its subdomains.

resource "google_cloud_run_domain_mapping" "docs" {
  location = var.region
  name     = var.domain

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.docs.name
  }
}

resource "google_dns_record_set" "docs" {
  managed_zone = data.google_dns_managed_zone.main.name
  name         = "${var.domain}."
  type         = "CNAME"
  ttl          = 300
  rrdatas = [
    for r in google_cloud_run_domain_mapping.docs.status[0].resource_records : r.rrdata if r.type == "CNAME"
  ]
}
