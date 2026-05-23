"""Razzle V2 services — business logic, SQL, enrichment.

Routers are HTTP-thin; services own data access. This split matches the
legacy `live_data/` layout and makes the routers easy to unit-test.
"""
