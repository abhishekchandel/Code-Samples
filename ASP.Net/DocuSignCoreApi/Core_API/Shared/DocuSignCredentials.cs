using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core_API.Shared
{
    public class DocuSignCredentials
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string IntegratorKey { get; set; }

        public DocuSignCredentials(string username, string password, string integratorKey)
        {
            this.Username = username;
            this.Password = password;
            this.IntegratorKey = integratorKey;
        }
    }
}
