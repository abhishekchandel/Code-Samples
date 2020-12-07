using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core_API.Requests
{
    public class GBME21Request : GBME9Request
    {
        public string Name { get; set; }
        public string PreviousName { get; set; }
    }
}
