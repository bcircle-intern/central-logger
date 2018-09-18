using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace CentralLogger.Services {
    public class UserService {
        private readonly byte[] salt;
        private readonly CentralLoggerContext db;

        public UserService(CentralLoggerContext db) {

            Console.WriteLine("Create UserService instance");
            this.db = db;
            this.salt = System.Text.Encoding.UTF8.GetBytes("4DI0P3K6");
        }

        public void AddEmail(string app) {
            var exist = db.Emails.FirstOrDefault(x => x.Application == app);
            var email = new Emails();
            if (exist == null) {
                email.Email_1 = "somnuk.wk@bcircle.co.th";
                email.Email_2 = "somnuk.wk@outlook.com";
                email.Enable = true;
                email.Application = app;
                db.Emails.Add(email);
                db.SaveChanges();
            }
        }

        public bool AddUser(string username, string password) {
            var hashedKey = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA1,
            iterationCount: 10000,
            numBytesRequested: 256 / 8));

            var hasUser = db.Users.Any(x => x.User.Equals(username));

            if (!hasUser) {
                db.Users.Add(new Users {
                    User = username,
                    Password = hashedKey
                });
                db.SaveChanges();
            }
            return false;
        }

        public async Task<bool> IsAuthorized(string username, string password) {
            var user = await db.Users.Where(x => x.User.Equals(username)).FirstOrDefaultAsync();

            if (user != null) {
                var hashedKey = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                    password: password,
                    salt: salt,
                    prf: KeyDerivationPrf.HMACSHA1,
                    iterationCount: 10000,
                    numBytesRequested: 256 / 8));

                if (user.Password.Equals(hashedKey)) return true;
            }
            return false;
        }
    }
}