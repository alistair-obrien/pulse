FROM docker:cli AS docker

FROM python:3.13-slim

COPY --from=docker /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker /usr/local/libexec/docker /usr/local/libexec/docker

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        apache2-utils && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY scripts_python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY scripts_python ./scripts_python

ENTRYPOINT ["python", "-m", "scripts_python.pulse"]