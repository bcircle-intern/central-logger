using System;

namespace CentralLogProvider {
    public class LogMessage {
        public string LogLevel { get; set; }
        public string Message { get; set; }
        public DateTime DateTime { set; get; } = DateTime.Now;
        public string Application { get; set; }
        public string Ip { get; set; }
        public string Catelog { get; set; }
    }
}