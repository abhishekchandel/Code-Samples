using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Healthcare.Common.Requests;
using Healthcare.Common.Responses;
using Healthcare.Common.StaticResources;
using Healthcare.Services.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace Healthcare.API.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AuthAPIController : ControllerBase
    {
        #region readonly
        private readonly IClientService _clientService;
        private readonly JsonSerializerSettings _serializerSettings;

        #endregion

        #region private
        private IOptions<AppSettings> _settings;
        private BaseResponse _response;
        private string _json = string.Empty;
        #endregion

        public AuthAPIController(IClientService clientService, IOptions<AppSettings> settings)
        {
            _settings = settings;
            _clientService = clientService;

            _serializerSettings = new JsonSerializerSettings
            {
                Formatting = Formatting.Indented,
                NullValueHandling = NullValueHandling.Ignore
            };

            _response = new BaseResponse();
        }

        [HttpPost]
        public ActionResult Login([FromBody]LoginRequest login)
        {
            try
            {
                _response = _clientService.Authenticate(login);
                if (_response.StatusCode == Constants.FAILURE_CODE)
                {
                    _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                    return BadRequest(_json);
                }
                _response.data.loginResponse.token = GenerateJSONWebToken(login.Email);
                _json = JsonConvert.SerializeObject(_response.data.loginResponse, _serializerSettings);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public async Task<ActionResult> Register(RegisterRequest register)
        {
            try
            {
                _response = await _clientService.RegisterClient(register);

                if (_response.StatusCode == Constants.FAILURE_CODE)
                {
                    _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                    return BadRequest(_json);
                }

                _response.data.loginResponse.token = GenerateJSONWebToken(register.Email);

                _json = JsonConvert.SerializeObject(_response.data.loginResponse, _serializerSettings);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #region JWT Functions
        private string GenerateJSONWebToken(string email)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Value.Secret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
             };

            var token = new JwtSecurityToken(_settings.Value.ValidIssuer,
                                            _settings.Value.ValidAudience,
                                            claims,
                                            expires: DateTime.Now.AddMinutes(Convert.ToInt32(_settings.Value.Timeout)),
                                            signingCredentials: credentials
                                            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        #endregion

    }
}