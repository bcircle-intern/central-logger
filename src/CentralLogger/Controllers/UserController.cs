using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CentralLogger.Attributes;
using CentralLogger.Hubs;
using CentralLogger.Models;
using CentralLogger.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace CentralLogger.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
<<<<<<< HEAD
    public class UserController : ControllerBase
    {
=======

    public class UserController : ControllerBase {
>>>>>>> 8f46ab943ebd8c8dc26c51ec3db1771f21581960
        readonly EmailService email;
        readonly CentralLoggerContext db;
        readonly IHubContext<LogHub> hubContext;
        readonly UserService userService;

<<<<<<< HEAD
=======

>>>>>>> 8f46ab943ebd8c8dc26c51ec3db1771f21581960
        public UserController(CentralLoggerContext db, IHubContext<LogHub> hubContext, EmailService email, UserService userService)
        {
            this.db = db;
            this.hubContext = hubContext;
            this.email = email;
            this.userService = userService;
        }
<<<<<<< HEAD
        [HttpPost]
        public async Task<ActionResult> LoginRequest([FromBody] GetLoginRequest request)
        {
            var IsAuthorized = await userService.IsAuthorized(request.User, request.Pass);
            if (IsAuthorized)
            {
=======


        [HttpPost]
        public async Task<ActionResult> LoginRequest([FromBody] GetLoginRequest request) {
            var IsAuthorized = await userService.IsAuthorized(request.User, request.Pass);
            if (IsAuthorized) {
>>>>>>> 8f46ab943ebd8c8dc26c51ec3db1771f21581960
                //  base64 UTF8 (request.User:request.pass)
                var account = $"{request.User}:{request.Pass}";
                var accountBytes = System.Text.Encoding.UTF8.GetBytes(account);

                var result = new { accessToken = Convert.ToBase64String(accountBytes) };
                return Ok(result);
            }
            return Unauthorized();
        }

        [BasicAuthorize(typeof(BasicAuthorizeFilter))]
        [HttpPost]
<<<<<<< HEAD
        public ActionResult AddUser([FromBody] GetUsers data)
        {
=======
        public ActionResult AddUser([FromBody] GetUsers data) {
>>>>>>> 8f46ab943ebd8c8dc26c51ec3db1771f21581960
            var userlist = db.Users.Where(x => x.User == data.Users).Select(x => x.User).FirstOrDefault();
            if (userlist != data.Users && data.Users != null)
            {
                userService.AddUser(data.Users, data.Password);
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }

        [BasicAuthorize(typeof(BasicAuthorizeFilter))]
        [HttpGet]
        public ActionResult DeleteUser(string User)
        {
            var del = db.Users.FirstOrDefault(data => data.User == User);
            if (del != null && User != "admin")
            {
                db.Users.Remove(del);
                db.SaveChanges();
                return Ok();
            }
            else
                return BadRequest();
        }

        [BasicAuthorize(typeof(BasicAuthorizeFilter))]
        [HttpGet]
        public ActionResult<IEnumerable<string>> ShowAllUser()
        {
            try
            {
                var showUsers = db.Users.Where(x => x.Id > 1).Select(data => data.User).ToArray();
                return Ok(showUsers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex);
            }
        }

    }
}