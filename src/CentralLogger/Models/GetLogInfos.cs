using System;

namespace CentralLogger.Models {
    public class GetLogInfos {
        public LogLevel LogLevel { set; get; }
        public string Message { set; get; }
        public DateTime DateTime { set; get; }
        public string Application { set; get; }
        public string Ip { set; get; }
        public string Catelog { set; get; }
    }
}