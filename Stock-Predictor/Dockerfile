# Use Python 3.11 slim image as base
FROM python:3.11-slim


# Create a non-root user and group early for better layer caching
RUN useradd --create-home --shell /bin/bash stockuser

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=src/app.py \
    FLASK_ENV=production

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and tests
COPY src/ ./src/


# Change ownership of the app directory to the stockuser
RUN chown -R stockuser:stockuser /app
USER stockuser

# Expose the port that the app runs on
EXPOSE 5000


# Run the application using python from the src directory
CMD ["python", "src/app.py"]