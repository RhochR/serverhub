FROM python:3.12-slim

LABEL maintainer="ServerHub"
LABEL description="MD3 Expressive Server Dashboard"

# Create non-root user
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY app.py .
COPY templates/ templates/
COPY static/ static/

# Data volume
RUN mkdir -p /data && chown -R appuser:appuser /data /app

USER appuser

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "60", "app:app"]
