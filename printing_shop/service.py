from .models import Order, Product, VALID_ORDER_STATUSES
from .storage import JsonStorage


class PrintingShopService:
    def __init__(self, storage: JsonStorage):
        self.storage = storage

    def list_products(self) -> list[Product]:
        return [Product.from_dict(item) for item in self.storage.load_products()]

    def add_product(self, name: str, paper_type: str, size: str, price_per_page: float) -> Product:
        products = self.storage.load_products()
        if any(p["name"] == name for p in products):
            raise ValueError(f"Product '{name}' already exists")
        product = Product(name=name, paper_type=paper_type, size=size, price_per_page=price_per_page)
        products.append(product.to_dict())
        self.storage.save_products(products)
        return product

    def create_order(self, customer_name: str, product_name: str, pages: int, quantity: int) -> Order:
        if pages <= 0 or quantity <= 0:
            raise ValueError("Pages and quantity must be positive")

        products = {p.name: p for p in self.list_products()}
        if product_name not in products:
            raise ValueError(f"Unknown product '{product_name}'")

        orders = [Order.from_dict(item) for item in self.storage.load_orders()]
        next_id = max((o.id for o in orders), default=0) + 1
        total_price = round(products[product_name].price_per_page * pages * quantity, 2)

        order = Order(
            id=next_id,
            customer_name=customer_name,
            product_name=product_name,
            pages=pages,
            quantity=quantity,
            total_price=total_price,
            status="new",
        )
        orders.append(order)
        self.storage.save_orders([o.to_dict() for o in orders])
        return order

    def list_orders(self) -> list[Order]:
        return [Order.from_dict(item) for item in self.storage.load_orders()]

    def advance_order_status(self, order_id: int) -> Order:
        orders = self.list_orders()
        order = next((o for o in orders if o.id == order_id), None)
        if order is None:
            raise ValueError(f"Order {order_id} not found")

        current_index = VALID_ORDER_STATUSES.index(order.status)
        if current_index == len(VALID_ORDER_STATUSES) - 1:
            raise ValueError("Order is already completed")

        order.status = VALID_ORDER_STATUSES[current_index + 1]
        self.storage.save_orders([o.to_dict() for o in orders])
        return order

    def set_order_status(self, order_id: int, status: str) -> Order:
        if status not in VALID_ORDER_STATUSES:
            raise ValueError(f"Invalid status '{status}'")

        orders = self.list_orders()
        order = next((o for o in orders if o.id == order_id), None)
        if order is None:
            raise ValueError(f"Order {order_id} not found")

        current_index = VALID_ORDER_STATUSES.index(order.status)
        target_index = VALID_ORDER_STATUSES.index(status)

        if target_index < current_index:
            raise ValueError("Cannot move order status backwards")

        order.status = status
        self.storage.save_orders([o.to_dict() for o in orders])
        return order

    def revenue_report(self) -> dict:
        orders = self.list_orders()
        completed = [o for o in orders if o.status == "completed"]
        total_revenue = round(sum(o.total_price for o in completed), 2)
        return {
            "total_orders": len(orders),
            "completed_orders": len(completed),
            "total_revenue": total_revenue,
        }
