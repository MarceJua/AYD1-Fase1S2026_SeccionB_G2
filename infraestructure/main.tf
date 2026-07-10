# 1. GRUPO DE RECURSOS
# Todos los recursos de este proyecto vivirán aquí.
resource "azurerm_resource_group" "rg" {
  name     = "rg-saludplus-demo"
  location = "westus3"
}

# 2. SERVIDOR POSTGRESQL (Capa Gratuita B1ms)
resource "azurerm_postgresql_flexible_server" "db_server" {
  name                   = "saludplus-db-server-357" # Este nombre DEBE ser único
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "15" # Mantenemos la misma versión 15
  administrator_login    = "saludadmin"
  administrator_password = "PasswordSeguro2026!" # contraseña fuerte
  zone                   = "1"
  
  # ¡CRÍTICO! Este es el SKU y almacenamiento exacto para mantener el costo en $0 (Estudiantes)
  storage_mb             = 32768
  sku_name               = "B_Standard_B1ms"
}

# 3. BASE DE DATOS SALUDPLUS
resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = "saludplus_db"
  server_id = azurerm_postgresql_flexible_server.db_server.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# 4. REGLA DE FIREWALL (Permitir conexión a los servicios de Azure)
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "AllowAzureIPs"
  server_id        = azurerm_postgresql_flexible_server.db_server.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# 6. APP SERVICE PLAN (F1 Free Tier)
resource "azurerm_service_plan" "plan" {
  name                = "plan-saludplus-f1"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "F1" 
}

# 7. WEB APP FOR CONTAINERS
resource "azurerm_linux_web_app" "backend" {
  name                = "backend-saludplus-789" # Único
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_service_plan.plan.location
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    always_on = false
    application_stack {
      docker_image_name = "ghcr.io/marcejua/ayd1-fase1s2026_seccionb_g2-backend:latest"
    }
  }

  app_settings = {
    "PORT"        = "5000"
    "DB_USER"     = azurerm_postgresql_flexible_server.db_server.administrator_login
    "DB_PASSWORD" = azurerm_postgresql_flexible_server.db_server.administrator_password
    "DB_HOST"     = azurerm_postgresql_flexible_server.db_server.fqdn
    "DB_PORT"     = "5432"
    "DB_NAME"     = azurerm_postgresql_flexible_server_database.db.name
  }
}

# 8. FRONTEND (Azure Static Web Apps - Plan Gratuito)
resource "azurerm_static_web_app" "frontend" {
  name                = "frontend-saludplus-demo"
  resource_group_name = azurerm_resource_group.rg.name
  location            = "eastus2" 
  sku_tier            = "Free"
  sku_size            = "Free"
}

# 9. OUTPUTS DEL FRONTEND
output "backend_url" {
  value = "https://${azurerm_linux_web_app.backend.default_hostname}"
}


output "frontend_url" {
  value = "https://${azurerm_static_web_app.frontend.default_host_name}"
}

# La llave secreta para que GitHub Actions pueda subir el código del frontend
output "frontend_token" {
  value     = azurerm_static_web_app.frontend.api_key
  sensitive = true
}
