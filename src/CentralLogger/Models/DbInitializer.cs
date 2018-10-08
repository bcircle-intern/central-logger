using CentralLogger.Services;

namespace CentralLogger.Models
{
    public static class DbInitializer
	{
        public static void Initialize(CentralLoggerContext db, UserService userService) {
            var createData = db.Database.EnsureCreated();
            if (createData) {
                userService.AddUser("admin", "admin");
            }
        }
    }
}