using Backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore; // ✅ Aggiungi
using Microsoft.AspNetCore.Identity; // ✅ Aggiungi
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

//public class AppDbContext : IdentityDbContext<IdentityUser> // ✅ Modifica ereditarietà
//{ potrebbe servire per autenticazione con Identity Server quando si vuole fare il login
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Asset> Assets { get; set; }
        public DbSet<Investment> Investments { get; set; }
		public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Asset>()
                .HasIndex(a => a.Ticker)
                .IsUnique();

            modelBuilder.Entity<Transaction>()
                .Property(t => t.Date)
                //.HasDefaultValueSql("GETUTCDATE()")
                ;
        }
    }

