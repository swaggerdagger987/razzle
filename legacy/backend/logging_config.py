"""
Razzle logging configuration.

- Production (ENVIRONMENT=production): structured JSON to stdout
- Local dev (default): colored console format with timestamps
"""

import logging
import json
import os
import sys
import time as _time


class JSONFormatter(logging.Formatter):
    """Structured JSON log format for production."""

    def format(self, record):
        log_entry = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = self.formatException(record.exc_info)
        # Include extra fields from request middleware
        for key in ("request_id", "method", "path", "status", "duration_ms", "client"):
            val = getattr(record, key, None)
            if val is not None:
                log_entry[key] = val
        return json.dumps(log_entry)


class ConsoleFormatter(logging.Formatter):
    """Readable console format for local development."""

    COLORS = {
        "DEBUG": "\033[36m",     # cyan
        "INFO": "\033[32m",      # green
        "WARNING": "\033[33m",   # yellow
        "ERROR": "\033[31m",     # red
        "CRITICAL": "\033[1;31m",  # bold red
    }
    RESET = "\033[0m"

    def format(self, record):
        color = self.COLORS.get(record.levelname, "")
        ts = self.formatTime(record, "%H:%M:%S")
        msg = record.getMessage()
        base = f"{color}{ts} {record.levelname:<8}{self.RESET} [{record.name}] {msg}"
        if record.exc_info and record.exc_info[0]:
            base += "\n" + self.formatException(record.exc_info)
        return base


def setup_logging():
    """Configure logging for the entire application. Call once at startup."""
    env = os.environ.get("ENVIRONMENT", "development")
    is_prod = env == "production"
    level = logging.INFO

    root = logging.getLogger("razzle")
    root.setLevel(level)

    # Remove any existing handlers (avoid duplicates on reload)
    root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)

    if is_prod:
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(ConsoleFormatter())

    root.addHandler(handler)

    # Quiet noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    root.info("Logging initialized (env=%s)", env)
