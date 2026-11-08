using System;
using System.Linq;
using LearningStarter.Common;
using LearningStarter.Data;
using LearningStarter.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Diagnostics;

namespace LearningStarter.Controllers
{
    [ApiController]
    [Route("api/discussionsettings")]
    public class DiscussionSettingsController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public DiscussionSettingsController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        // Get all discussion setting 
        [HttpGet]
        public IActionResult GetAll()
        {
            var response = new Response();
            var settings = _dataContext
                .Set<DiscussionSettings>()
                .Select(discussionSettings => new DiscussionSettingsGetDto
                {
                    Id = discussionSettings.Id,
                    DiscussionId = discussionSettings.DiscussionId,
                    Title = discussionSettings.Title,
                    MaxMembers = discussionSettings.MaxMembers,
                    Privacy = discussionSettings.Privacy
                })
                .ToList();

            response.Data = settings;

            return Ok(response);
        }

        // Get by one ID
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var setting = _dataContext
                .Set<DiscussionSettings>()
                .Where(s => s.Id == id)
                .Select(s => new DiscussionSettingsGetDto
                {
                    Id = s.Id,
                    DiscussionId = s.DiscussionId,
                    Title = s.Title,
                    MaxMembers = s.MaxMembers,
                    Privacy = s.Privacy
                })
                .FirstOrDefault();

            if (setting == null)
            {
                return NotFound($"No DiscussionSetting found with ID {id}");
            }

            return Ok(setting);
        }

        // Create a new setting 
        [HttpPost]
        public IActionResult Create(DiscussionSettingsCreateDto data)
        {
            var response = new Response();
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var discussion = _dataContext.Set<Discussion>().FirstOrDefault(x => x.Id == data.discussionId);
            if (discussion == null)
            {
                response.AddError("discussionId", "Discussion not found.");
                return BadRequest(response);
            }

            if (discussion.ParentId != null)
            {
                response.AddError("discussionId", "Discussion must be a head discussion.");
                return BadRequest(response);
            }
            if (!Enum.TryParse<PrivacyType>(data.Privacy, true, out var parsedPrivacy))
            {
                response.AddError("privacyType", "Invalid privacy type");
                return BadRequest(response);
            }


            var newSetting = new DiscussionSettings
            {
                DiscussionId = data.discussionId,
                Title = data.Title,
                MaxMembers = data.MaxMembers,
                Privacy = parsedPrivacy
            };

            _dataContext.DiscussionSettings.Add(newSetting);
            _dataContext.SaveChanges();

            var result = new DiscussionSettingsGetDto
            {
                Id = newSetting.Id,
                DiscussionId = newSetting.DiscussionId,
                Title = newSetting.Title,
                MaxMembers = newSetting.MaxMembers,
                Privacy = newSetting.Privacy
            };

            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // Update an existing setting 
        [HttpPut("{id}")]
        public IActionResult Update(int id,[FromBody] DiscussionSettingsUpdateDto data)
        {
            var existing = _dataContext.Set<DiscussionSettings>().FirstOrDefault(s => s.Id == id);

            if (existing == null)
            {
                return NotFound($"No DiscussionSetting found with ID {id}");
            }

            existing.Title = data.Title;
            existing.MaxMembers = data.MaxMembers;
            existing.Privacy = data.Privacy;

            _dataContext.SaveChanges();

            var result = new DiscussionSettingsGetDto
            {
                Id = existing.Id,
                DiscussionId = existing.DiscussionId,
                Title = existing.Title,
                MaxMembers = existing?.MaxMembers,
                Privacy = existing.Privacy
            };

            return Ok(result);
        }

        // To delete a setting 
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var setting = _dataContext.DiscussionSettings.FirstOrDefault(s => s.Id == id);

            if (setting == null)
            {
                return NotFound($"No DiscussionSetting found with ID {id}");
            }

            _dataContext.DiscussionSettings.Remove(setting);
            _dataContext.SaveChanges();

            return NoContent();
        }
    }
}
