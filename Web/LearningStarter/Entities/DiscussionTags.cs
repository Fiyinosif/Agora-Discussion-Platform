using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LearningStarter.Entities;

public class DiscussionTags
{
    public int Id { get; set; }
    public int DiscussionId { get; set; }
    public Discussion Discussion { get; set; }
    public int TagId { get; set; }
    public Tag Tag { get; set; }
}

public class DiscussionTagsGetDto
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class DiscussionTagsEntityTypeConfiguration : IEntityTypeConfiguration<DiscussionTags>
{
    public void Configure(EntityTypeBuilder<DiscussionTags> builder)
    {
        builder.ToTable("DiscussionTags");

        builder.HasOne(x => x.Discussion)
            .WithMany(x => x.Tags);
        builder.HasOne(x => x.Tag)
            .WithMany();
    }
}