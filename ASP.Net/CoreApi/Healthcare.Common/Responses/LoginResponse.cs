using System;
using System.Collections.Generic;
using System.Text;

namespace Healthcare.Common.Responses
{
    public class LoginResponse
    {
        public string token { get; set; }
        public int ClientId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime DateOfBirth { get; set; }
    }
}
