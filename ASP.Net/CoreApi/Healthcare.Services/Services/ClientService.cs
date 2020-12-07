using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Healthcare.Common.Requests;
using Healthcare.Common.Responses;
using Healthcare.Common.StaticResources;
using Healthcare.DataAccess.IRepositories;
using Healthcare.DataAccess.Repositories;
using Healthcare.Services.IServices;
using HealthCare.API.DBEntities;

namespace Healthcare.Services.Services
{
    public class ClientService : IClientService
    {
        #region readonly
        private readonly IClientRepository _clientRepository;
        private readonly IMapper _mapper;
        #endregion

        #region Object Variables
        private BaseResponse _response;
        #endregion

        public ClientService(IClientRepository clientRepository, IMapper mapper)
        {
            _clientRepository = clientRepository;
            _mapper = mapper;

            _response = new BaseResponse();
            _response.StatusCode = Constants.FAILURE_CODE;
        }

        public BaseResponse Authenticate(LoginRequest login)
        {
            try
            {
                var data = _clientRepository.GetSingle(x => x.Email == login.Email.ToLower() && x.Password == login.Password);

                if (data != null)
                {
                    var loginResponse = _mapper.Map<LoginResponse>(data);
                    _response.data.loginResponse = loginResponse;
                    _response.StatusCode = Constants.SUCCESS_CODE;
                }
                else
                {
                    _response.Message = Constants.LOGIN_FAILURE_MSG;
                }
            }
            catch(Exception ex)
            {
                throw ex;
            }
            return _response;
        }

        public async Task<BaseResponse> RegisterClient(RegisterRequest register)
        {
            try
            {
                var isEmailExist = _clientRepository.GetSingle(x => x.Email == register.Email);
                if (isEmailExist != null)
                {
                    _response.Message = Constants.EMAIL_ALREADY_EXIST;
                    return _response;

                }
                var client = _mapper.Map<Client>(register);
                client.CreatedOn = DateTime.Now;
                client.IsActive = true;
                client.IsDeleted = false;

                var data = await _clientRepository.AddAsync(client);

                if (data != null)
                {
                    var loginResponse = _mapper.Map<LoginResponse>(data);
                    _response.data.loginResponse = loginResponse;
                    _response.StatusCode = Constants.SUCCESS_CODE;
                }
                else
                {
                    _response.Message = Constants.LOGIN_FAILURE_MSG;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return _response;
        }
    }
}
