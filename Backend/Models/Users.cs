using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class User
    {
        public int UserId { get; set; }
        
        [Required, MaxLength(100)]
        public string Nome { get; set; }
        
        [Required, MaxLength(100)]
        public string Email { get; set; }
        
        [MaxLength(255)]
        public string PasswordHash { get; set; }
        
        [MaxLength(128)]
        public string Salt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
        public bool IsActive { get; set; } = true;
    }
}