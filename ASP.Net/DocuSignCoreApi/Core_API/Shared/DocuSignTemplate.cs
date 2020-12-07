using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core_API.Shared
{
    public class DocuSignTemplate
    {
        public IList<string> TemplateRoleNames { get; set; }
        public string TemplateId { get; set; }

        public DocuSignTemplate(string templateId, IList<string> templateRoleNames)
        {
            this.TemplateId = templateId;
            this.TemplateRoleNames = templateRoleNames;
        }
    }
}
