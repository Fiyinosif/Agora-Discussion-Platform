using System;
using System.Linq;
using LearningStarter.Common;
using LearningStarter.Data;
using LearningStarter.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearningStarter.Controllers;

[ApiController]
[Route("api/reactions")]
public class ReactionsController : ControllerBase
{
    private readonly DataContext _context;

    public ReactionsController(DataContext context)
    {
        _context = context;
    }

    [HttpPost]
    public IActionResult Create([FromBody] ReactionCreateDto dto)
    {
        var response = new Response();

        var discussion = _context.Set<Discussion>().FirstOrDefault(x => x.Id == dto.DiscussionId);
        if (discussion == null)
        {
            response.AddError("discussionId", "Discussion not found.");
            return BadRequest(response);
        }

        var user = _context.Users.FirstOrDefault(x => x.Id == dto.UserId);
        if (user == null)
        {
            response.AddError("userId", "User not found.");
            return BadRequest(response);
        }

        if (!Enum.TryParse<ReactionType>(dto.ReactionType, true, out var parsedReactionType))
        {
            response.AddError("reactionType", "Invalid reaction type. Use Like or Dislike.");
            return BadRequest(response);
        }

        var existingReaction = _context.Set<Reaction>()
            .FirstOrDefault(x => x.DiscussionId == dto.DiscussionId && x.UserId == dto.UserId);

        if (existingReaction != null)
        {
            existingReaction.ReactionType = parsedReactionType;
            _context.SaveChanges();

            response.Data = existingReaction;
            return Ok(response);
        }

        var reaction = new Reaction
        {
            DiscussionId = dto.DiscussionId,
            UserId = dto.UserId,
            ReactionType = parsedReactionType
        };

        _context.Set<Reaction>().Add(reaction);
        _context.SaveChanges();

        response.Data = reaction;
        return Created("", response);
    }

    [HttpGet("discussion/{discussionId}")]
    public IActionResult GetByDiscussion(int discussionId)
    {
        var response = new Response();

        var reactions = _context.Set<Reaction>()
            .Include(x => x.User)
            .Where(x => x.DiscussionId == discussionId)
            .Select(x => new ReactionGetDto
            {
                Id = x.Id,
                DiscussionId = x.DiscussionId,
                UserId = x.UserId,
                UserName = x.User.UserName,
                ReactionType = x.ReactionType.ToString()
            })
            .ToList();

        response.Data = reactions;
        return Ok(response);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var response = new Response();

        var reaction = _context.Set<Reaction>().FirstOrDefault(x => x.Id == id);
        if (reaction == null)
        {
            response.AddError("id", "Reaction not found.");
            return NotFound(response);
        }

        _context.Set<Reaction>().Remove(reaction);
        _context.SaveChanges();

        response.Data = reaction;
        return Ok(response);
    }
}
