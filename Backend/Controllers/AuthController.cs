using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FirebaseAdmin.Auth;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

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

        // 📌 FIREBASE LOGIN
        [HttpPost("firebase")]
        public async Task<IActionResult> FirebaseLogin()
        {
            try
            {
                // Estrae il token dall'header Authorization
                var token = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest("Token non fornito");
                }

                // Verifica il token Firebase
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
                string firebaseUid = decodedToken.Uid;
                string email = decodedToken.Claims.ContainsKey("email") ? decodedToken.Claims["email"].ToString() : null;
                string nome = decodedToken.Claims.ContainsKey("name") ? decodedToken.Claims["name"].ToString() : "Utente";

                // Controlla se l'utente esiste nel database
                var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

                if (user == null)
                {
                    // Crea un nuovo utente
                    user = new User
                    {
                        FirebaseUid = firebaseUid,
                        Email = email,
                        Nome = nome,
                        CreatedAt = DateTime.UtcNow,
                        LastLogin = DateTime.UtcNow,
                        IsActive = true
                    };
                    
                    _context.Users.Add(user);
                }
                else
                {
                    // Aggiorna l'utente esistente
                    user.LastLogin = DateTime.UtcNow;
                    if (email != null && user.Email != email)
                    {
                        user.Email = email;
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { 
                    userId = user.UserId,
                    nome = user.Nome,
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

        // Logout
        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Firebase gestisce l'invalidazione del token lato client
            // Possiamo usare questo metodo per eseguire operazioni di pulizia lato server
            return Ok(new { message = "Logout eseguito" });
        }
    }
}
