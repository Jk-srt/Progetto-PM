using Backend.Data;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configurazione Firebase Admin SDK
FirebaseApp.Create(new AppOptions
{
    Credential = GoogleCredential.FromFile("firebase-service-account.json") // Sostituire con il percorso del file JSON di servizio Firebase
});

// Configurazione del database Neon (Entity Framework Core)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("NeonConnection")));

// Configurazione dell'autenticazione JWT per Firebase
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://securetoken.google.com/your-project-id"; // Sostituire con il proprio project ID di Firebase
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "https://securetoken.google.com/your-project-id", // Sostituire con il proprio project ID di Firebase
            ValidateAudience = true,
            ValidAudience = "your-project-id", // Sostituire con il proprio project ID di Firebase
            ValidateLifetime = true
        };
    });

// Aggiunta dei controller
builder.Services.AddControllers();

var app = builder.Build();

// Configurazione della pipeline HTTP
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication(); // Necessario per gestire l'autenticazione JWT
app.UseAuthorization();

app.MapControllers(); // Mappa i controller API

app.Run();
