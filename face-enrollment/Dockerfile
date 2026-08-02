FROM python:3.11-slim

# Install system dependencies dlib needs to compile
RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake \
    build-essential \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first so Docker can cache this layer
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Render sets $PORT at runtime — replace app.py / app object below
# with your actual entrypoint file and Flask/FastAPI app variable name
CMD ["python", "api/server.py"]
