using System.Linq;
using LearningStarter.Common;
using LearningStarter.Data;
using LearningStarter.Entities;
using Microsoft.AspNetCore.Mvc;

namespace LearningStarter.Controllers;



[ApiController]
[Route("api/tags")]
public class TagsController : ControllerBase
{
    private readonly DataContext _dataContext;

    public TagsController(DataContext dataContext)
    {
        _dataContext = dataContext;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var response = new Response();

        var data = _dataContext
            .Set<Tag>()
            .Select(Tag => new TagGetDto
            {
                Id = Tag.Id,
                Name = Tag.Name
            }).ToList();
        ;

        response.Data = data;
        return Ok(response);

    }

    [HttpPost]
    public IActionResult Create([FromBody] TagCreateDto createDto)
    {
        var response = new Response();

        var tagToCreate = new Tag
        {
            Name = createDto.Name,
        };
        var alreadyExist = _dataContext.Set<Tag>()
            .Any(x => x.Name.ToLower() == tagToCreate.Name.ToLower());
        if (alreadyExist)
        {
            response.AddError("TagName", "This Tag already exists");
            return BadRequest(response);
        }
        _dataContext.Set<Tag>().Add(tagToCreate);
        _dataContext.SaveChanges();
            
            var tagToReturn = new TagGetDto
            {
                Id = tagToCreate.Id,
                Name = tagToCreate.Name
            };

            response.Data = tagToReturn;
            return Ok(response);
    }
    [HttpDelete]
    public IActionResult Delete(int id)
    {
        var response = new Response();

        var tagToDelete = _dataContext.Set<Tag>()
            .FirstOrDefault(tag => tag.Id == id);

        if (tagToDelete == null)
        {
            response.AddError("id", "Tag not found");
        }

        if (response.HasErrors)
        {
            return BadRequest(response);
        }

        _dataContext.Set<Tag>().Remove(tagToDelete);
        _dataContext.SaveChanges();

        response.Data = tagToDelete;
        return Ok(response);
    }

}