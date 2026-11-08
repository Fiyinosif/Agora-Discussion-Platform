using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LearningStarter.Entities;
public enum DiscussionRole {Owner, Admin, Member }

public class DiscussionUsers
{
    public int Id { get; set; }
    public int DiscussionId { get; set; }
    public Discussion Discussion { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }

    public DiscussionRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
}

public class DiscussionUsersGetDto
{ 
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string UserName { get; set; }
    
    public DiscussionRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
}


public class DiscussionUsersEntityTypeConfiguration : IEntityTypeConfiguration<DiscussionUsers>
{
    public void Configure(EntityTypeBuilder<DiscussionUsers> builder)
    {
        builder.ToTable("DiscussionUsers");
        
        builder.HasOne(x => x.Discussion)
            .WithMany(x => x.Members)
            .HasForeignKey(x => x.DiscussionId);
    }
}