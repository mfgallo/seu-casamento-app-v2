terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  # Estado local por padrão (projeto solo) - mesma observação do whatsvg/infra:
  # migre para um backend remoto (S3 + DynamoDB lock) se o time crescer.
}
