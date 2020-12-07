using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Healthcare.Common.Requests;
using Healthcare.Common.Responses;

namespace Healthcare.Services.IServices
{
    public interface IClientService
    {
        BaseResponse Authenticate(LoginRequest login);
        Task<BaseResponse> RegisterClient(RegisterRequest register);
    }
}
