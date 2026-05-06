# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["DiaCareKids.Api/DiaCareKids.Api.csproj", "DiaCareKids.Api/"]
RUN dotnet restore "DiaCareKids.Api/DiaCareKids.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/DiaCareKids.Api"
RUN dotnet build "DiaCareKids.Api.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "DiaCareKids.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose the port Render expects (usually 80 or 10000)
# Render will automatically map its external port to this
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "DiaCareKids.Api.dll"]
