variable "name" {
  description = "Name for the Cognito user pool"
  type        = string
}

variable "callback_urls" {
  description = "Allowed callback URLs for the user pool client"
  type        = list(string)
}

variable "logout_urls" {
  description = "Allowed logout URLs for the user pool client"
  type        = list(string)
}
