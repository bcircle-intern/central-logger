using System;
using Microsoft.Extensions.DependencyInjection;
using CentralLogProvider;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            var serviceCollection = new ServiceCollection();
            ConfigureServices(serviceCollection);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            var myService = serviceProvider.GetService(typeof(MyService)) as MyService;

            myService.FunA();
            myService.FunA();

            Console.ReadLine();
        }
        private static void ConfigureServices(IServiceCollection services)
        {
            // var centralLogOptions = new CentralLogOptions("https://central-logger-214910.appspot.com");
            //var centralLogOptions = new CentralLogOptions("https://central-logger.azurewebsites.net");
            var centralLogOptions = new CentralLogOptions("http://localhost:5000");
            services.AddLogging(configure =>
            {
                configure.ClearProviders();
                configure.AddCentralLog(centralLogOptions);
            });
            services.AddTransient<MyService>();
        }
    }

    class MyService
    {
        private ILogger<MyService> logger;
        public MyService(ILogger<MyService> logger)
        {
            this.logger = logger;
        }

        public void FunA()
        {
            for (var i = 0; i < 500; i++)
            {
                logger.LogInformation("The Singapore Spirit lives in all of us. It carries us forward and unites us. Discover the ones who are shaping the future and learn how you can make a difference");
                logger.LogInformation("News, email and search are just the beginning. Discover more every day. Find your yodel.");
                logger.LogInformation("My way of playing cricket is defensive but whenever i connect the ball with sweet part of the bat then the ball cannot be stopped by any player sg is simply");
            }
        }
    }
}
