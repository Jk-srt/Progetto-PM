using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FirebaseAdmin.Auth;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("firebase")]
        public async Task<IActionResult> FirebaseLogin()
        {
            System.Console.WriteLine("Dentro al metodo FirebaseLogin");
            try
            {
                var token = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest("Token non fornito");
                }

                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
                string firebaseUid = decodedToken.Uid;
                string? email = decodedToken.Claims.ContainsKey("email") ? decodedToken.Claims["email"].ToString() : null;

                var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

                if (user == null)
                {
                    user = new User
                    {
                        FirebaseUid = firebaseUid,
                        Email = email,
                        CreatedAt = DateTime.UtcNow,
                        LastLogin = DateTime.UtcNow,
                        IsActive = true
                    };
                    await _context.Users.AddAsync(user);
                }
                else
                {
                    user.LastLogin = DateTime.UtcNow;
                    if (email != null && user.Email != email)
                    {
                        user.Email = email;
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new 
                {
                    userId = user.UserId,
                    email = user.Email,
                    message = "Login effettuato con successo"
                });
            }
            catch (FirebaseAuthException ex)
            {
                return Unauthorized(new { message = $"Token non valido: {ex.Message}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Si è verificato un errore: {ex.Message}" });
            }
        }
        
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            try
            {
                // Rimuovere la creazione utente Firebase
                var user = new User
                {
                    Email = model.Email,
                    CreatedAt = DateTime.UtcNow,
                    LastLogin = DateTime.UtcNow,
                    IsActive = true
                };
        
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                return Ok(new 
                {
                    userId = user.UserId,
                    email = user.Email,
                    message = "Registrazione effettuata con successo"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Si è verificato un errore: {ex.Message}" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            try
            {
                // Verifica le credenziali utilizzando l'API REST di Firebase
                var auth = FirebaseAuth.DefaultInstance;
                string apiKey = "LA_TUA_API_KEY"; // Ottieni questo dalla console Firebase
                
                var client = new HttpClient();
                var content = new StringContent(
                    JsonSerializer.Serialize(new
                    {
                        email = model.Email,
                        password = model.Password,
                        returnSecureToken = true
                    }),
                    Encoding.UTF8,
                    "application/json");
                    
                var response = await client.PostAsync(
                    $"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={apiKey}",
                    content);
                    
                if (!response.IsSuccessStatusCode)
                {
                    return Unauthorized(new { message = "Email o password non validi" });
                }
                
                var responseData = await JsonSerializer.DeserializeAsync<Dictionary<string, JsonElement>>(
                    await response.Content.ReadAsStreamAsync());
                    
                var idToken = responseData["idToken"].GetString();
                
                // Verifica il token ottenuto
                var decodedToken = await auth.VerifyIdTokenAsync(idToken);
                string firebaseUid = decodedToken.Uid;
                
                // Recupera o crea l'utente nel database
                var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);
                
                if (user == null)
                {
                    user = new User
                    {
                        FirebaseUid = firebaseUid,
                        Email = model.Email,
                        CreatedAt = DateTime.UtcNow,
                        LastLogin = DateTime.UtcNow,
                        IsActive = true
                    };
                    await _context.Users.AddAsync(user);
                }
                else
                {
                    user.LastLogin = DateTime.UtcNow;
                }
                
                await _context.SaveChangesAsync();
                
                return Ok(new 
                {
                    userId = user.UserId,
                    email = user.Email,
                    token = idToken,
                    message = "Login effettuato con successo"
                });
            }
            catch (FirebaseAuthException ex)
            {
                return Unauthorized(new { message = $"Token non valido: {ex.Message}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Si è verificato un errore: {ex.Message}" });
            }
        }


        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { message = "Logout eseguito" });
        }
    }
}