using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace LearningStarter.Entities;

public enum InviteStatus
{
    Pending = 1,
    Accepted = 2,
    Declined = 3
}

public class Invite
{
    public int Id { get; set; }

    public int DiscussionId { get; set; }
    public Discussion Discussion { get; set; }

    public int SenderUserId { get; set; }
    public User SenderUser { get; set; }

    public int RecipientUserId { get; set; }
    public User RecipientUser { get; set; }

    public InviteStatus Status { get; set; } = InviteStatus.Pending;

    public string Message { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class InviteGetDto
{
    public int Id { get; set; }
    public int DiscussionId { get; set; }

    public int SenderUserId { get; set; }
    public string SenderUserName { get; set; }

    public int RecipientUserId { get; set; }
    public string RecipientUserName { get; set; }

    public string Status { get; set; }
    public string Message { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class InviteCreateDto
{
    public int DiscussionId { get; set; }
    public int SenderUserId { get; set; }
    public int RecipientUserId { get; set; }
    public string Message { get; set; }
    // usually "Pending" on create; optional to accept
    public string Status { get; set; } = "Pending";
    public DateTime? ExpiresAt { get; set; }
}

public class InviteUpdateDto
{
    // "Accepted" or "Declined" (or "Pending" to reset)
    public string Status { get; set; }
}

public class InviteEntityTypeConfiguration : IEntityTypeConfiguration<Invite>
{
    public void Configure(EntityTypeBuilder<Invite> builder)
    {
        builder.ToTable("Invites");

        builder.HasOne(x => x.Discussion)
            .WithMany()
            .HasForeignKey(x => x.DiscussionId); // cascade here is fine

        builder.HasOne(x => x.SenderUser)
            .WithMany()
            .HasForeignKey(x => x.SenderUserId)
            .OnDelete(DeleteBehavior.Restrict);   

        builder.HasOne(x => x.RecipientUser)
            .WithMany()
            .HasForeignKey(x => x.RecipientUserId)
            .OnDelete(DeleteBehavior.Restrict);  
    }
}