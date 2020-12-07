using DITSPortal.DataAccess.Base.DBEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace HealthCare.API.DBEntities
{
    public class Client: BaseEntity
    {
        [Key]
        public int ClientId { get; set; }

        [Column(TypeName = "varchar(100)")]
        public string Name { get; set; }
        
        [Column(TypeName = "varchar(50)")]
        public string Email { get; set; }

        [Column(TypeName = "varchar(100)")]
        public string Password { get; set; }

        [Column(TypeName = "Date")]
        public DateTime DateOfBirth { get; set; }
    }
}
