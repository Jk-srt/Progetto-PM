using Backend.Data;
using Backend.Models;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurazione Firebase con validazione
var firebaseProjectId = builder.Configuration["Firebase:ProjectId"] 
    ?? throw new InvalidOperationException("Firebase ProjectId non configurato");

var firebaseCredentialPath = builder.Configuration["Firebase:CredentialPath"]
    ?? "firebase-service-account.json";

if (!File.Exists(firebaseCredentialPath))
{
    throw new FileNotFoundException($"File credentials Firebase non trovato: {firebaseCredentialPath}");
}

FirebaseApp.Create(new AppOptions 
{
    Credential = GoogleCredential.FromFile(firebaseCredentialPath),
    ProjectId = firebaseProjectId
});

// 2. Configurazione database con opzioni avanzate
builder.Services.AddDbContext<AppDbContext>(options => 
{
    var connectionString = builder.Configuration.GetConnectionString("NeonConnection") 
        ?? throw new InvalidOperationException("Connection string non trovata");
        
    options.UseNpgsql(connectionString)
        .EnableDetailedErrors(builder.Environment.IsDevelopment())
        .EnableSensitiveDataLogging(builder.Environment.IsDevelopment());
});

// 3. Autenticazione JWT migliorata
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
        options.SaveToken = true;
    });

// 4. CORS più restrittivo
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });

    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy.WithOrigins("https://tuodominio.com")
            .AllowAnyHeader()
            .WithMethods("GET", "POST", "PUT", "DELETE")
            .AllowCredentials();
    });
});

// 5. Configurazione Swagger/OpenAPI
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

builder.Services.AddControllers();

var app = builder.Build();

// Configurazione ambiente di sviluppo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("DevelopmentPolicy");
}
else
{
    app.UseCors("ProductionPolicy");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.Use(async (context, next) =>
{
    try
    {
        await next(context);
    }
    catch (FileNotFoundException ex)
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync($"Errore di configurazione: {ex.Message}");
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync($"Errore interno: {ex.Message}");
    }
});

app.MapControllers();
app.Run();