FROM python:3.9-slim
WORKDIR /usr/src/api
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt
RUN pip install debugpy
COPY . .

EXPOSE 80

# debugpy
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80", "--reload"]

# Depoloyment
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
