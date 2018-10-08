#! "netcoreapp2.1"
#r "nuget:BCircle.CentralLogProvider,0.2.0"
#r "nuget:Microsoft.Extensions.DependencyInjection,2.1.1"
#r "nuget:Microsoft.Extensions.Logging,2.1.1"

using System;
using CentralLogProvider;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

class MyService {
    ILogger<MyService> logger;
    public MyService(ILogger<MyService> logger) {
        this.logger = logger;
    }
    public void SendInfo() {
        logger.LogInformation("Hello, world");
        logger.LogCritical("MSBuild targets for Web and WebApplications that come with Visual Studio. Useful for build servers that do not have Visual Studio installed.");

    }
}

var collection = new ServiceCollection();
collection.AddLogging(options => {
    options.AddCentralLog(new CentralLogOptions("https://centralloggerazure.azurewebsites.net"));

});
collection.AddSingleton<MyService>();

var provider = collection.BuildServiceProvider();
var service = provider.GetService<MyService>();

service.SendInfo();
Console.ReadLine();