using System;
using System.Linq;
using LearningStarter.Common;
using LearningStarter.Data;
using LearningStarter.Entities;
using Microsoft.AspNetCore.Mvc;

namespace LearningStarter.Controllers
{
    [ApiController]
    [Route("api/BannedUsers")]
    public class BannedUsersController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public BannedUsersController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }
        
        [HttpGet]
        public IActionResult GetAll()
        {
            var response = new Response();
            var users = _dataContext
                .Set<BannedUsers>()
                .Select(b => new BannedUserGetDto
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    userName = b.User.UserName,
                    Reason = b.Reason,
                    BannedByUserId = b.BannedByUserId,
                    BannedByUserName = b.BannedByUser.UserName,
                    DiscussionId = b.DiscussionId,
                    DateBanned = b.DateBanned,
                    IsPermanent = b.IsPermanent,
                    ExpirationDate = b.ExpirationDate,
                    IsActive = b.IsActive
                })
                .ToList();

            response.Data = users;
            return Ok(response);
        }

        
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var response = new Response();
            var bannedUser = _dataContext.Set<BannedUsers>().FirstOrDefault(b => b.Id == id);

            if (bannedUser == null)
                return NotFound($"No banned user found with ID {id}");

            var user = new BannedUserGetDto
            {
                Id = bannedUser.Id,
                UserId = bannedUser.UserId,
                userName = bannedUser.User.UserName,
                Reason = bannedUser.Reason,
                BannedByUserId = bannedUser.BannedByUserId,
                BannedByUserName = bannedUser.BannedByUser.UserName,
                DiscussionId = bannedUser.DiscussionId,
                DateBanned = bannedUser.DateBanned,
                IsPermanent = bannedUser.IsPermanent,
                ExpirationDate = bannedUser.ExpirationDate,
                IsActive = bannedUser.IsActive
            };

            response.Data = user;
            return Ok(response);
        }

       
        [HttpPost]
        public IActionResult Create([FromBody] BannedUserCreateDto createDto)
        {
            var response = new Response();

            if (createDto == null)
                return BadRequest("Invalid user data.");

            var bannedUserToCreate = new BannedUsers
            {
                UserId = createDto.UserId,
                User = createDto.User,
                Reason = createDto.Reason,
                BannedByUserId = createDto.BannedByUserId,
                BannedByUser = createDto.BannedByUser,
                DiscussionId = createDto.DiscussionId,
                IsPermanent = createDto.IsPermanent,
                Duration = createDto.Duration,
                DateBanned = DateTime.UtcNow,
                ExpirationDate = createDto.IsPermanent
                    ? null
                    : DateTime.UtcNow.Add(createDto.Duration ?? TimeSpan.Zero),
                IsActive = true
            };

            if (bannedUserToCreate.UserId == bannedUserToCreate.BannedByUserId)
            {
                response.AddError("userId", "You cannot ban yourself");
                return BadRequest(response);
            }

            _dataContext.Set<BannedUsers>().Add(bannedUserToCreate);
            _dataContext.SaveChanges();

            var user = new BannedUserGetDto
            {
                Id = bannedUserToCreate.Id,
                UserId = bannedUserToCreate.UserId,
                Reason = bannedUserToCreate.Reason,
                BannedByUserId = bannedUserToCreate.BannedByUserId,
                DiscussionId = bannedUserToCreate.DiscussionId,
                DateBanned = bannedUserToCreate.DateBanned,
                IsPermanent = bannedUserToCreate.IsPermanent,
                ExpirationDate = bannedUserToCreate.ExpirationDate,
                IsActive = bannedUserToCreate.IsActive
            };

            response.Data = user;
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, response);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] BannedUserUpdateDto updateDto)
        {
            var response = new Response();

            var bannedUser = _dataContext.Set<BannedUsers>().FirstOrDefault(b => b.Id == id);
            if (bannedUser == null)
                return NotFound($"No banned user found with ID {id}");

            bannedUser.Reason = updateDto.Reason;
            bannedUser.IsPermanent = updateDto.IsPermanent;
            bannedUser.Duration = updateDto.Duration;
            bannedUser.ExpirationDate = updateDto.IsPermanent
                ? null
                : bannedUser.DateBanned.Add(updateDto.Duration ?? TimeSpan.Zero);

            _dataContext.SaveChanges();

            response.Data = bannedUser;
            return Ok(response);
        }

   
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var response = new Response();
            var bannedUser = _dataContext.Set<BannedUsers>().FirstOrDefault(b => b.Id == id);

            if (bannedUser == null)
                return NotFound($"No banned user found with ID {id}");

            _dataContext.Set<BannedUsers>().Remove(bannedUser);
            _dataContext.SaveChanges();

            response.Data = bannedUser;
            return Ok(response);
        }
    }
}
