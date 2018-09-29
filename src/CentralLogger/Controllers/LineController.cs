using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using System.Web;
using System.Globalization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using CentralLogger.Models;

namespace CentralLogger.Controllers {
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class LineController : ControllerBase {
        readonly CentralLoggerContext db;
        public LineController(CentralLoggerContext db) {
            this.db = db;
        }

        [HttpPost]
        public async Task<ActionResult> AddLine([FromBody] GetLine code) {

            var lineList = await db.Line.Where(c => c.LineId == code.LineId && c.ApplicationName == code.ApplicationName).Select(o => o.LineId).FirstOrDefaultAsync();
            if (lineList != code.LineId) {
                db.Line.Add(new Line {
                    LineId = code.LineId,
                    ApplicationName = code.ApplicationName
                });
                await db.SaveChangesAsync();
                return Ok();
            } else
                return BadRequest();
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteLine([FromBody]GetLine code) {
            var delLine = await db.Line.Where(x => x.LineId == code.LineId).ToListAsync();

            if (delLine.Any()) {
                db.Line.RemoveRange(delLine);
                await db.SaveChangesAsync();
                return Ok();
            }
            return BadRequest();
        }

    }
}