using System;
using System.Collections.Generic;
using System.Text;
using HealthCare.API.DBEntities;
using Microsoft.EntityFrameworkCore;

namespace Healthcare.DataAccess.Data
{
    public class ApplicationDBContext: DbContext
    {
        public ApplicationDBContext(DbContextOptions options) : base(options)
        {

        }

        public DbSet<Client> Clients { get; set; }
    }
}
