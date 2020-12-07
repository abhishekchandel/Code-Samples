using Core_API.Requests;
using Core_API.Shared;
using DocuSign.eSign.Api;
using DocuSign.eSign.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core_API.GenerateDocument
{
    public class GenerateDocumentGBME21
    {
        public DocuSignCredentials DocuSignCredentials { get; set; }
        public EmailTemplate EmailTemplate { get; set; }
        public DocuSignTemplate DocuSignTemplate { get; set; }

        public GenerateDocumentGBME21(DocuSignCredentials credentials, EmailTemplate emailTemplate, DocuSignTemplate docuSignTemplate)
        {
            this.DocuSignCredentials = credentials;
            this.EmailTemplate = emailTemplate;
            this.DocuSignTemplate = docuSignTemplate;
        }
        public ViewUrl GenerateDocument(GBME21Request getData)
        {
            string clientUserId = "221";
            var docuSignClient = new DocuSignClient(this.DocuSignCredentials);
            var accountId = docuSignClient.AccountId;
            
            string RecipientId = "1";
            string RoutingOrder = "1";
            // Create the signer recipient object 
            Signer signer = new Signer
            {
                Email = getData.RecipientEmail,
                Name = getData.Name,
                ClientUserId = clientUserId,
                RecipientId = RecipientId,
                RoutingOrder = RoutingOrder,
                RoleName = DocuSignTemplate.TemplateRoleNames.FirstOrDefault()
            };

            // Create the sign here tab (signing field on the document)
            var tabs = new List<Text> {
                new Text { TabLabel = "Name", Value = getData.Name },
                new Text { TabLabel = "PreviousName", Value = getData.PreviousName }
            };

            // Add the sign here tab array to the signer object.
            signer.Tabs = new Tabs { TextTabs = tabs };

            // Create array of signer objects
            Signer[] signers = new Signer[] { signer };
            // Create recipients object
            Recipients recipient = new Recipients { Signers = new List<Signer>(signers) };

            var serverTemplates = new List<ServerTemplate> { new ServerTemplate { TemplateId = DocuSignTemplate.TemplateId, Sequence = "1" } };
            var inlineTemplates = new List<InlineTemplate> { new InlineTemplate { Recipients = recipient, Sequence = "2" } };
            var compositeTemplates = new List<CompositeTemplate> { new CompositeTemplate { InlineTemplates = inlineTemplates, ServerTemplates = serverTemplates } };

            // Bring the objects together in the EnvelopeDefinition
            EnvelopeDefinition envelope = new EnvelopeDefinition
            {
                EmailSubject = this.EmailTemplate.Subject,
                EmailBlurb = this.EmailTemplate.MessageBody,
                CompositeTemplates = compositeTemplates,
                Status = "sent"
            };

            // |EnvelopesApi| contains methods related to creating and sending Envelopes (aka signature requests)
            var envelopesApi = new EnvelopesApi();
            var envelopeSummary = envelopesApi.CreateEnvelope(accountId, envelope);

            // 3. Create Envelope Recipient View request obj
            string envelopeId = envelopeSummary.EnvelopeId;
            RecipientViewRequest viewOptions = new RecipientViewRequest
            {
                ReturnUrl = "http://www.docusign.com/devcenter",
                ClientUserId = clientUserId,
                UserName = getData.Name,
                AuthenticationMethod = "Email",
                Email = getData.RecipientEmail
            };

            // 4. Use the SDK to obtain a Recipient View URL
            ViewUrl viewUrl = envelopesApi.CreateRecipientView(accountId, envelopeId, viewOptions);

            return viewUrl;
        }
    }
}
