using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LearningStarter.Entities;

public class Discussion
{
    public int Id { get; set; }
    public DiscussionSettings? Settings { get; set; }

    public string Body { get; set; }
    public int CreatedByUserId { get; set; }
    public User Owner { get; set; }
    public int? ParentId { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public List<DiscussionUsers> Members { get; set; }
    public List<DiscussionTags> Tags { get; set; }
    public List<Reaction> Reactions { get; set; } = new();
    public List <BannedUsers> BannedUsers { get; set; }
}

public class DiscussionGetDto
{
    public int Id { get; set; }
    public DiscussionSettingsGetDto Settings { get; set; }
    public string Body { get; set; }
    public int CreatedByUserId { get; set; }
    public UserGetDto Owner { get; set; }
    public int? ParentId { get; set; }
    public List<DiscussionUsersGetDto> Members { get; set; }
    public List<DiscussionTagsGetDto> Tags { get; set; }
    public List<ReactionGetDto> Reactions { get; set; }
    public List <BannedUserGetDto> BannedUsers { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DiscussionCreateDto
{
    public string Body { get; set; }
    public int CreatedByUserId { get; set; }
    public int? ParentId { get; set; }
}

public class DiscussionUpdateDto
{
    public string Body { get; set; }
}

public class DiscussionEntityTypeConfiguration : IEntityTypeConfiguration<Discussion>
{
    public void Configure(EntityTypeBuilder<Discussion> builder)
    {
        builder.ToTable("Discussions");

        builder.HasOne(x => x.Owner)
            .WithMany()
            .HasForeignKey(x => x.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(x => x.Settings)
            .WithOne()
            .HasForeignKey<DiscussionSettings>(x => x.DiscussionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Members
        builder.HasMany(x => x.Members)
            .WithOne(x => x.Discussion)
            .HasForeignKey(x => x.DiscussionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Tags
        builder.HasMany(x => x.Tags)
            .WithOne(x => x.Discussion)
            .HasForeignKey(x => x.DiscussionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Reactions
        builder.HasMany(x => x.Reactions)
            .WithOne(x => x.Discussion)
            .HasForeignKey(x => x.DiscussionId)
            .OnDelete(DeleteBehavior.Cascade);

        // BannedUsers
        builder.HasMany(x => x.BannedUsers)
            .WithOne(x => x.Discussion)
            .HasForeignKey(x => x.DiscussionId)
            .OnDelete(DeleteBehavior.Cascade);



    }
}