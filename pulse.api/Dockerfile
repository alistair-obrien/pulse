FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY . .

RUN dotnet restore Pulse.Api/Pulse.Api.csproj

RUN dotnet publish \
    Pulse.Api/Pulse.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0

ARG PULSE_COMMIT_SHA
ARG PULSE_BUILD_DATE
ARG PULSE_VERSION

ENV PULSE_COMMIT_SHA=$PULSE_COMMIT_SHA
ENV PULSE_BUILD_DATE=$PULSE_BUILD_DATE
ENV PULSE_VERSION=$PULSE_VERSION

RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Pulse.Api.dll"]