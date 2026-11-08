using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LearningStarter.Entities;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class TagGetDto
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class TagCreateDto
{
    public string Name { get; set; }
}

public class TagEntityTypeConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder.ToTable("Tag");
    }
}