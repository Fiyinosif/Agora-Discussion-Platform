using System;
using LearningStarter.Data;
using LearningStarter.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Response = LearningStarter.Common.Response;

namespace LearningStarter.Controllers;

[ApiController]
[Route("api/discussions")]
public class DiscussionsController : ControllerBase
{
    private readonly DataContext _dataContext;

    public DiscussionsController(DataContext dataContext)
    {
        _dataContext = dataContext;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var response = new Response();

        var data = _dataContext
            .Set<Discussion>()
            .Select(discussion => new DiscussionGetDto
            {
                Id = discussion.Id,
                Body = discussion.Body,
                CreatedByUserId = discussion.CreatedByUserId,
                Owner = new UserGetDto
                {
                    Id = discussion.Owner.Id,
                    FirstName = discussion.Owner.FirstName,
                    LastName = discussion.Owner.LastName,
                    UserName = discussion.Owner.UserName,
                },
                ParentId = discussion.ParentId,
                Members = discussion.Members.Select(x => new DiscussionUsersGetDto
                {
                    Id = x.User.Id,
                    FirstName = x.User.FirstName,
                    LastName = x.User.LastName,
                    UserName = x.User.UserName,
                    Role = x.Role,
                    JoinedAt = x.JoinedAt,
                }).ToList(),
                Tags = discussion.Tags.Select(x => new DiscussionTagsGetDto{
                Id = x.Id,
                Name = x.Tag.Name
            }).ToList(),
                Reactions = discussion.Reactions.Select((x => new ReactionGetDto
                {
                    Id = x.Id,
                    DiscussionId = x.DiscussionId,
                    UserId = x.UserId,
                    ReactionType = x.ReactionType.ToString()
                })).ToList(),
                BannedUsers = discussion.BannedUsers.Select(x => new BannedUserGetDto{
                    Id = x.Id,
                    UserId = x.UserId,
                    userName = x.User.UserName,
                    Reason = x.Reason,
                    BannedByUserId = x.BannedByUserId,
                    BannedByUserName = x.BannedByUser.UserName,
                    DiscussionId = x.DiscussionId,
                    IsPermanent = x.IsPermanent,
                    IsActive = x.IsActive,
                    ExpirationDate = x.ExpirationDate,
                    DateBanned = x.DateBanned
            }).ToList(),
                CreatedAt = discussion.CreatedAt,

            })
            .ToList();

        response.Data = data;
        return Ok(response);
    }
    [HttpGet("{discussionId}/members")]
    public IActionResult GetAllMembers(int discussionId)
    {
        var response = new Response();

        var data = _dataContext.Set<DiscussionUsers>()
            .Where(x => x.DiscussionId == discussionId)  
            .Select(x => new DiscussionUsersGetDto
            {
                Id = x.UserId,
                FirstName = x.User.FirstName,
                LastName = x.User.LastName,
                UserName = x.User.UserName,
                Role = x.Role,
                JoinedAt = x.JoinedAt
            })
            .ToList();

        response.Data = data;
        return Ok(response);
    }
    
    [HttpGet("{discussionId}/bannedusers")]
    public IActionResult GetAllBannedUsers(int discussionId)
    {
        var response = new Response();

        var data = _dataContext.Set<BannedUsers>()
            .Where(x => x.DiscussionId == discussionId)  
            .Select(x => new BannedUserGetDto
            {
                Id = x.Id,
                UserId = x.UserId,
                userName = x.User.UserName,
                Reason = x.Reason,
                BannedByUserId = x.BannedByUserId,
                BannedByUserName = x.BannedByUser.UserName,
                DiscussionId = x.DiscussionId,
                IsPermanent = x.IsPermanent,
                IsActive = x.IsActive,
                ExpirationDate = x.ExpirationDate,
                DateBanned = x.DateBanned
                
            })
            .ToList();

        response.Data = data;
        return Ok(response);
    }
    
