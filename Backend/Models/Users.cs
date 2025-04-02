using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class User
    {
        public int UserId { get; set; }
        
        [MaxLength(255)]
        public string Email { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
        public bool IsActive { get; set; } = true;
        
        [MaxLength(255)]
        public string FirebaseUid { get; set; }
    
    }
}