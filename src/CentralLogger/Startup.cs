using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.Swagger;
using CentralLogger.Hubs;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using CentralLogger.Services;
using System.Threading;
using CentralLogger.Controllers;

namespace CentralLogger {
    public class Startup {
        public Startup(IHostingEnvironment env) {
            var builder = new ConfigurationBuilder()
              .SetBasePath(env.ContentRootPath)
              .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
              .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services) {
            var connectionString = Configuration.GetValue("ConnectionString", "");
            var envConnectionString = Environment.GetEnvironmentVariable("CENTRAL_LOGGER_CS");

            if (!string.IsNullOrEmpty(envConnectionString)) {
                connectionString = envConnectionString;
            }

            services.AddCors();
            services.AddDbContext<CentralLoggerContext>(options => options.UseNpgsql(connectionString));
            services.AddSignalR();
            services.AddHttpContextAccessor();
            services.AddScoped<UserService>();
            services.AddScoped<EmailService>();
            services.AddHttpClient();
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.AddSwaggerGen(c => {
                c.SwaggerDoc("v1", new Info { Title = "My API", Version = "v1" });
            });
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, CentralLoggerContext db, UserService userService) {
            var defaultOptions = new DefaultFilesOptions();
            defaultOptions.DefaultFileNames.Clear();
            defaultOptions.DefaultFileNames.Add("index.html");

            if (env.IsDevelopment()) {
                app
                  .UseDeveloperExceptionPage()
                  .UseDefaultFiles(defaultOptions)
                  .UseStaticFiles()
                  .UseSwagger()
                  .UseSwaggerUI(c => {
                      c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
                  });

            } else {
                app
                  .UseHsts()
                  .UseDefaultFiles(defaultOptions)
                  .UseStaticFiles();
            }

            app.UseCors(builder => builder.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().AllowCredentials());
            app.UseMvc();
            app.UseSignalR(options => {
                options.MapHub<LogHub>("/LogHub");
            });

            GenrateDatabase(db, userService);
        }

        private void GenrateDatabase(CentralLoggerContext db, UserService userService) {
            var createData = db.Database.EnsureCreated();
            if (createData) {
                userService.AddUser("admin", "admin");
            }
        }
    }
}