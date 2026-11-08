using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LearningStarter.Entities;

public class BannedUsers
{
    public int Id { get; set; }
    public int UserId{ get; set; }
    public User User{ get; set; }
    public string Reason { get; set; }
    public int BannedByUserId { get; set; }
    public User BannedByUser{ get; set; }
    public DateTime DateBanned { get; set; } = DateTime.UtcNow;
    public int DiscussionId { get; set; }
    public Discussion Discussion{ get; set; }
    
    public bool IsPermanent { get; set; } = false;
    public TimeSpan? Duration { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public bool IsActive { get; set; }

}

public class BannedUserGetDto
{
    public int Id { get; set; }
    public int UserId{ get; set; }
    public string userName { get; set; }
    public string Reason { get; set; }
    public int DiscussionId{ get; set; }
    public int BannedByUserId { get; set; }
    public string BannedByUserName { get; set; }
    public DateTime DateBanned { get; set; } = DateTime.UtcNow;
    public bool IsPermanent { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public bool IsActive { get; set; }
}

public class BannedUserCreateDto
{
    public int UserId{ get; set; }
    public User User { get; set; }
    public string Reason { get; set; }
    public int DiscussionId{ get; set; }
    public int BannedByUserId { get; set; }
    public User BannedByUser { get; set; }
    public bool IsPermanent { get; set; } = false;
    public TimeSpan? Duration { get; set; }
    public bool IsActive { get; set; }

}

public class BannedUserUpdateDto
{
    public int UserId{ get; set; }
    public string Reason { get; set; }
    public int DiscussionId{ get; set; }
    public string BannedByUserId { get; set; }
    public bool IsPermanent { get; set; } = false;
    public TimeSpan? Duration { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public bool IsActive { get; set; }

}

public class BannedUserEntityTypeConfiguration : IEntityTypeConfiguration<BannedUsers>

{
public void Configure(EntityTypeBuilder<BannedUsers> builder)
{
    builder.ToTable("BannedUsers");
    
    builder.HasOne(x => x.Discussion)
        .WithMany(x => x.BannedUsers)
        .HasForeignKey(x => x.DiscussionId)
        .OnDelete(DeleteBehavior.Restrict);
    builder.HasOne(x => x.BannedByUser)
        .WithMany()
        .HasForeignKey(x => x.BannedByUserId)
        .OnDelete(DeleteBehavior.Restrict);
}
}

