# CloudFront na frente do API Gateway (origem custom, nao S3 - o site nao tem
# bucket proprio, os assets estaticos sao servidos pela propria Lambda via
# serveStatic, ver vite.config.ts). Mesmo dominio padrao *.cloudfront.net do
# whatsvg/infra/static_site.tf, sem custo de dominio proprio por enquanto.

locals {
  api_gateway_domain = replace(aws_apigatewayv2_api.http_api.api_endpoint, "https://", "")
}

resource "aws_cloudfront_distribution" "web" {
  enabled     = true
  price_class = var.cloudfront_price_class

  origin {
    domain_name = local.api_gateway_domain
    origin_id   = "apigw-web"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Paginas SSR - dinamico, sem cache (a propria app controla headers de cache
  # se precisar). Origin request policy "AllViewerExceptHostHeader" encaminha
  # headers/cookies/querystring, necessario pro SSR funcionar direito.
  default_cache_behavior {
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    target_origin_id         = "apigw-web"
    viewer_protocol_policy   = "redirect-to-https"
    compress                 = true
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # AWS Managed-CachingDisabled
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac" # AWS Managed-AllViewerExceptHostHeader
  }

  # Assets com hash no nome (JS/CSS/imagens do build) - podem cachear
  # agressivamente, reduz invocacoes da Lambda pra arquivo estatico.
  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "apigw-web"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # AWS Managed-CachingOptimized
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
