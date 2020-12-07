using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core_API.Shared
{
    public class EmailTemplate
    {
        public string Subject { get; set; }
        public string MessageBody { get; set; }
        public EmailTemplate(string subject, string messageBody)
        {
            this.Subject = subject;
            this.MessageBody = messageBody;
        }
    }
}
