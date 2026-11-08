using LearningStarter.Common;
using LearningStarter.Data;
using LearningStarter.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; 
using System.Linq;                


namespace LearningStarter.Controllers
{
    [ApiController]
    [Route("api/followers")]
    public class FollowersController : ControllerBase
    {
        private readonly DataContext _context;

        public FollowersController(DataContext context)
        {
            _context = context;
        }

        // Follow someone
        [HttpPost]
        public async Task<IActionResult> Follow([FromBody] FollowerCreateDto dto)
        {
            var response = new Response();

            if (dto.FollowerId == dto.FollowingId)
            {
                response.AddError("user", "You cannot follow yourself.");
                return BadRequest(response);
            }

            var alreadyFollowing = await _context.Followers
                .AnyAsync(f => f.FollowerId == dto.FollowerId && f.FollowingId == dto.FollowingId);

            if (alreadyFollowing)
            {
                response.AddError("user", "You are already following this user.");
                return BadRequest(response);
            }

            var follower = new Follower
            {
                FollowerId = dto.FollowerId,
                FollowingId = dto.FollowingId
            };

            _context.Followers.Add(follower);
            await _context.SaveChangesAsync();

            response.Data = follower;
            return Created("", response);
        }

        // Get all followers of a user
        [HttpGet("{userId}/followers")]
        public async Task<IActionResult> GetFollowers(int userId)
        {
            var response = new Response();

            var followers = await _context.Followers
                .Where(f => f.FollowingId == userId)
                .Include(f => f.FollowerUser)
                .Select(f => new FollowerGetDto
                {
                    Id = f.Id,
                    FollowerId = f.FollowerId,
                    FollowerUserName = f.FollowerUser.UserName,
                    FollowingId = f.FollowingId,
                    FollowingUserName = f.FollowingUser.UserName,
                    FollowedAt = f.FollowedAt
                })
                .ToListAsync();

            response.Data = followers;
            return Ok(response);
        }

        // Get all people a user is following
        [HttpGet("{userId}/following")]
        public async Task<IActionResult> GetFollowing(int userId)
        {
            var response = new Response();

            var following = await _context.Followers
                .Where(f => f.FollowerId == userId)
                .Include(f => f.FollowingUser)
                .Select(f => new FollowerGetDto
                {
                    Id = f.Id,
                    FollowerId = f.FollowerId,
                    FollowerUserName = f.FollowerUser.UserName,
                    FollowingId = f.FollowingId,
                    FollowingUserName = f.FollowingUser.UserName,
                    FollowedAt = f.FollowedAt
                })
                .ToListAsync();

            response.Data = following;
            return Ok(response);
        }

        // Unfollow
        [HttpDelete("{followerId}/{followingId}")]
        public async Task<IActionResult> Unfollow(int followerId, int followingId)
        {
            var response = new Response();

            var follow = await _context.Followers
                .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);

            if (follow == null)
            {
                response.AddError("follow", "Follow relationship not found.");
                return NotFound(response);
            }

            _context.Followers.Remove(follow);
            await _context.SaveChangesAsync();

            response.Data = follow;
            return Ok(response);
        }
    }
}
