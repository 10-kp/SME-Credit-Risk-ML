SECTOR_FACTORS = {
    "manufacturing": 0.0,
    "services": 0.15,
    "trading": 0.10,
    "construction": 0.25,
    "hospitality": 0.20,
    "logistics": 0.10,
    "agri": 0.12,
}

BANDS = [
    ("green", 0.00, 0.02),
    ("amber", 0.02, 0.07),
    ("red",   0.07, 1.00),
]

PRODUCT_TEMPLATES = {
    "green": [
        ("LC", 6, 0.40),
        ("TR", 9, 0.30),
        ("Invoice Discounting", 3, 0.30),
    ],
    "amber": [
        ("LC", 6, 0.35),
        ("Guarantees", 12, 0.35),
        ("Invoice Discounting", 3, 0.30),
    ],
    "red": [
        ("Guarantees", 12, 1.00),
    ],
}
