using System;
using System.Collections.Generic;
using System.Text;
using AutoMapper;
using Healthcare.Common.Requests;
using Healthcare.Common.Responses;
using HealthCare.API.DBEntities;

namespace Healthcare.Services.AutoMapper.Mappings
{
    public class ModelToEntityMappingProfile: Profile
    {
        public ModelToEntityMappingProfile()
        {
            CreateMap<RegisterRequest, Client>();
            CreateMap<Client, LoginResponse>();
        }
    }
}