    [HttpGet("{discussionId}/tags")]
    public IActionResult GetAllTags(int discussionId)
    {
        var response = new Response();

        var data = _dataContext.Set<DiscussionTags>()
            .Where(x => x.DiscussionId == discussionId)  
            .Select(x => new DiscussionTagsGetDto
            {
                Id = x.TagId,
                Name = x.Tag.Name
                
            })
            .ToList();

        response.Data = data;
        return Ok(response);
    }
    [HttpGet("{discussionId}/settings")]
    public IActionResult GetSettings(int discussionId)
    {
        var response = new Response();

        var data = _dataContext.Set<DiscussionSettings>()
            .Select(x => new DiscussionSettingsGetDto
            {
                Id = x.Id,
                DiscussionId = x.DiscussionId,
                Title = x.Title,
                MaxMembers = x.MaxMembers,
                Privacy = x.Privacy,
                
            }).FirstOrDefault(x => x.DiscussionId == discussionId);

        response.Data = data;
        return Ok(response);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var response = new Response();

        var data = _dataContext
            .Set<Discussion>()
            .Select(discussion => new DiscussionGetDto
            {
                Id = discussion.Id,
                Body = discussion.Body,
                CreatedByUserId = discussion.CreatedByUserId,
                Owner = new UserGetDto
                {
                    Id = discussion.Owner.Id,
                    FirstName = discussion.Owner.FirstName,
                    LastName = discussion.Owner.LastName,
                    UserName = discussion.Owner.UserName,
                },
                ParentId = discussion.ParentId,
                Members = discussion.Members.Select(x => new DiscussionUsersGetDto
                {
                    Id = x.User.Id,
                    FirstName = x.User.FirstName,
                    LastName = x.User.LastName,
                    UserName = x.User.UserName,
                    Role = x.Role
                }).ToList(),
                Tags = discussion.Tags.Select(x => new DiscussionTagsGetDto{
                    Id = x.Id,
                    Name = x.Tag.Name
                }).ToList(),
                Reactions = discussion.Reactions.Select((x => new ReactionGetDto
                {
                    Id = x.Id,
                    DiscussionId = x.DiscussionId,
                    UserId = x.UserId,
                    ReactionType = x.ReactionType.ToString()
                })).ToList(),
                BannedUsers = discussion.BannedUsers.Select(x => new BannedUserGetDto{
                    Id = x.Id,
                    UserId = x.UserId,
                    userName = x.User.UserName,
                    Reason = x.Reason,
                    BannedByUserId = x.BannedByUserId,
                    BannedByUserName = x.BannedByUser.UserName,
                    DiscussionId = x.DiscussionId,
                    IsPermanent = x.IsPermanent,
                    IsActive = x.IsActive,
                    ExpirationDate = x.ExpirationDate,
                    DateBanned = x.DateBanned
                }).ToList(),
                CreatedAt = discussion.CreatedAt,
            })
            .FirstOrDefault(discussion => discussion.Id == id);

        if (data == null)
        {
            response.AddError("id", "Discussion not found");
        }

        if (response.HasErrors)
        {
            return BadRequest(response);
        }

        response.Data = data;
        return Ok(response);
    }

    [HttpGet("{discussionId}/replies")]
    public IActionResult GetReplies(int discussionId)
    {
        var response = new Response();

        var replies = _dataContext.Set<Discussion>()
            .Where(discussion => discussion.ParentId == discussionId)
            .Select(discussion => new DiscussionGetDto
            {
                Id = discussion.Id,
                Body = discussion.Body,
                CreatedByUserId = discussion.CreatedByUserId,
                Owner = new UserGetDto
                {
                    Id = discussion.Owner.Id,
                    FirstName = discussion.Owner.FirstName,
                    LastName = discussion.Owner.LastName,
                    UserName = discussion.Owner.UserName,
                },
                Reactions = discussion.Reactions.Select((x => new ReactionGetDto
                {
                    Id = x.Id,
                    DiscussionId = x.DiscussionId,
                    UserId = x.UserId,
                    ReactionType = x.ReactionType.ToString()
                })).ToList(),
                ParentId = discussion.ParentId,
                CreatedAt = discussion.CreatedAt,
            })
            .ToList();

        response.Data = replies;
        return Ok(response);
    }
    


    [HttpPost]
    public IActionResult Create([FromBody] DiscussionCreateDto createDto)
    {
        var response = new Response();

        var discussionToCreate = new Discussion
        {
            Body = createDto.Body,
            CreatedByUserId = createDto.CreatedByUserId,
            ParentId = createDto.ParentId,
            CreatedAt = DateTime.Now
        };

        if (discussionToCreate.ParentId == 0)
        {
            discussionToCreate.ParentId = null;
        }

        _dataContext.Set<Discussion>().Add(discussionToCreate);
        _dataContext.SaveChanges();

        var discussionToReturn = new DiscussionGetDto
        {
            Id = discussionToCreate.Id,
            Body = discussionToCreate.Body,
            CreatedByUserId = discussionToCreate.CreatedByUserId,
            ParentId = discussionToCreate.ParentId,
            CreatedAt = discussionToCreate.CreatedAt
        };

        response.Data = discussionToReturn;
        return Created("", response);
    }

