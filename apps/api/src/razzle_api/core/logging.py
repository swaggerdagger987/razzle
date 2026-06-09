import logging


def configure_logging(environment: str) -> None:
    level = logging.DEBUG if environment == "local" else logging.INFO
    logging.basicConfig(
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        level=level,
    )
