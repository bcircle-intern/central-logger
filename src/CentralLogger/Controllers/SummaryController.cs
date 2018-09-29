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

namespace CentralLogger.Controllers {
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class SummaryController : ControllerBase {
        private readonly CentralLoggerContext db;
        public SummaryController(CentralLoggerContext db) {
            this.db = db;
        }

        [HttpPost]
        public async Task<IActionResult> GetDataChart([FromBody] DateTime date) {

            var countInfo = new List<int>();
            var countError = new List<int>();
            var countDebug = new List<int>();
            var countTrace = new List<int>();
            var countWarning = new List<int>();
            var countCritical = new List<int>();

            date = date.ToLocalTime();
            var startDate = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0);
            var endDate = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59);

            var data = await db.LogInfos.Where(x => x.DateTime >= startDate && x.DateTime <= endDate)
                        .Select(x => new { x.DateTime, x.LogLevel }).ToListAsync();

            for (int i = 0; i <= 23; i++) {

                startDate = new DateTime(date.Year, date.Month, date.Day, i, 0, 0);
                endDate = new DateTime(date.Year, date.Month, date.Day, i, 59, 0);
                var amountInfo = data.Count(x => (x.DateTime >= startDate && x.DateTime <= endDate) && x.LogLevel == LogLevel.Information);
                var amountError = data.Count(x => (x.DateTime >= startDate && x.DateTime <= endDate) && x.LogLevel == LogLevel.Error);
                var amountDebug = data.Count(x => (x.DateTime >= startDate && x.DateTime <= endDate) && x.LogLevel == LogLevel.Debug);
                var amountTrace = data.Count(x => (x.DateTime >= startDate && x.DateTime <= endDate) && x.LogLevel == LogLevel.Trace);
                var amountWarning = data.Count(x => (x.DateTime >= startDate && x.DateTime <= endDate) && x.LogLevel == LogLevel.Warning);
                var amountCritical = data.Count(x => (x.DateTime >= startDate && x.DateTime <= endDate) && x.LogLevel == LogLevel.Critical);

                countInfo.Add(amountInfo);
                countError.Add(amountError);
                countDebug.Add(amountDebug);
                countTrace.Add(amountTrace);
                countWarning.Add(amountWarning);
                countCritical.Add(amountCritical);

            }
            return Ok(new CountLogs {
                dataInfos = countInfo,
                dataErrors = countError,
                dataDebugs = countDebug,
                dataTraces = countTrace,
                dataWarnings = countWarning,
                dataCriticals = countCritical,

            });

        }
    }
}