    [HttpPost("{discussionId}/members/{userId}")]
    public IActionResult AddMemberToDiscussion(int discussionId, int userId, [FromQuery] string role)
    {
        var response = new Response();

        var discussion = _dataContext.Set<Discussion>()
            .FirstOrDefault(discussion => discussion.Id == discussionId);
        if (discussion == null)
        {
            response.AddError("discussionId", "Discussion not found");
            return BadRequest(response);
        }

        if (discussion.ParentId != null)
        {
            response.AddError("discussionId", "Discussion cannot be a response");
            return BadRequest(response);
        }

        var member = _dataContext.Set<User>()
            .FirstOrDefault(user => user.Id == userId);
        if (member == null)
        {
            response.AddError("userId", "User not found");
            return BadRequest(response);
        }

        var alreadyMember = _dataContext.Set<DiscussionUsers>()
            .Any(x => x.DiscussionId == discussionId && x.UserId == userId);
        if (alreadyMember)
        {
            response.AddError("userId", "User is already a member of this discussion");
            return BadRequest(response);
        }
        
        if (!Enum.TryParse<DiscussionRole>(role, true, out var parsedrole))
        {
            response.AddError("role", "Invalid role");
            return BadRequest(response);
        }

        var DiscussionUser = new DiscussionUsers
        {
            User = member,
            Discussion = discussion,
            Role = parsedrole,
            JoinedAt = DateTime.Now
        };

        _dataContext.Set<DiscussionUsers>().Add(DiscussionUser);
        _dataContext.SaveChanges();

        response.Data = new DiscussionGetDto
        {
            Id = discussion.Id,
            Body = discussion.Body,
            CreatedByUserId = discussion.CreatedByUserId,
            ParentId = discussion.ParentId,
            Members = discussion.Members.Select(x => new DiscussionUsersGetDto
            {
                Id = x.User.Id,
                FirstName = x.User.FirstName,
                LastName = x.User.LastName,
                UserName = x.User.UserName,
                Role = x.Role
            }).ToList(),
            CreatedAt = discussion.CreatedAt,
        };

        return Ok(response);
    }

    [HttpPost("{discussionId}/tags/{tagId}")]
    public IActionResult AddTagToDiscussion(int discussionId, int tagId)
    {
        var response = new Response();

        var discussion = _dataContext.Set<Discussion>()
            .FirstOrDefault(discussion => discussion.Id == discussionId);
        if (discussion == null)
        {
            response.AddError("discussionId", "Discussion not found");
            return BadRequest(response);
        }

        if (discussion.ParentId != null)
        {
            response.AddError("discussionId", "Discussion cannot be a response");
            return BadRequest(response);
        }

        var tag = _dataContext.Set<Tag>()
            .FirstOrDefault(tag => tag.Id == tagId);
        if (tag == null)
        {
            response.AddError("tagId", "Tag not found");
            return BadRequest(response);
        }

        var alreadyAssigned = _dataContext.Set<DiscussionTags>()
            .Any(x => x.DiscussionId == discussionId && x.TagId == tagId);
        if (alreadyAssigned)
        {
            response.AddError("tagId", "Tag is already assigned to this discussion");
            return BadRequest(response);
        }

        var DiscussionTag = new DiscussionTags
        {
            Tag = tag,
            Discussion = discussion,
        };

        _dataContext.Set<DiscussionTags>().Add(DiscussionTag);
        _dataContext.SaveChanges();

        response.Data = new DiscussionGetDto
        {
            Id = discussion.Id,
            Body = discussion.Body,
            CreatedByUserId = discussion.CreatedByUserId,
            ParentId = discussion.ParentId,
            Tags = discussion.Tags.Select(x => new DiscussionTagsGetDto
            {
                Id = x.Tag.Id,
                Name = x.Tag.Name
            }).ToList(),
            CreatedAt = discussion.CreatedAt,
        };

        return Ok(response);
    }


