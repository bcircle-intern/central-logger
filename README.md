## Central Logger

[![Build Status](https://dev.azure.com/wk-j/central-logger/_apis/build/status/bcircle-intern.central-logger)](https://dev.azure.com/wk-j/central-logger/_build/latest?definitionId=5)
[![NuGet](https://img.shields.io/nuget/v/BCircle.CentralLogProvider.svg)](https://www.nuget.org/packages/BCircle.CentralLogProvider)
[![](https://sonarcloud.io/api/project_badges/measure?project=central-logger&metric=alert_status)](https://sonarcloud.io/dashboard?id=central-logger)

[![](https://sourcerer.io/fame/wk-j/bcircle-intern/central-logger/images/0)](https://sourcerer.io/fame/wk-j/bcircle-intern/central-logger/links/0)
[![](https://sourcerer.io/fame/wk-j/bcircle-intern/central-logger/images/1)](https://sourcerer.io/fame/wk-j/bcircle-intern/central-logger/links/1)
[![](https://sourcerer.io/fame/wk-j/bcircle-intern/central-logger/images/2)](https://sourcerer.io/fame/wk-j/bcircle-intern/central-logger/links/2)
[![](https://sourcerer.io/fame/wk-j/bcircle-intern/central-logger/images/3)](https://sourcerer.io/fame/wk-j/bcircle-intern/central-logger/links/3)
[![](https://sourcerer.io/fame/wk-j/bcircle-intern/central-logger/images/4)](https://sourcerer.io/fame/wk-j/bcircle-intern/central-logger/links/4)

- [Client](client)
- [Server](src/CentralLogger)

## Build

```bash
dotnet cake -target=Build-Web
dotnet run --project src/CentralLogger/CentralLogger.csproj
```

## Provider

- [NuGet](https://www.nuget.org/packages/BCircle.CentralLogProvider)

## Server

- [Docker](https://hub.docker.com/r/wearetherock/central-logger)

```bash
docker run -p 8080:80 -e "CENTRAL_LOGGER_CS=<ConnectionString>"  wearetherock/central-logger:latest
```