import tempfile
import unittest
from pathlib import Path

from printing_shop.service import PrintingShopService
from printing_shop.storage import JsonStorage


class PrintingShopServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        temp_path = Path(self.temp_dir.name)
        storage = JsonStorage(
            products_path=temp_path / "products.json",
            orders_path=temp_path / "orders.json",
        )
        self.service = PrintingShopService(storage)
        self.service.add_product("Flyer", "Glossy", "A5", 0.2)

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_create_order_calculates_total_price(self):
        order = self.service.create_order("Alice", "Flyer", pages=10, quantity=2)
        self.assertEqual(order.total_price, 4.0)
        self.assertEqual(order.status, "new")

    def test_advance_order_status_follows_flow(self):
        order = self.service.create_order("Bob", "Flyer", pages=5, quantity=1)
        updated = self.service.advance_order_status(order.id)
        self.assertEqual(updated.status, "paid")

    def test_set_order_status_rejects_backward_transition(self):
        order = self.service.create_order("Carla", "Flyer", pages=3, quantity=1)
        self.service.set_order_status(order.id, "printing")
        with self.assertRaises(ValueError):
            self.service.set_order_status(order.id, "paid")

    def test_revenue_report_only_counts_completed_orders(self):
        order1 = self.service.create_order("Dan", "Flyer", pages=10, quantity=1)
        order2 = self.service.create_order("Ema", "Flyer", pages=20, quantity=1)
        self.service.set_order_status(order1.id, "completed")

        report = self.service.revenue_report()

        self.assertEqual(report["total_orders"], 2)
        self.assertEqual(report["completed_orders"], 1)
        self.assertEqual(report["total_revenue"], 2.0)


if __name__ == "__main__":
    unittest.main()
