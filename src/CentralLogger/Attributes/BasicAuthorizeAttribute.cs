using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CentralLogger.Models;
using CentralLogger.Services;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CentralLogger.Attributes {
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public sealed class BasicAuthorizeAttribute : TypeFilterAttribute {
        public BasicAuthorizeAttribute(Type type) : base(type) {
        }
    }

    public class BasicAuthorizeFilter : IAsyncAuthorizationFilter {
        readonly CentralLoggerContext db;
        readonly UserService userService;
        public BasicAuthorizeFilter(CentralLoggerContext db, UserService userService) {
            this.db = db;
            this.userService = userService;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context) {
            string au = context.HttpContext.Request.Headers["Authorization"];
            if (au != null && au.StartsWith("Basic ")) {
                var encodedUsernamePassword = au.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries)[1]?.Trim();
                try {
                    var decodedUsernamePassword = Encoding.UTF8.GetString(Convert.FromBase64String(encodedUsernamePassword));
                    var username = decodedUsernamePassword.Split(':', 2)[0];
                    var password = decodedUsernamePassword.Split(':', 2)[1];
                    if (await userService.IsAuthorized(username, password)) {
                        return;
                    }
                } catch (Exception) {
                    //context.HttpContext.Response.Headers["WWW-Authenticate"] = "Basic";
                    context.Result = new UnauthorizedResult();
                }
            }
            // Return authentication type (causes browser to show login dialog)
            // context.HttpContext.Response.Headers["WWW-Authenticate"] = "Basic";
            context.Result = new UnauthorizedResult();
        }
    }
}