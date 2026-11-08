using System;
using System.Linq;
using LearningStarter.Common;
using LearningStarter.Data;
using LearningStarter.Entities;
using Microsoft.AspNetCore.Mvc;

namespace LearningStarter.Controllers;

[ApiController]
[Route("api/invites")]
public class InvitesController : ControllerBase
{
    private readonly DataContext _context;

    public InvitesController(DataContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var response = new Response();

        var data = _context.Set<Invite>()
            .Select(i => new InviteGetDto
            {
                Id = i.Id,
                DiscussionId = i.DiscussionId,
                SenderUserId = i.SenderUserId,
                SenderUserName = i.SenderUser.UserName,
                RecipientUserId = i.RecipientUserId,
                RecipientUserName = i.RecipientUser.UserName,
                Message = i.Message,
                Status = i.Status.ToString(),
                CreatedAt = i.CreatedAt,
                RespondedAt = i.RespondedAt
            })
            .ToList();

        response.Data = data;
        return Ok(response);
    }
    
    [HttpGet("user/{userId}")]
    public IActionResult GetForUser(int userId)
    {
        var response = new Response();

        var data = _context.Set<Invite>()
            .Where(i => i.RecipientUserId == userId)
            .Select(i => new InviteGetDto
            {
                Id = i.Id,
                DiscussionId = i.DiscussionId,
                SenderUserId = i.SenderUserId,
                SenderUserName = i.SenderUser.UserName,
                RecipientUserId = i.RecipientUserId,
                RecipientUserName = i.RecipientUser.UserName,
                Message = i.Message,
                Status = i.Status.ToString(),
                CreatedAt = i.CreatedAt,
                RespondedAt = i.RespondedAt
            })
            .ToList();

        response.Data = data;
        return Ok(response);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var response = new Response();

        var invite = _context.Set<Invite>()
            .Where(i => i.Id == id)
            .Select(i => new InviteGetDto
            {
                Id = i.Id,
                DiscussionId = i.DiscussionId,
                SenderUserId = i.SenderUserId,
                SenderUserName = i.SenderUser.UserName,
                RecipientUserId = i.RecipientUserId,
                RecipientUserName = i.RecipientUser.UserName,
                Message = i.Message,
                Status = i.Status.ToString(),
                CreatedAt = i.CreatedAt,
                RespondedAt = i.RespondedAt
            })
            .FirstOrDefault();

        if (invite == null)
        {
            response.AddError("id", "Invite not found.");
            return NotFound(response);
        }

        response.Data = invite;
        return Ok(response);
    }

    [HttpGet("discussion/{discussionId}")]
    public IActionResult GetByDiscussion(int discussionId)
    {
        var response = new Response();

        var data = _context.Set<Invite>()
            .Where(i => i.DiscussionId == discussionId)
            .Select(i => new InviteGetDto
            {
                Id = i.Id,
                DiscussionId = i.DiscussionId,
                SenderUserId = i.SenderUserId,
                SenderUserName = i.SenderUser.UserName,
                RecipientUserId = i.RecipientUserId,
                RecipientUserName = i.RecipientUser.UserName,
                Message = i.Message,
                Status = i.Status.ToString(),
                CreatedAt = i.CreatedAt,
                RespondedAt = i.RespondedAt
            })
            .ToList();

        response.Data = data;
        return Ok(response);
    }

    [HttpPost]
    public IActionResult Create([FromBody] InviteCreateDto dto)
    {
        var response = new Response();

        var discussion = _context.Set<Discussion>().FirstOrDefault(x => x.Id == dto.DiscussionId);
        if (discussion == null)
        {
            response.AddError("discussionId", "Discussion not found.");
        }

        var sender = _context.Users.FirstOrDefault(x => x.Id == dto.SenderUserId);
        if (sender == null)
        {
            response.AddError("senderUserId", "Sender user not found.");
        }

        var recipient = _context.Users.FirstOrDefault(x => x.Id == dto.RecipientUserId);
        if (recipient == null)
        {
            response.AddError("recipientUserId", "Recipient user not found.");
        }

        if (dto.SenderUserId == dto.RecipientUserId)
        {
            response.AddError("recipientUserId", "Sender and recipient cannot be the same.");
        }

        if (!Enum.TryParse<InviteStatus>(dto.Status, true, out var parsedStatus))
        {
            response.AddError("status", "Invalid status. Use Pending, Accepted, or Declined.");
        }

        // prevent duplicate pending invite to same recipient for same discussion
        var duplicatePending = _context.Set<Invite>()
            .Any(i => i.DiscussionId == dto.DiscussionId
                   && i.RecipientUserId == dto.RecipientUserId
                   && i.Status == InviteStatus.Pending);
        if (duplicatePending)
        {
            response.AddError("invite", "A pending invite already exists for this user and discussion.");
        }

        if (response.HasErrors)
        {
            return BadRequest(response);
        }

        var invite = new Invite
        {
            DiscussionId = dto.DiscussionId,
            SenderUserId = dto.SenderUserId,
            RecipientUserId = dto.RecipientUserId,
            Message = dto.Message,
            Status = parsedStatus,
            CreatedAt = DateTime.Now
        };

        _context.Set<Invite>().Add(invite);
        _context.SaveChanges();

        var result = new InviteGetDto
        {
            Id = invite.Id,
            DiscussionId = invite.DiscussionId,
            SenderUserId = invite.SenderUserId,
            SenderUserName = sender.UserName,
            RecipientUserId = invite.RecipientUserId,
            RecipientUserName = recipient.UserName,
            Message = invite.Message,
            Status = invite.Status.ToString(),
            CreatedAt = invite.CreatedAt,
            RespondedAt = invite.RespondedAt
        };

        response.Data = result;
        return Created("", response);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateStatus(int id, [FromBody] InviteUpdateDto dto)
    {
        var response = new Response();

        var invite = _context.Set<Invite>().FirstOrDefault(x => x.Id == id);
        if (invite == null)
        {
            response.AddError("id", "Invite not found.");
            return NotFound(response);
        }

        if (!Enum.TryParse<InviteStatus>(dto.Status, true, out var parsedStatus))
        {
            response.AddError("status", "Invalid status. Use Pending, Accepted, or Declined.");
            return BadRequest(response);
        }

        invite.Status = parsedStatus;
        invite.RespondedAt = parsedStatus == InviteStatus.Pending ? (DateTime?)null : DateTime.Now;

        _context.SaveChanges();

        response.Data = new InviteGetDto
        {
            Id = invite.Id,
            DiscussionId = invite.DiscussionId,
            SenderUserId = invite.SenderUserId,
            SenderUserName = invite.SenderUser?.UserName,
            RecipientUserId = invite.RecipientUserId,
            RecipientUserName = invite.RecipientUser?.UserName,
            Message = invite.Message,
            Status = invite.Status.ToString(),
            CreatedAt = invite.CreatedAt,
            RespondedAt = invite.RespondedAt
        };

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var response = new Response();

        var invite = _context.Set<Invite>().FirstOrDefault(x => x.Id == id);
        if (invite == null)
        {
            response.AddError("id", "Invite not found.");
            return NotFound(response);
        }

        _context.Set<Invite>().Remove(invite);
        _context.SaveChanges();

        response.Data = invite;
        return Ok(response);
    }
}
