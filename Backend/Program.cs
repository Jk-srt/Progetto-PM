using Backend.Data;
using Backend.Models;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Security.Claims;

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

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var firebaseUid = context.Principal?.FindFirst("user_id")?.Value;
                if (!string.IsNullOrEmpty(firebaseUid))
                {
                    var dbContext = context.HttpContext.RequestServices
                        .GetRequiredService<AppDbContext>();
                    
                    var user = await dbContext.Users
                        .FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);
                    
                    if (user == null)
                    {
                        user = new User
                        {
                            FirebaseUid = firebaseUid,
                            Email = context.Principal.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
                            Name = context.Principal.FindFirst("name")?.Value 
                                ?? $"Utente {firebaseUid}"
                        };
                        dbContext.Users.Add(user);
                        await dbContext.SaveChangesAsync();
                    }
                    
                    context.HttpContext.Items["User"] = user;
                }
            }
        };
    });

// Configurazione CORS
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
    
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
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
    
    c.OperationFilter<SwaggerAuthFilter>();
});

builder.Services.AddHttpClient();
builder.Services.AddControllers();

var app = builder.Build();

// Middleware pipeline
app.UseRouting();

// Ordine corretto middleware
app.UseCors(app.Environment.IsDevelopment() ? "DevelopmentPolicy" : "ProductionPolicy");
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Finance API V1");
        c.ConfigObject.AdditionalItems["syntaxHighlight"] = new Dictionary<string, object>
        {
            ["activated"] = false
        };
    });
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
