using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using System.Web;
using System.Globalization;
using Microsoft.AspNetCore.SignalR;
using CentralLogger.Hubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using CentralLogger.Services;
using System.Net.Mail;
using System.Net;
using Microsoft.Extensions.Configuration;
using System.Collections.Concurrent;
using System.Timers;
using CentralLogger;
using System.Text;
using System.IO;
using System.Net.Http;
using CentralLogger.Models;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using Newtonsoft.Json.Serialization;

namespace CentralLogger.Controllers {
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class LoggerController : ControllerBase {

        readonly EmailService email;
        readonly CentralLoggerContext db;
        readonly IHubContext<LogHub> hubContext;
        static JsonSerializerSettings jsonSettings = new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };
        readonly IConfiguration configuration;
        readonly IHttpClientFactory httpClientFactory;

        public LoggerController(CentralLoggerContext db, IHubContext<LogHub> hubContext, EmailService email, IHttpClientFactory httpClientFactory, IConfiguration configuration) {
            this.db = db;
            this.configuration = configuration;
            this.hubContext = hubContext;
            this.email = email;
            this.httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        public ActionResult<IEnumerable<string>> ShowAll() {
            try {
                var Logger = db.LogInfos.OrderBy(x => x.Id).ToList();
                return Ok(Logger);
            } catch (Exception ex) {
                return StatusCode(500, ex);
            }
        }

        [HttpPost]
        public async Task<ActionResult<List<LogInfo>>> Search(SearchLog search) {
            var perSection = 50;
            search.StartDate = search.StartDate.ToLocalTime();
            search.EndDate = search.EndDate.ToLocalTime();
            var data = db.LogInfos.Where(x => x.DateTime >= search.StartDate && x.DateTime <= search.EndDate);

            var skip = (search.Section - 1) * perSection;

            if (!string.IsNullOrEmpty(search.IpNow)) {
                data = data.Where(x => x.Ip.Equals(search.IpNow));
            }
            if (!string.IsNullOrEmpty(search.AppNow)) {
                data = data.Where(x => x.Application.Equals(search.AppNow));
            }

            var dataLength = await data.CountAsync();
            var result = await data.OrderByDescending(x => x.DateTime).Skip(skip).Take(perSection).ToListAsync();
            return Ok(new { LogInfo = result, DataLength = dataLength });
        }

        [HttpGet]
        public IEnumerable<string> GetIP() {
            var Ip = db.LogInfos.Select(m => m.Ip).Distinct();
            return Ip.ToList();
        }

        [HttpGet]
        public IEnumerable<string> GetAllApp() {
            var App = db.LogInfos.Select(m => m.Application).Distinct();
            return App.ToList();
        }

        [HttpGet("{ip}")]
        public IEnumerable<string> GetApp(string ip) {
            if (!string.IsNullOrEmpty(ip)) {
                var App = db.LogInfos.Where(x => x.Ip.Equals(ip)).Select(m => m.Application).Distinct();
                return App.ToList();
            }
            return Enumerable.Empty<string>();
        }
        [HttpPost]
        public async Task<ActionResult> AddLog([FromBody] GetLogInfos x) {

            db.LogInfos.Add(new LogInfo {
                LogLevel = x.LogLevel,
                Message = x.Message,
                DateTime = x.DateTime,
                Application = x.Application,
                Ip = x.Ip,
                Category = x.Catelog
            });
            var data = new LogInfo {
                LogLevel = x.LogLevel,
                Message = x.Message,
                DateTime = x.DateTime,
                Application = x.Application,
                Ip = x.Ip,
                Category = x.Catelog
            };
            var emailList = db.Emails.Where(z => z.Enable && z.Application == data.Application).Select(m => new { m.Email_1, m.Email_2, m.Email_3 }).ToList();
            var email1 = emailList.Select(y => y.Email_1);
            var email2 = emailList.Select(y => y.Email_2);
            var email3 = emailList.Select(y => y.Email_3);
            var allEmail = email1.Concat(email2).Concat(email3).Distinct().ToArray();
            foreach (var emails in allEmail) {
                email.EnqueueMail(emails);
            }
            if (data.LogLevel == LogLevel.Critical) {
                email.Enqueue(data);
                await SendLine(data);
            }
            db.SaveChanges();

            await hubContext.Clients.All.SendAsync("LogReceived", data);
            return Ok();
        }
        private async Task SendLine(LogInfo data) {

            var messages = $"CRITICAL ALERT {data.Application}  [ {data.Ip} ]\n► พบ Critical ที่:\n■ Application : {data.Application}\n■ Datetime : {data.DateTime}\n■ Category : {data.Category}\n■ IP : {data.Ip}\n■ Message : {data.Message}";


            var lineContent = new LineContent();
            lineContent.To = await db.Line.Where(a => a.ApplicationName == data.Application).Select(m => m.LineId).Distinct().ToListAsync();
            lineContent.Messages.Add(new LineMessage {
                Type = "text",
                Text = messages
            });

            var content = new StringContent(JsonConvert.SerializeObject(lineContent, jsonSettings), Encoding.UTF8, "application/json");
            var client = httpClientFactory.CreateClient();

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", configuration["LineToken"]);

            var response = await client.PostAsync("https://api.line.me/v2/bot/message/multicast", content);
            var responseString = await response.Content.ReadAsStringAsync();
        }

        [HttpDelete]
        public async Task NukeDatabase() {
            await db.Database.EnsureDeletedAsync();
        }
    }

}
