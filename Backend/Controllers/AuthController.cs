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
                string email = decodedToken.Claims.ContainsKey("email") ? decodedToken.Claims["email"].ToString() : null;

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

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { message = "Logout eseguito" });
        }
    }
}