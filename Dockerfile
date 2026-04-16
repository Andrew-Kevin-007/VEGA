# Use the official Microsoft Playwright Python base image to avoid missing Chromium system dependencies
FROM mcr.microsoft.com/playwright/python:v1.42.0-jammy

# Set python environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Set Working directory
WORKDIR /app

# Copy requirement files and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project codebase
COPY . .

# Expose the FastAPI port
EXPOSE 8000

# Start command (Run FastAPI server directly)
CMD ["uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8000"]
