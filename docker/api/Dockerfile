FROM mcr.microsoft.com/dotnet/sdk:10.0 AS builder

ARG CONFIGURATION=Release

WORKDIR /src

COPY Pulse.Api/Pulse.Api.csproj Pulse.Api/
COPY Pulse.Domain/Pulse.Domain.csproj Pulse.Domain/
COPY Pulse.Infrastructure/Pulse.Infrastructure.csproj Pulse.Infrastructure/
COPY Pulse.Tests/Pulse.Tests.csproj Pulse.Tests/

RUN dotnet restore

COPY Pulse.Api/ Pulse.Api/
COPY Pulse.Domain/ Pulse.Domain/
COPY Pulse.Infrastructure/ Pulse.Infrastructure/
COPY Pulse.Tests/ Pulse.Tests/

RUN dotnet publish Pulse.Api/Pulse.Api.csproj \
    -c ${CONFIGURATION} \
    -o /publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=builder /publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "Pulse.Api.dll"]