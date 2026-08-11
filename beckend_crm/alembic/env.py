from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import sys
from pathlib import Path

# Добавляем папки в пути Python, чтобы виделись models.py и другие модули
BASE_DIR = Path(__file__).resolve().parents[1]  # это папка beckend_crm
sys.path.insert(0, str(BASE_DIR))

from models import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    # Получаем URL из конфига или заменяем asyncpg на psycopg2 для миграций
    url = config.get_main_option("sqlalchemy.url")
    if "+asyncpg" in url:
        url = url.replace("+asyncpg", "") # убираем asyncpg, чтобы Alembic шел через синхронный psycopg2

    connectable = engine_from_config(
        {"sqlalchemy.url": url},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()
