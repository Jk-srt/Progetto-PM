using Backend.Data;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configura il database SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configura i servizi
builder.Services.AddScoped<FinancialDataService>();
builder.Services.AddHttpClient(); // ✅ Registra HttpClient per Dependency Injection
builder.Services.AddControllers();

// Abilita CORS (opzionale, se React è su un altro dominio)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// Abilita Swagger (opzionale)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend"); // ✅ Abilita CORS
app.UseAuthorization();
app.MapControllers();

app.Run();
