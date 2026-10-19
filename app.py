import argparse
from pathlib import Path

from printing_shop.service import PrintingShopService
from printing_shop.storage import JsonStorage


def build_service() -> PrintingShopService:
    base_path = Path(__file__).resolve().parent
    storage = JsonStorage(
        products_path=base_path / "data" / "products.json",
        orders_path=base_path / "data" / "orders.json",
    )
    return PrintingShopService(storage)


def main() -> None:
    parser = argparse.ArgumentParser(description="Albari Printing Press Management")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("init-data")

    add_product = subparsers.add_parser("add-product")
    add_product.add_argument("name")
    add_product.add_argument("paper_type")
    add_product.add_argument("size")
    add_product.add_argument("price_per_page", type=float)

    add_order = subparsers.add_parser("add-order")
    add_order.add_argument("customer_name")
    add_order.add_argument("product_name")
    add_order.add_argument("pages", type=int)
    add_order.add_argument("quantity", type=int)

    advance = subparsers.add_parser("advance-status")
    advance.add_argument("order_id", type=int)

    list_orders = subparsers.add_parser("list-orders")
    list_orders.add_argument("--status", dest="status", default=None)

    subparsers.add_parser("report")

    args = parser.parse_args()
    service = build_service()

    if args.command == "init-data":
        if not service.list_products():
            service.add_product("Business Card", "Matte", "3.5x2 in", 0.4)
            service.add_product("Flyer", "Glossy", "A5", 0.2)
        print("Data initialized")
    elif args.command == "add-product":
        product = service.add_product(args.name, args.paper_type, args.size, args.price_per_page)
        print(f"Added product: {product}")
    elif args.command == "add-order":
        order = service.create_order(args.customer_name, args.product_name, args.pages, args.quantity)
        print(f"Created order: {order}")
    elif args.command == "advance-status":
        order = service.advance_order_status(args.order_id)
        print(f"Order updated: {order}")
    elif args.command == "list-orders":
        orders = service.list_orders()
        if args.status:
            orders = [o for o in orders if o.status == args.status]
        for order in orders:
            print(order)
    elif args.command == "report":
        report = service.revenue_report()
        print(report)


if __name__ == "__main__":
    main()
