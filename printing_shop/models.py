from dataclasses import asdict, dataclass


VALID_ORDER_STATUSES = ["new", "paid", "printing", "ready", "completed"]


@dataclass
class Product:
    name: str
    paper_type: str
    size: str
    price_per_page: float

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "Product":
        return cls(
            name=data["name"],
            paper_type=data["paper_type"],
            size=data["size"],
            price_per_page=float(data["price_per_page"]),
        )


@dataclass
class Order:
    id: int
    customer_name: str
    product_name: str
    pages: int
    quantity: int
    total_price: float
    status: str = "new"

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "Order":
        return cls(
            id=int(data["id"]),
            customer_name=data["customer_name"],
            product_name=data["product_name"],
            pages=int(data["pages"]),
            quantity=int(data["quantity"]),
            total_price=float(data["total_price"]),
            status=data.get("status", "new"),
        )
