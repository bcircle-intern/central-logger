using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace CentralLogProvider {

    public class CentralLogger : ILogger, IDisposable {

        private readonly string categoryName;
        private readonly CentralLogOptions options;
        private readonly HttpClient client = new HttpClient();
        private readonly ConcurrentQueue<LogMessage> queue = new ConcurrentQueue<LogMessage>();
        private readonly Timer timer;
        private string AppContext = Path.GetFileName(Assembly.GetEntryAssembly().Location);
        private string IpContext = System.Net.Dns.GetHostEntry(System.Net.Dns.GetHostName()).AddressList.GetValue(0).ToString();


        public CentralLogger(string categoryName, CentralLogOptions options) {
            this.categoryName = categoryName;
            this.options = options;

            timer = new Timer(100);
            timer.Start();
            timer.AutoReset = false;
            timer.Elapsed += ProcessJob;
        }

        private async void ProcessJob(object sender, ElapsedEventArgs args) {
            while (queue.TryDequeue(out var message)) {
                await SendRequest(client, message);
            }
            timer.Start();
        }

        private async Task<HttpStatusCode> SendRequest(HttpClient client, LogMessage message) {
            try {
                var data = JsonConvert.SerializeObject(message);
                var fullUrl = $"{options.ServiceUrl}/api/logger/addLog";
                var response = await client.PostAsync(fullUrl, new StringContent(data, Encoding.UTF8, "application/json"));
                return response.StatusCode;
            } catch (Exception) {
                return HttpStatusCode.InternalServerError;
            }
        }

        public IDisposable BeginScope<TState>(TState state) {
            return null;
        }

        public bool IsEnabled(LogLevel logLevel) {
            return logLevel != LogLevel.None;
        }

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter) {
            if (!IsEnabled(logLevel)) {
                return;
            }

            var states = formatter(state, exception);
            var date = DateTime.Now.ToString("dd-MM-yyyy HH:mm:ss.fff zzz");
            var log = $"{date} [{logLevel.ToString()}] {categoryName}: {states}";
            queue.Enqueue(new LogMessage {
                DateTime = DateTime.Now.ToLocalTime(),
                Application = AppContext,
                LogLevel = logLevel.ToString(),
                Message = state.ToString(),
                Ip = IpContext,
                Catelog = categoryName
            });
        }

        public void Dispose() {
            timer.Stop();
            timer.Dispose();
            client.Dispose();
        }
    }
}
