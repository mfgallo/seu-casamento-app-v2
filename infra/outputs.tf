output "site_url" {
  description = "URL publica do site (dominio padrao do CloudFront)."
  value       = "https://${aws_cloudfront_distribution.web.domain_name}"
}

output "api_gateway_invoke_url" {
  description = "URL direta do API Gateway (sem CloudFront na frente) - util para debug."
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "lambda_function_name" {
  value = aws_lambda_function.web.function_name
}
