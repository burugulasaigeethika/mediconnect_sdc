import os
from celery import Celery

# Get environment variables
BROKER_URL = os.getenv('CELERY_BROKER_URL', 'amqp://guest:guest@localhost:5672//')
BACKEND_URL = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

# Initialize Celery app
app = Celery('mediconnect', broker=BROKER_URL, backend=BACKEND_URL)

# Configuration
app.conf.update(
    task_serializer='json',
    accept_content=['json'],  # Ignore other content
    result_serializer='json',
    timezone='Asia/Kolkata',
    enable_utc=True,
)

# Auto-discover tasks
app.autodiscover_tasks(['tasks'])

if __name__ == '__main__':
    app.start()
