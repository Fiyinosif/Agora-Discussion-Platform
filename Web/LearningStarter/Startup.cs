using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IdentityModel;
using LearningStarter.Data;
using LearningStarter.Entities;
using LearningStarter.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace LearningStarter;

public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    private IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddCors();
        services.AddControllers();

        services.AddHsts(options =>
        {
            options.MaxAge = TimeSpan.MaxValue;
            options.Preload = true;
            options.IncludeSubDomains = true;
        });

        services.AddDbContext<DataContext>(options =>
        {
            options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));
        });

        services.AddIdentity<User, Role>(
                options =>
                {
                    options.SignIn.RequireConfirmedAccount = false;
                    options.Password.RequireNonAlphanumeric = false;
                    options.Password.RequireLowercase = false;
                    options.Password.RequireUppercase = false;
                    options.Password.RequireDigit = false;
                    options.Password.RequiredLength = 8;
                    options.ClaimsIdentity.UserIdClaimType = JwtClaimTypes.Subject;
                    options.ClaimsIdentity.UserNameClaimType = JwtClaimTypes.Name;
                    options.ClaimsIdentity.RoleClaimType = JwtClaimTypes.Role;
                })
            .AddEntityFrameworkStores<DataContext>();

        services.AddMvc();

        services
            .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };
            });

        services.AddAuthorization();

        // Swagger
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Learning Starter Server",
                Version = "v1",
                Description = "Description for the API goes here.",
            });

            c.CustomOperationIds(apiDesc => apiDesc.TryGetMethodInfo(out var methodInfo) ? methodInfo.Name : null);
            c.MapType(typeof(IFormFile), () => new OpenApiSchema { Type = "file", Format = "binary" });
        });

        services.AddSpaStaticFiles(config =>
        {
            config.RootPath = "learning-starter-web/build";
        });

        services.AddHttpContextAccessor();

        // configure DI for application services
        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env, DataContext dataContext)
    {
        dataContext.Database.EnsureDeleted();
        dataContext.Database.EnsureCreated();

        app.UseHsts();
        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseSpaStaticFiles();
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();

        // global cors policy
        app.UseCors(x => x
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());

        // Enable middleware to serve generated Swagger as a JSON endpoint.
        app.UseSwagger(options =>
        {
            options.SerializeAsV2 = true;
        });

        // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.),
        // specifying the Swagger JSON endpoint.
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Learning Starter Server API V1");
        });

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(x => x.MapControllers());

        app.UseSpa(spa =>
        {
            spa.Options.SourcePath = "learning-starter-web";
            if (env.IsDevelopment())
            {
                spa.UseProxyToSpaDevelopmentServer("http://localhost:3001");
            }
        });

        using var scope = app.ApplicationServices.CreateScope();
        var userManager = scope.ServiceProvider.GetService<UserManager<User>>();
        var roleManager = scope.ServiceProvider.GetService<RoleManager<Role>>();

        SeedRoles(dataContext, roleManager).Wait();
        SeedUsers(dataContext, userManager).Wait();
        SeedDiscussions(dataContext);
        SeedTags(dataContext);
        SeedReactions(dataContext);
        SeedMembers(dataContext);
        SeedSettings(dataContext);
        SeedDiscussionTags(dataContext);

    }

    private static async Task SeedUsers(DataContext dataContext, UserManager<User> userManager)
    {
        var numUsers = dataContext.Users.Count();

        if (numUsers == 0)
        {
            var seededUser = new User
            {
                FirstName = "Seeded",
                LastName = "User",
                UserName = "admin",
            };


            await userManager.CreateAsync(seededUser, "Password");
            await userManager.AddToRoleAsync(seededUser, "Admin");
            await dataContext.SaveChangesAsync();
        }



        var seededUser2 = new User
        {
            FirstName = "Seeded",
            LastName = "User2",
            UserName = "admin2",
        };

        await userManager.CreateAsync(seededUser2, "123456789");
        await userManager.AddToRoleAsync(seededUser2, "Admin");
        await dataContext.SaveChangesAsync();



        var seededUser3 = new User
        {
            FirstName = "Seeded",
            LastName = "User3",
            UserName = "admin3",
        };
        await userManager.CreateAsync(seededUser3, "123456781");
        await userManager.AddToRoleAsync(seededUser3, "Admin");
        await dataContext.SaveChangesAsync();

    }

    private static void SeedDiscussions(DataContext dataContext)
    {
        if (dataContext.Set<Discussion>().Any())
        {
            return;
        }

        var seededDiscussions = new List<Discussion>()
        {
            new()
            {
                Body = "I love apples",
                CreatedByUserId = 1,
                ParentId = null,
                CreatedAt = DateTime.Now
            },


            new()
            {
                Body = "I agree with this",
                CreatedByUserId = 2,
                ParentId = 1,
                CreatedAt = DateTime.Now
            },

            new()
            {
                Body = "I prefer mangoes",
                CreatedByUserId = 3,
                ParentId = 1,
                CreatedAt = DateTime.Now
            },
            new(){
                Body = "Whats your favorite book",
                CreatedByUserId = 2,
                ParentId = null,
                CreatedAt = DateTime.Now

        },
            new(){
            Body = "How many people out there like hotdogs or cheese burgers",
            CreatedByUserId = 2,
            ParentId = null,
            CreatedAt = DateTime.Now
        },
            new()
            {
                Body = "Beans",
                CreatedByUserId = 2,
                ParentId = null,
                CreatedAt = DateTime.Now
            },
            new()
            {
                Body = "Im looking to try some new recipes. Can anyone share any ?",
                CreatedByUserId = 3,
                ParentId = null,
                CreatedAt = DateTime.Now
            },
        };



        dataContext.Set<Discussion>().AddRange(seededDiscussions);
        dataContext.SaveChanges();
    }

    private static void SeedSettings(DataContext dataContext)
    {
        var seededSettings = new List<DiscussionSettings>
        {
            new()
            {
                DiscussionId = 1,
                Title = "I Like apples",
                MaxMembers = null,
                Privacy = PrivacyType.Public,
            },
            new()
            {
                DiscussionId = 4,
                Title = "Favorite Book",
                MaxMembers = 5,
                Privacy = PrivacyType.InviteOnly,
            },
            new()
            {
                DiscussionId = 5,
                Title = "Hotdogs vs CheeseBurgers",
                MaxMembers = 0,
                Privacy = PrivacyType.Public,
            },
            new()
            {
                DiscussionId = 6,
                Title = "Beans",
                MaxMembers = 0,
                Privacy = PrivacyType.Public,
            },
            new()
            {
                DiscussionId = 7,
                Title = "Recipe Sharing",
                MaxMembers = 0,
                Privacy = PrivacyType.Public,
            }
        };

        dataContext.Set<DiscussionSettings>().AddRange(seededSettings);
        dataContext.SaveChanges();
    }

    private static void SeedMembers(DataContext dataContext)
    {
        if (dataContext.Set<DiscussionUsers>().Any())
        {
            return;
        }

        var seededMembers = new List<DiscussionUsers>
        {
            new()
            {
                DiscussionId = 1,
                UserId = 1,
                Role = DiscussionRole.Owner,
                JoinedAt = DateTime.Now
            },
            new()
            {
                DiscussionId = 1,
                UserId = 2,
                Role = DiscussionRole.Member,
                JoinedAt = DateTime.Now
            },
            new()
            {
                DiscussionId = 1,
                UserId = 3,
                Role = DiscussionRole.Member,
                JoinedAt = DateTime.Now
            },
            new()
            {
                DiscussionId = 4,
                UserId = 2,
                Role = DiscussionRole.Owner,
                JoinedAt = DateTime.Now
            },
            new()
            {
                DiscussionId = 5,
                UserId = 2,
                Role = DiscussionRole.Owner,
                JoinedAt = DateTime.Now
            },
            new()
            {
                DiscussionId = 6,
                UserId = 2,
                Role = DiscussionRole.Owner,
                JoinedAt = DateTime.Now
            },
            new()
            {
                DiscussionId = 7,
                UserId = 3,
                Role = DiscussionRole.Owner,
                JoinedAt = DateTime.Now
            }
        };

        dataContext.Set<DiscussionUsers>().AddRange(seededMembers);
        dataContext.SaveChanges();
    }

    private static void SeedTags(DataContext dataContext)
    {
        if (dataContext.Set<Tag>().Any())
        {
            return;
        }

        var seededTags = new List<Tag>
        {
            new()
            {
                Name = "Food"
            },
            new()
            {
                Name = "Recipes"
            },
            new()
            {
                Name = "Beans"
            }
        };

        dataContext.Set<Tag>().AddRange(seededTags);
        dataContext.SaveChanges();
    }

    private static void SeedDiscussionTags(DataContext dataContext)
    {
        if (dataContext.Set<DiscussionTags>().Any())
        {
            return;
        }

        var seededTags = new List<DiscussionTags>
        {
            new()
            {
                DiscussionId = 1,
                TagId = 1
            },
            new()
            {
                DiscussionId = 7,
                TagId = 2
            },
            new()
            {
                DiscussionId = 6,
                TagId = 3
            },
            new()
            {
                DiscussionId = 7,
                TagId = 1
            }
        };
        
        dataContext.Set<DiscussionTags>().AddRange(seededTags);
        dataContext.SaveChanges();
    }

    private static void SeedReactions(DataContext dataContext)
    {
        if (dataContext.Set<Reaction>().Any())
        {
            return;
        }

        var seededReactions = new List<Reaction>
        {
            new()
            {
                DiscussionId = 1,
                UserId = 2,
                ReactionType = ReactionType.Like,
            },
            new()
            {
                DiscussionId = 1,
                UserId = 3,
                ReactionType = ReactionType.Dislike,
            },
            new(){
                DiscussionId = 2,
                UserId = 1,
                ReactionType = ReactionType.Like
            },
            new()
            {
                DiscussionId = 5,
                UserId = 3,
                ReactionType = ReactionType.Like
            },
            new()
            {
                DiscussionId = 5,
                UserId = 1,
                ReactionType = ReactionType.Like
            },
            new()
            {
                DiscussionId = 6,
                UserId = 3,
                ReactionType = ReactionType.Like
            },
        };

        dataContext.Set<Reaction>().AddRange(seededReactions);
        dataContext.SaveChanges();
    }

    private static async Task SeedRoles(DataContext dataContext, RoleManager<Role> roleManager)
    {
        var numRoles = dataContext.Roles.Count();

        if (numRoles == 0)
        {
            var seededRole = new Role
            {
                Name = "Admin"
            };

            await roleManager.CreateAsync(seededRole);
            await dataContext.SaveChangesAsync();
        }
    }
}
