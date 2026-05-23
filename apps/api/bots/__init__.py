"""Razzle bots — out-of-process distribution surfaces.

Each bot is a long-running script that consumes free traffic from a
platform and links back to razzle.lol. Designed to run as a separate
process from the API (different VM / Fly app) so a bot crash doesn't
take down the product.
"""
