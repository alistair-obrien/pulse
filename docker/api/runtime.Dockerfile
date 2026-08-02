FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY publish/api/ .

ENTRYPOINT ["dotnet", "Pulse.Api.dll"]