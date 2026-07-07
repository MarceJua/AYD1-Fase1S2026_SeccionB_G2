# 1. GRUPO DE RECURSOS
# Todos los recursos de este proyecto vivirán aquí.
resource "azurerm_resource_group" "rg" {
  name     = "rg-saludplus-demo"
  location = "East US"
}

# 2. SERVIDOR POSTGRESQL (Capa Gratuita B1ms)
resource "azurerm_postgresql_flexible_server" "db_server" {
  name                   = "saludplus-db-server-123" # Este nombre DEBE ser único en todo Azure, puedes cambiar el "123" por cualquier número aleatorio.
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "15" # Mantenemos la misma versión 15 que usabas en tus contenedores locales
  administrator_login    = "saludadmin"
  administrator_password = "PasswordSeguro2026!" # Usa una contraseña fuerte
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