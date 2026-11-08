using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LearningStarter.Entities;

public class DiscussionSettings
{
    public int Id { get; set; }
    public int DiscussionId { get; set; }
    public Discussion Discussion { get; set; }
    public string Title { get; set; }
    public int? MaxMembers { get; set; }
    public PrivacyType Privacy { get; set; }
}

public enum PrivacyType
{
    Public,
    Private,
    InviteOnly
}

public class DiscussionSettingsGetDto
{
    public int Id { get; set; }
    public int DiscussionId { get; set; }
    
    public string Title { get; set; }
    public int? MaxMembers { get; set; }
    public PrivacyType Privacy { get; set; }
}

public class DiscussionSettingsCreateDto
{
    public int discussionId { get; set; }
    public string Title { get; set; }
    public int? MaxMembers { get; set; }
    public string Privacy { get; set; }
}

public class DiscussionSettingsUpdateDto
{
    public string Title { get; set; }
    public int? MaxMembers { get; set; }
    public PrivacyType Privacy { get; set; }
}
public class DiscussionSettingsConfiguration : IEntityTypeConfiguration<DiscussionSettings>
{
    public void Configure(EntityTypeBuilder<DiscussionSettings> builder)
    {
        builder.ToTable("DiscussionSettings");

        builder.HasOne(x => x.Discussion)
            .WithOne(x => x.Settings)
            .IsRequired(false);
    }
}