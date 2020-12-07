using System;
using System.Collections.Generic;
using System.Text;

namespace Healthcare.Common.Responses
{
    public class BaseResponse
    {
        public BaseResponse()
        {
            data = new data();
        }
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public data data { get; set; }
    }

    public class data
    {
        public LoginResponse loginResponse{ get; set; }
    }
}
