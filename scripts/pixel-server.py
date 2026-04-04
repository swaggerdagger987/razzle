"""Standalone pixel lab server — run: python3 scripts/pixel-server.py"""
import http.server
import os
os.chdir(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
http.server.HTTPServer(('127.0.0.1', 8001), http.server.SimpleHTTPRequestHandler).serve_forever()
