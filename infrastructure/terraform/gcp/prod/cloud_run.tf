locals {
  image = "${var.region}-docker.pkg.dev/${var.project_id}/point/docs:${var.image_tag}"
}

resource "google_cloud_run_v2_service" "docs" {
  name     = "docs"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  # Off so a failed first apply can be re-created; turn on once the site is stable.
  deletion_protection = false

  template {
    service_account = data.google_service_account.docs_runtime.email

    # Static files: no database, no secrets, and one request at a time is plenty per instance.
    scaling {
      min_instance_count = 0
      max_instance_count = var.max_instances
    }

    containers {
      image = local.image

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
        # Request-based billing: CPU is allocated only while a request is handled.
        cpu_idle          = true
        startup_cpu_boost = true
      }
    }
  }
}

# The documentation is public.
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = google_cloud_run_v2_service.docs.project
  location = google_cloud_run_v2_service.docs.location
  name     = google_cloud_run_v2_service.docs.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
