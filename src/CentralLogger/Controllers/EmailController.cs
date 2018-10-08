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
using Microsoft.EntityFrameworkCore;

namespace CentralLogger.Controllers {
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class EmailController : ControllerBase {
        readonly CentralLoggerContext db;

        public EmailController(CentralLoggerContext db) {
            this.db = db;
        }

        [BasicAuthorize(typeof(BasicAuthorizeFilter))]
        [HttpPost]
        public async Task<ActionResult> AddEmails([FromBody] GetEmail x) {
            var applist = await db.Emails.Where(m => m.Application == x.Application).Select(m => m.Application).FirstOrDefaultAsync();
            if (applist != x.Application && x.Application != null) {
                db.Emails.Add(new Emails {
                    Application = x.Application,
                    Email_1 = x.Email_1,
                    Email_2 = x.Email_2,
                    Email_3 = x.Email_3,
                    Enable = x.Enable
                });
                await db.SaveChangesAsync();
                return Ok();
            } else {
                return BadRequest();
            }

        }

        [BasicAuthorize(typeof(BasicAuthorizeFilter))]
        [HttpGet]
        public async Task<IEnumerable<string>> SearchExceptApp() {
            /////ใช้ในการเลือกAppจากdata//////
            var appLog = await db.LogInfos.Select(m => m.Application).ToListAsync();
            var appMail = await db.Emails.Select(m => m.Application).ToListAsync();
            var result = appLog.Except(appMail);
            return result;
        }

        [BasicAuthorize(typeof(BasicAuthorizeFilter))]
        [HttpPost]
        public async Task<ActionResult> UpdateEmail([FromBody] GetEmail Mail) {
            var applist = await db.Emails.Where(m => m.Application == Mail.Application).Select(m => m.Application).FirstOrDefaultAsync();
            if (applist == Mail.Application) {
                var value = await db.Emails.Where(o => o.Application == Mail.Application).ToListAsync();
                foreach (var data in value) {
                    data.Email_1 = Mail.Email_1;
                    data.Email_2 = Mail.Email_2;
                    data.Email_3 = Mail.Email_3;
                    data.Enable = Mail.Enable;
                }
                await db.SaveChangesAsync();
                return Ok();
            } else {
                return BadRequest();
            }
        }

        [BasicAuthorize(typeof(BasicAuthorizeFilter))]
        [HttpPost]
        public async Task<ActionResult> SetEnable(Boolean data) {
            db.Emails.Update(new Emails {
                Enable = !data
            });
            await db.SaveChangesAsync();
            return Ok();
        }

        [BasicAuthorize(typeof(BasicAuthorizeFilter))]
        [HttpGet]
        public async Task<ActionResult> DeleteApp(string AppName) {
            var del = db.Emails.FirstOrDefault(o => o.Application == AppName);
            if (del != null) {
                db.Emails.Remove(del);
                await db.SaveChangesAsync();
                return Ok();
            } else
                return BadRequest();
        }

        [BasicAuthorize(typeof(BasicAuthorizeFilter))]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetEmail>>> ShowMailApp() {
            try {
                var Application = await db.Emails.OrderBy(x => x.Id).ToListAsync();
                return Ok(Application);
            } catch (Exception ex) {
                return StatusCode(500, ex);
            }
        }

        [HttpGet]
        public async Task<string> DisableEmail(string email) {
            var emaillist1 = await db.Emails.Where(m => m.Email_1 == email).Select(m => m.Application).FirstOrDefaultAsync();
            var emaillist2 = await db.Emails.Where(m => m.Email_2 == email).Select(m => m.Application).FirstOrDefaultAsync();
            var emaillist3 = await db.Emails.Where(m => m.Email_3 == email).Select(m => m.Application).FirstOrDefaultAsync();
            if (emaillist1 != null || emaillist2 != null || emaillist3 != null) {
                if (emaillist1 != null) {
                    var update = await db.Emails.FirstOrDefaultAsync(o => o.Application == emaillist1);
                    update.Email_1 = "";
                }
                if (emaillist2 != null) {
                    var update = await db.Emails.FirstOrDefaultAsync(o => o.Application == emaillist2);
                    update.Email_2 = "";
                }
                if (emaillist3 != null) {
                    var update = await db.Emails.FirstOrDefaultAsync(o => o.Application == emaillist3);
                    update.Email_3 = "";
                }
                await db.SaveChangesAsync();
                var text = "Your email has been unsubscribe. Thank you";
                return text;
            } else {
                var text = "Found something wrong. Please contact Admin. Thank you";
                return text;
            }
        }
    }

}
