using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Timers;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace CentralLogger.Services {
    public class EmailService {

        readonly ConcurrentQueue<LogInfo> queue = new ConcurrentQueue<LogInfo>();
        readonly ConcurrentQueue<string> queueMail = new ConcurrentQueue<string>();
        readonly Timer timer;
        readonly IConfiguration configuration;
        // private readonly HttpContext context;
        readonly string baseUrl;
        
        public EmailService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor) {

            Console.WriteLine("Create MailService instance");

            this.configuration = configuration;
            this.baseUrl = $"{httpContextAccessor.HttpContext.Request.Scheme}://{httpContextAccessor.HttpContext.Request.Host}";
            timer = new Timer(100);
            timer.Start();
            timer.AutoReset = false;
            timer.Elapsed += SendEmail;
        }

        public void Enqueue(LogInfo info) {
            queue.Enqueue(info);
        }
        public void EnqueueMail(string email) {
            queueMail.Enqueue(email);
        }

        private async void SendEmail(object sender, ElapsedEventArgs args) {
            while (queue.TryDequeue(out var data)) {
                while (queueMail.TryDequeue(out var mail)) {
                    await CheckEmail(data, mail);
                }
            }
            timer.Start();
        }
        public async Task CheckEmail(LogInfo data, string mail) {
            if (!string.IsNullOrEmpty(mail)) {
                await SendEmail(data, mail);
            }
        }

        public async Task SendEmail(LogInfo data, string Email) {
            string strUrl = $"{baseUrl}/api/Email/DisableEmail?email={Email}";
            strUrl = strUrl.Replace("@", "%40");
            var subject = $"Critical Alert {data.Application} [ {data.Ip} ]";
            var body = $"Found Critical:<br>Application : {data.Application}<br>Datetime : {data.DateTime}<br>Category : {data.Category}<br>IP : {data.Ip}<br>Message : {data.Message}<br><br><br><hr><font size=\"1\">ถ้าต้องการยกเลิกการติดตามโปรดคลิกที่ปุ่มด้านล่าง :<br> <a href=\"{strUrl}\"><button type=\"button\" style=\"color: red\">ยกเลิกการแจ้งเตือน</button></a></font>";
            var FromMail = configuration["Email:Account"];
            var Password = configuration["Email:Password"];
            var emailTo = Email;

            using (var mail = new MailMessage())
            using (SmtpClient smtpServer = new SmtpClient("smtp.gmail.com")) {
                smtpServer.UseDefaultCredentials = false;
                smtpServer.EnableSsl = true;
                smtpServer.Port = 587;
                smtpServer.Credentials = new System.Net.NetworkCredential(FromMail, Password);
                mail.From = new MailAddress(FromMail);
                mail.To.Add(emailTo);
                mail.Subject = subject;
                mail.Body = body;
                mail.IsBodyHtml = true;
                await smtpServer.SendMailAsync(mail);
            }
        }
    }
}
