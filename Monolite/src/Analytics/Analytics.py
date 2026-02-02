import polars as pl
import json
import sys

DB_PATH = "../../db.json"

def load_table(df_raw: pl.DataFrame, key: str) -> pl.DataFrame:
    """Convierte una columna list[struct] del JSON en un DataFrame plano."""
    s = df_raw[key].explode()
    return s.struct.unnest()

def calculate_analytics():
    """Calcula todas las métricas y las devuelve como diccionario."""
    raw = pl.read_json(DB_PATH)

    products = load_table(raw, "products")
    orders = load_table(raw, "orders")
    payments = load_table(raw, "payments")
    users = load_table(raw, "users")
    clients = load_table(raw, "clients")

    # Analytics de órdenes
    suma_total_ordenes = orders["totalPrice"].sum()
    cantidad_ordenes = len(orders)
    ticket_promedio = suma_total_ordenes / cantidad_ordenes if cantidad_ordenes > 0 else 0
    cantidad_total_unidades = orders["quantity"].sum()
    
    # Ventas agrupadas por producto
    ventas_por_producto = orders.group_by("productId").agg(
        pl.sum("totalPrice").alias("totalPrice"),
        pl.sum("quantity").alias("totalQuantity")
    )
    
    # Analytics de productos
    cantidad_productos = len(products)
    precio_promedio = products["price"].mean() if cantidad_productos > 0 else 0
    precio_min = products["price"].min() if cantidad_productos > 0 else 0
    precio_max = products["price"].max() if cantidad_productos > 0 else 0
    productos_por_categoria = products.group_by("category").agg(pl.count().alias("count"))
    
    # Analytics de pagos
    cantidad_pagos = len(payments)
    monto_total_pagos = payments["amount"].sum() if cantidad_pagos > 0 else 0
    pagos_por_estado = payments.group_by("status").agg(
        pl.count().alias("count"),
        pl.sum("amount").alias("totalAmount")
    )
    pagos_por_proveedor = payments.group_by("provider").agg(
        pl.count().alias("count"),
        pl.sum("amount").alias("totalAmount")
    )
    
    # Analytics de clientes
    cantidad_clientes = len(clients)
    
    # Analytics de usuarios
    cantidad_usuarios = len(users)
    usuarios_con_token = len(users.filter(pl.col("token").is_not_null()))

    # Construir respuesta JSON
    analytics = {
        "orders": {
            "sumTotalPrice": float(suma_total_ordenes),
            "count": cantidad_ordenes,
            "avgTicket": float(ticket_promedio),
            "totalQuantity": float(cantidad_total_unidades),
            "byProduct": ventas_por_producto.to_dicts() if len(ventas_por_producto) > 0 else []
        },
        "products": {
            "count": cantidad_productos,
            "avgPrice": float(precio_promedio),
            "minPrice": float(precio_min),
            "maxPrice": float(precio_max),
            "byCategory": productos_por_categoria.to_dicts() if len(productos_por_categoria) > 0 else []
        },
        "payments": {
            "count": cantidad_pagos,
            "totalAmount": float(monto_total_pagos),
            "byStatus": pagos_por_estado.to_dicts() if len(pagos_por_estado) > 0 else [],
            "byProvider": pagos_por_proveedor.to_dicts() if len(pagos_por_proveedor) > 0 else []
        },
        "clients": {
            "count": cantidad_clientes
        },
        "users": {
            "count": cantidad_usuarios,
            "activeTokens": usuarios_con_token
        }
    }
    
    return analytics

def main():
    """Función principal: calcula analytics y las imprime como JSON."""
    try:
        analytics = calculate_analytics()
        # Si se ejecuta desde línea de comandos, imprimir JSON
        if len(sys.argv) > 1 and sys.argv[1] == "--json":
            print(json.dumps(analytics, indent=2))
        else:
            # Modo visualización (para debugging)
            print("\n" + "=" * 60 + "\n  ANALYTICS SUMMARY\n" + "=" * 60)
            print(json.dumps(analytics, indent=2))
    except Exception as e:
        error_response = {"error": str(e)}
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()

