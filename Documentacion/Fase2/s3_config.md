# Manual de Configuración: Despliegue Frontend en Amazon S3

**Proyecto:** Salud Plus  
**Rama:** Feature/HU215-_201700870  
**Región AWS:** `us-east-1`  
**Bucket S3:** `salud-plus`

---

## Prerrequisitos

- AWS CLI instalado y configurado (`aws configure`)
- Perfil AWS `administrador` con permisos sobre S3
- Node.js y npm instalados
- Archivo `bucket_policy.json` disponible en la raíz del proyecto

---

## Paso 1 — Compilar el frontend

Desde la raíz del proyecto, compilar la aplicación React/Vue/Angular para generar los artefactos de producción en `frontend/dist/`.

```bash
cd frontend
npm run build
```

> Los archivos resultantes quedarán en `frontend/dist/`.

---

## Paso 2 — Crear el bucket S3

Crear el bucket con el nombre `salud-plus` en la región `us-east-1`.

```bash
aws s3 mb s3://salud-plus --region us-east-1
```

> Si el bucket ya existe, este comando retornará un error que puede ignorarse.

---

## Paso 3 — Deshabilitar el bloqueo de acceso público

Por defecto AWS bloquea el acceso público en todos los buckets. Para servir un sitio web estático es necesario deshabilitarlo.

```bash
aws s3api put-public-access-block \
  --bucket salud-plus \
  --public-access-block-configuration \
    "BlockPublicAcls=false,\
IgnorePublicAcls=false,\
BlockPublicPolicy=false,\
RestrictPublicBuckets=false" \
  --profile administrador
```

> **Importante:** Esta configuración expone el bucket públicamente. Asegurarse de que la política del bucket restrinja las operaciones según el principio de mínimo privilegio.

---

## Paso 4 — Habilitar el hosting de sitio web estático

Configurar el bucket para servir contenido web, indicando los documentos de índice y error.

```bash
aws s3 website s3://salud-plus/ \
  --index-document index.html \
  --error-document index.html
```

> Ambos documentos apuntan a `index.html` para soportar el enrutamiento del lado del cliente (SPA).

---

## Paso 5 — Aplicar la política del bucket

Adjuntar la política de acceso definida en `bucket_policy.json`, la cual permite lecturas públicas sobre los objetos del bucket.

```bash
aws s3api put-bucket-policy \
  --bucket salud-plus \
  --policy file://bucket_policy.json
```

> Verificar que `bucket_policy.json` se encuentre en el directorio de trabajo actual antes de ejecutar el comando.

---

## Paso 6 — Sincronizar los artefactos de build

Cargar el contenido compilado al bucket. La bandera `--delete` elimina del bucket los archivos que ya no existen en el directorio local.

```bash
aws s3 sync frontend/dist/ s3://salud-plus/ --delete
```

> Para despliegues subsecuentes, este es el único paso necesario (asumiendo que la configuración del bucket no cambia).

---

## Verificación

Una vez completados todos los pasos, el sitio estará disponible en la siguiente URL:

```
http://salud-plus.s3-website-us-east-1.amazonaws.com
```

Para verificar el estado del bucket:

```bash
aws s3 ls s3://salud-plus/
aws s3api get-bucket-website --bucket salud-plus
aws s3api get-bucket-policy --bucket salud-plus
```

---

## Resumen de comandos

| Paso | Descripción                          | Comando principal                              |
|------|--------------------------------------|------------------------------------------------|
| 1    | Build del frontend                   | `npm run build`                                |
| 2    | Crear bucket S3                      | `aws s3 mb s3://salud-plus`                    |
| 3    | Deshabilitar bloqueo público         | `aws s3api put-public-access-block`            |
| 4    | Activar hosting web estático         | `aws s3 website`                               |
| 5    | Aplicar política del bucket          | `aws s3api put-bucket-policy`                  |
| 6    | Sincronizar artefactos               | `aws s3 sync`                                  |
