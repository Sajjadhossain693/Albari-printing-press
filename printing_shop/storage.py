import json
from pathlib import Path


class JsonStorage:
    def __init__(self, products_path: Path, orders_path: Path):
        self.products_path = products_path
        self.orders_path = orders_path

    def load_products(self) -> list[dict]:
        return self._read_json(self.products_path)

    def save_products(self, products: list[dict]) -> None:
        self._write_json(self.products_path, products)

    def load_orders(self) -> list[dict]:
        return self._read_json(self.orders_path)

    def save_orders(self, orders: list[dict]) -> None:
        self._write_json(self.orders_path, orders)

    @staticmethod
    def _read_json(path: Path) -> list[dict]:
        if not path.exists():
            return []
        with path.open("r", encoding="utf-8") as file:
            return json.load(file)

    @staticmethod
    def _write_json(path: Path, data: list[dict]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as file:
            json.dump(data, file, indent=2)
