using Backend.Data;
using Backend.Models;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Configurazione Firebase
var firebaseProjectId = builder.Configuration["Firebase:ProjectId"] 
    ?? throw new InvalidOperationException("Firebase ProjectId non configurato");

var firebaseCredentialPath = builder.Configuration["Firebase:CredentialPath"]
    ?? "firebase-service-account.json";

FirebaseApp.Create(new AppOptions 
{
    Credential = GoogleCredential.FromFile(firebaseCredentialPath),
    ProjectId = firebaseProjectId
});

// Configurazione database
builder.Services.AddDbContext<AppDbContext>(options => 
{
    var connectionString = builder.Configuration.GetConnectionString("NeonConnection") 
        ?? throw new InvalidOperationException("Connection string non trovata");
        
    options.UseNpgsql(connectionString)
        .EnableDetailedErrors(builder.Environment.IsDevelopment())
        .EnableSensitiveDataLogging(builder.Environment.IsDevelopment());
});

// Configurazione autenticazione
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => 
    {
        options.Authority = $"https://securetoken.google.com/{firebaseProjectId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{firebaseProjectId}",
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

// Configurazione CORS aggiornata
// Configurazione CORS aggiornata
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "https://finance-management-7c778.web.app",  // Nuovo dominio Firebase
                "https://finance-management-7c778.firebaseapp.com",  // Dominio legacy Firebase
                "https://backproject.azurewebsites.net"      // Backend stesso (se necessario)
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithExposedHeaders("WWW-Authenticate");  // Per errori dettagliati
    });
});


// Configurazione Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Finance Management API", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Inserisci il token JWT nel formato: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
});

builder.Services.AddHttpClient();
builder.Services.AddControllers();

var app = builder.Build();

// Middleware pipeline

app.UseRouting();

// Applica CORS prima di autenticazione/authorization
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
