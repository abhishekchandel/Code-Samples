using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core_API.Requests
{
    public class BaseRequest
    {
        public int? ClientId { get; set; }
        public string TemplateId { get; set; }
        public string RecipientEmail { get; set; }
    }
}
