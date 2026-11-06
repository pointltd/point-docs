variable "project_id" {
  description = "GCP project ID. Set by CI from the GCP_PROJECT_ID variable of the prod environment."
  type        = string
}

variable "region" {
  description = "Region of the Cloud Run service and Artifact Registry."
  type        = string
  default     = "europe-west1"
}

variable "image_tag" {
  description = "Tag of the docs image to deploy. Set by CI to the commit SHA."
  type        = string
}

variable "domain" {
  description = "Host name the documentation is served on."
  type        = string
  default     = "docs.partha.co"
}

variable "dns_zone_name" {
  description = "Cloud DNS managed zone (owned by the platform) that holds the domain."
  type        = string
  default     = "partha-co"
}

variable "max_instances" {
  description = "Upper bound for Cloud Run instances; keeps the bill bounded."
  type        = number
  default     = 2
}
