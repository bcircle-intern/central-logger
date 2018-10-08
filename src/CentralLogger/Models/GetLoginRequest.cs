using System.ComponentModel.DataAnnotations;

namespace CentralLogger.Models {
    public class GetLoginRequest {
        [Required]
        public string User { set; get; }
        [Required]
        public string Pass { set; get; }
    }
}