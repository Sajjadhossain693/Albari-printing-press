# Albari Printing Press

A minimal online printing shop management application.

## Features
- Manage print products (paper type, size, and price per page)
- Create print orders with automatic price calculation
- Track order status (`new -> paid -> printing -> ready -> completed`)
- View order list and revenue report from completed orders

## Usage
Run commands from the repository root.

```bash
python app.py init-data
python app.py add-product "Poster" "Matte" "A3" 0.5
python app.py add-order "Alice" "Poster" 4 2
python app.py advance-status 1
python app.py list-orders
python app.py report
```

## Test
```bash
python -m unittest -v
```
