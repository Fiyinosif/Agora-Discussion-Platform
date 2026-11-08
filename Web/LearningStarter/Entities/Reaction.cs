using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LearningStarter.Entities;

public enum ReactionType
{
    Like,
    Dislike
}

public class Reaction
{
    public int Id { get; set; }

    public int DiscussionId { get; set; }
    public Discussion Discussion { get; set; }

     
    public int UserId { get; set; }
    public User User { get; set; }

    public ReactionType ReactionType { get; set; } // Like / Dislike
}

public class ReactionGetDto
{
    public int Id { get; set; }
    public int DiscussionId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; }
    public string ReactionType { get; set; }
}

public class ReactionCreateDto
{
    public int DiscussionId { get; set; }
    public int? ResponseId { get; set; }
    public int UserId { get; set; }
    public string ReactionType { get; set; }
}

public class ReactionUpdateDto
{
    public string ReactionType { get; set; }
}

public class ReactionEntityTypeConfiguration : IEntityTypeConfiguration<Reaction>
{
    public void Configure(EntityTypeBuilder<Reaction> builder)
    {
        builder.ToTable("Reactions");

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId);

        builder.HasOne(x => x.Discussion)
            .WithMany(x => x.Reactions)
            .HasForeignKey(x => x.DiscussionId);
    }
}