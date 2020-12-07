using Healthcare.DataAccess.Data;
using Healthcare.DataAccess.IRepositories;
using HealthCare.API.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Healthcare.DataAccess.Repositories
{
    public class ClientRepository: BaseRepository<Client>, IClientRepository
    {
        ApplicationDBContext ObjContext;
        public ClientRepository(ApplicationDBContext context) : base(context)
        {
            ObjContext = context;
        }
    }
}
