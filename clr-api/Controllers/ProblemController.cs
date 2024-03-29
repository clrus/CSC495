﻿using clr_api.Models;
using clr_api.Services;
using Microsoft.AspNetCore.Mvc;
using ThirdParty.Json.LitJson;

namespace clr_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProblemController(ProblemService problemService, UsersService usersService, ClassService classService, AiService aiService)
    : ControllerBase
{

    public class ProblemFromScratch(Problem problem, string userId, string offeringId)
    {
        [JsonProperty] public Problem Problem { get; set; } = problem;
        [JsonProperty] public string UserId { get; set; } = userId;
        [JsonProperty] public string OfferingId { get; set; } = offeringId;
    }

    public class ProblemFromClrs(int chapter, int problem, string solution, string userId, string offeringId)
    {
        [JsonProperty] public int Chapter { get; set; } = chapter;
        [JsonProperty] public int Problem { get; set; } = problem;
        [JsonProperty] public string Solution { get; set; } = solution;
        [JsonProperty] public string UserId { get; set; } = userId;
        [JsonProperty] public string OfferingId { get; set; } = offeringId;
    }

    public class ProblemUpdate(string newSolution, string userId)
    {
        [JsonProperty] public string NewSolution { get; set; } = newSolution;
        [JsonProperty] public string UserId { get; set; } = userId;
    }
        
    [HttpGet("{uuid}")]
    public async Task<ActionResult<Problem>> Get(string uuid)
    {
        var problem = await problemService.GetAsync(uuid);
        if (problem is null)
        {
            return NotFound();
        }
    
        return problem;
    }

    [HttpGet("history/{uuid}")]
    public async Task<ActionResult<List<Problem>?>> GetEditHistory(string uuid) =>
        await problemService.GetByUuid(uuid);

    [HttpGet("class/{oid:length(24)}")]
    public async Task<ActionResult<List<Problem>>> GetByClass(string oid, ProblemStatus? status) => 
        await problemService.GetByClassAsync(oid, status);

    [HttpGet("latest/{uuid}")]
    public async Task<ActionResult<Problem?>> GetLatest(string uuid) =>
        await problemService.GetLatest(uuid);

    [HttpGet("authors/{uuid}")]
    public async Task<ActionResult<List<String>?>> GetAuthors(string uuid) =>
        await problemService.GetAuthors(uuid);

    [HttpPost]
    public async Task<ActionResult<Problem>> Post([FromBody] ProblemFromScratch problemFromScratch)
    {
        var user = await usersService.GetAsync(problemFromScratch.UserId);
        var offering = await classService.GetAsync(problemFromScratch.OfferingId);
        if (user is null || offering is null)
        {
            return NotFound();
        }

        var aiReview = await aiService.GetAiReview(problemFromScratch.Problem.Solution);
        problemFromScratch.Problem.AiReview = aiReview;
        await problemService.CreateAsync(problemFromScratch.Problem,
            user.Username,
            problemFromScratch.OfferingId);
        return CreatedAtAction(nameof(Get), new { uuid = problemFromScratch.Problem.Uuid }, problemFromScratch.Problem);
    }

    [HttpPost("clrs")]
    public async Task<ActionResult<Problem>> Post([FromBody] ProblemFromClrs problemFromClrs)
    {
        var user = await usersService.GetAsync(problemFromClrs.UserId);
        var offering = await classService.GetAsync(problemFromClrs.OfferingId);
        if (user is null || offering is null)
        {
            return NotFound();
        }

        var aiReview = await aiService.GetAiReview(problemFromClrs.Solution);
        await problemService.CreateFromClrsAsync(problemFromClrs.Chapter, problemFromClrs.Problem,
            problemFromClrs.Solution, user.Username, problemFromClrs.OfferingId, aiReview);
        return Ok();
    }

    [HttpPatch("status/{uuid}/{status}")]
    public async Task<IActionResult> Patch(string uuid, ProblemStatus status)
    {
        await problemService.SetStatus(uuid, status);
        return Ok();
    }

    [HttpPatch("{uuid}")]
    public async Task<IActionResult> Patch(string uuid, [FromBody] ProblemUpdate update)
    {
        var user = await usersService.GetAsync(update.UserId);
        if (user is null)
        {
            return NotFound();
        }

        await problemService.EditSolution(uuid, update.NewSolution, user.Username);
        return Ok();
    }

    [HttpDelete("{uuid}")]
    public async Task Delete(string uuid) =>
        await problemService.RemoveAsync(uuid);
}