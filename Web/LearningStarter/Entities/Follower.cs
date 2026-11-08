using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;

namespace LearningStarter.Entities;

public class Follower
{
    public int Id { get; set; }

        
    public int FollowerId { get; set; }
    public User FollowerUser { get; set; }

    public int FollowingId { get; set; }
    public User FollowingUser { get; set; }

    public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
}

   
public class FollowerGetDto
{
    public int Id { get; set; }
    public int FollowerId { get; set; }
    public string FollowerUserName { get; set; }
    public int FollowingId { get; set; }
    public string FollowingUserName { get; set; }
    public DateTime FollowedAt { get; set; }
}

public class FollowerCreateDto
{
    public int FollowerId { get; set; }
    public int FollowingId { get; set; }
}

public class FollowerEntityTypeConfiguration : IEntityTypeConfiguration<Follower>
{
    public void Configure(EntityTypeBuilder<Follower> builder)
    {
        builder.ToTable("Followers");

        builder.HasOne(f => f.FollowerUser)
            .WithMany()
            .HasForeignKey(f => f.FollowerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.FollowingUser)
            .WithMany()
            .HasForeignKey(f => f.FollowingId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasIndex(f => new { f.FollowerId, f.FollowingId }).IsUnique();
    }
}