    [HttpPut("{id}")]
    public IActionResult Update([FromBody] DiscussionUpdateDto updateDto, int id)
    {
        var response = new Response();
        var discussionToUpdate = _dataContext.Set<Discussion>()
            .FirstOrDefault(discussion => discussion.Id == id);

        if (discussionToUpdate == null)
        {
            response.AddError("id", "Discussion not found");
        }

        if (response.HasErrors)
        {
            return BadRequest(response);
        }

        discussionToUpdate.Body = updateDto.Body;

        _dataContext.SaveChanges();

        var discussionToReturn = new Discussion
        {
            Id = discussionToUpdate.Id,
            Body = discussionToUpdate.Body,
            Members = discussionToUpdate.Members

        };

        response.Data = discussionToReturn;
        return Ok(response);
    }

    [HttpPut("{discussionId}/members/{userId}")]
    public IActionResult UpdateMemberRole(int discussionId, int userId, [FromQuery] DiscussionRole role)
    {
        var response = new Response();

        var discussion = _dataContext.Set<Discussion>()
            .FirstOrDefault(d => d.Id == discussionId);
        if (discussion == null)
            return BadRequest("Discussion not found");

        var member = _dataContext.Set<DiscussionUsers>()
            .FirstOrDefault(u => u.UserId == userId && u.DiscussionId == discussionId);
        if (member == null)
            return BadRequest("User is not a member");

        if (member.Role == DiscussionRole.Owner)
            return BadRequest("Cannot modify the owner");

        
        member.Role = role;

        _dataContext.SaveChanges();

        response.Data = new DiscussionUsersGetDto
        {
            Id = member.Id,
            FirstName = member.User.FirstName,
            LastName = member.User.LastName,
            UserName = member.User.UserName,
            Role = member.Role
        };

        return Ok(response);
    }
    
    

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var response = new Response();

        var discussionToDelete = _dataContext.Set<Discussion>()
            .FirstOrDefault(discussion => discussion.Id == id);

        if (discussionToDelete == null)
        {
            response.AddError("id", "Discussion not found");
        }

        if (response.HasErrors)
        {
            return BadRequest(response);
        }

        _dataContext.Set<Discussion>().Remove(discussionToDelete);
        _dataContext.SaveChanges();

        response.Data = discussionToDelete;
        return Ok(response);
    }


    [HttpDelete("{discussionId}/members/{userId}")]
    public IActionResult DeleteMemberFromDiscussion(int discussionId, int userId)
    {
        var response = new Response();

        var memberToDelete = _dataContext.Set<DiscussionUsers>()
            .FirstOrDefault(du => du.UserId == userId && du.DiscussionId == discussionId);
        
        if (memberToDelete == null)
        {
            response.AddError("userid", "User not found");
        }

        if (response.HasErrors)
        {
            return BadRequest(response);
        }
        
        
        _dataContext.Set<DiscussionUsers>().Remove(memberToDelete);
        _dataContext.SaveChanges();



        response.Data = memberToDelete;
        return Ok(response);
    }
    [HttpDelete("{discussionId}/tags/{tagId}")]
    public IActionResult DeleteTagFromDiscussion(int discussionId, int tagId)
    {
        var response = new Response();

        var tagToDelete = _dataContext.Set<DiscussionTags>()
            .FirstOrDefault(dt => dt.TagId == tagId && dt.DiscussionId == discussionId);
        
        if (tagToDelete == null)
        {
            response.AddError("tagId", "Tag not found");
        }

        if (response.HasErrors)
        {
            return BadRequest(response);
        }
        
        
        _dataContext.Set<DiscussionTags>().Remove(tagToDelete);
        _dataContext.SaveChanges();



        response.Data = tagToDelete;
        return Ok(response);
    }
    [HttpDelete("{discussionId}/bannedusers/{userId}")]
    public IActionResult DeleteBannedUser(int discussionId, int userId)
    {
        var response = new Response();

        var banToDelete = _dataContext.Set<BannedUsers>()
            .FirstOrDefault(bu => bu.UserId == userId && bu.DiscussionId == discussionId);
        
        if (banToDelete == null)
        {
            response.AddError("userId", "user not found");
        }

        if (response.HasErrors)
        {
            return BadRequest(response);
        }
        
        
        _dataContext.Set<BannedUsers>().Remove(banToDelete);
        _dataContext.SaveChanges();



        response.Data = banToDelete;
        return Ok(response);
    }
}