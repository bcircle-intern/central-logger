using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using System.Web;
using CentralLogger.Model;
using System.Globalization;
using Microsoft.AspNetCore.SignalR;
using CentralLogger.Hubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using CentralLogger.Services;

namespace CentralLogger.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class SummaryController : ControllerBase
    {
        private readonly CentralLoggerContext db;
        public SummaryController(CentralLoggerContext db)
        {
            this.db = db;
        }

        [HttpPost]
        public async Task<IActionResult> GetDataChart([FromBody]DateTime date)
        {
            List<int> countInfo = new List<int>();
            List<int> countError = new List<int>();
            List<int> countDebug = new List<int>();
            List<int> countTrace = new List<int>();
            List<int> countWarning = new List<int>();
            List<int> countCritical = new List<int>();

            var year = date.Year;
            var month = date.Month;
            var day = date.Day;
            var startDate = new DateTime(year, month, day, 0, 0, 0);
            var endDate = new DateTime(year, month, day, 23, 59, 59);

            var data = await db.LogInfos.Where(x => x.DateTime >= startDate && x.DateTime <= endDate)
                        .Select(x => new { x.DateTime, x.LogLevel }).ToListAsync();

            for (int i = 0; i <= 23; i++)
            {
                startDate = new DateTime(year, month, day, i, 0, 0);
                endDate = new DateTime(date.Year, date.Month, date.Day, i, 59, 0);
                var amountInfo = data.Where(x => (x.DateTime >= startDate && x.DateTime <= endDate) && x.LogLevel == LogLevel.Information).Count();
                var amountError = data.Where(x => (x.DateTime >= startDate && x.DateTime <= endDate) && x.LogLevel == LogLevel.Error).Count();
                var amountDebug = data.Where(x => (x.DateTime >= startDate && x.DateTime <= endDate) && x.LogLevel == LogLevel.Debug).Count();
                var amountTrace = data.Where(x => (x.DateTime >= startDate && x.DateTime <= endDate) && x.LogLevel == LogLevel.Trace).Count();
                var amountWarning = data.Where(x => (x.DateTime >= startDate && x.DateTime <= endDate) && x.LogLevel == LogLevel.Warning).Count();
                var amountCritical = data.Where(x => (x.DateTime >= startDate && x.DateTime <= endDate) && x.LogLevel == LogLevel.Critical).Count();

                countInfo.Add(amountInfo);
                countError.Add(amountError);
                countDebug.Add(amountDebug);
                countTrace.Add(amountTrace);
                countWarning.Add(amountWarning);
                countCritical.Add(amountCritical);

            }
            return Ok(new CountLogs
            {
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