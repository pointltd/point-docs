terraform {
  required_version = "~> 1.9"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  # The bucket is <project_id>-tfstate and is passed at init:
  #   terraform init -backend-config="bucket=<project_id>-tfstate"
  backend "gcs" {
    prefix = "docs/"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
