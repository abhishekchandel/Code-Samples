using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Core_API.GenerateDocument;
using Core_API.Requests;
using Core_API.Shared;
//using Core_API.Shared;
using DocuSign.eSign.Api;
using DocuSign.eSign.Client;
using DocuSign.eSign.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace Core_API.Controllers
{
    [Route("api/[controller]/[Action]")]
    [ApiController]
    public class DocuSignController : Controller
    {
        public IConfiguration Configuration { get; }

        public DocuSignController(IConfiguration config)
        {
            Configuration = config;
        }

        // Post api/DocuSign/DocusignGBME21Request
        [HttpPost]
        public ActionResult<string> DocusignGBME21Request([FromBody]GBME21Request getData)
        {
            var emailTemplate = new EmailTemplate("Signature Request", "Hello please read the document and provide your signature in respective fields.");
            var docuSignTemplate = new DocuSignTemplate(getData.TemplateId, new List<string> { "Signer" });
            var docuSignCredentials = new DocuSignCredentials(Configuration.GetSection("ClientEndPoints").GetSection("AccountUserName").Value, Configuration.GetSection("ClientEndPoints").GetSection("AccountPassword").Value, Configuration.GetSection("ClientEndPoints").GetSection("IntegratedKey").Value);
            var documentGenerator = new GenerateDocumentGBME21(docuSignCredentials, emailTemplate, docuSignTemplate);
            var returnedURL = documentGenerator.GenerateDocument(getData);

            return new JsonResult(returnedURL);
        }

        // Post api/DocuSign/DocusignGBME11Request
        [HttpPost]
        public ActionResult<string> DocusignGBME11Request([FromBody]GBME11Request getData)
        {
            var emailTemplate = new EmailTemplate("Signature Request", "Hello please read the document and provide your signature in respective fields.");
            var docuSignTemplate = new DocuSignTemplate(getData.TemplateId, new List<string> { "Signer" });
            var docuSignCredentials = new DocuSignCredentials(Configuration.GetSection("ClientEndPoints").GetSection("AccountUserName").Value, Configuration.GetSection("ClientEndPoints").GetSection("AccountPassword").Value, Configuration.GetSection("ClientEndPoints").GetSection("IntegratedKey").Value);
            var documentGenerator = new GenerateDocumentGBME11(docuSignCredentials, emailTemplate, docuSignTemplate);
            var returnedURL = documentGenerator.GenerateDocument(getData);
            
            return new JsonResult(returnedURL);
        }


        // Post api/DocuSign/DocusignGBME9Request
        [HttpPost]
        public ActionResult<string> DocusignGBME9Request(GBME9Request getData)
        {
            var emailTemplate = new EmailTemplate("Signature Request", "Hello please read the document and provide your signature in respective fields.");
            var docuSignTemplate = new DocuSignTemplate(getData.TemplateId, new List<string> { "Signer" });
            var docuSignCredentials = new DocuSignCredentials(Configuration.GetSection("ClientEndPoints").GetSection("AccountUserName").Value, Configuration.GetSection("ClientEndPoints").GetSection("AccountPassword").Value, Configuration.GetSection("ClientEndPoints").GetSection("IntegratedKey").Value);
            var documentGenerator = new GenerateDocumentGBME9(docuSignCredentials, emailTemplate, docuSignTemplate);
            var returnedURL = documentGenerator.GenerateDocument(getData);

            return new JsonResult(returnedURL);
        }

    }
}