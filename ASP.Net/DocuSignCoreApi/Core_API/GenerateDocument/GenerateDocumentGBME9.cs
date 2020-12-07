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
    public class GenerateDocumentGBME9
    {
        public DocuSignCredentials DocuSignCredentials { get; set; }
        public EmailTemplate EmailTemplate { get; set; }
        public DocuSignTemplate DocuSignTemplate { get; set; }

        public GenerateDocumentGBME9(DocuSignCredentials credentials, EmailTemplate emailTemplate, DocuSignTemplate docuSignTemplate)
        {
            this.DocuSignCredentials = credentials;
            this.EmailTemplate = emailTemplate;
            this.DocuSignTemplate = docuSignTemplate;
        }
        public ViewUrl GenerateDocument(GBME9Request getData)
        {
            string clientUserId = "1234";
            var docuSignClient = new DocuSignClient(this.DocuSignCredentials);
            var accountId = docuSignClient.AccountId;

            string signerEmail = getData.RecipientEmail;
            string signerName = "";
            string RecipientId = "1";
            string RoutingOrder = "1";
            // Create the signer recipient object 
            Signer signer = new Signer
            {
                Email = signerEmail,
                Name = signerName,
                ClientUserId = clientUserId,
                RecipientId = RecipientId,
                RoutingOrder = RoutingOrder,
                RoleName = DocuSignTemplate.TemplateRoleNames.FirstOrDefault()
            };

            // Create the sign here tab (signing field on the document)
            var tabs = new List<Text> {
                new Text { TabLabel = "LastName", Value = getData.LastName },
                new Text{TabLabel="FirstName",Value=getData.FirstName},
                new Text{TabLabel="MiddleName",Value=getData.MiddleName},
                new Text{TabLabel="PrvsLastName",Value=getData.PreviousLastName},
                new Text{TabLabel="PrvsFirstName",Value=getData.PreviousFirstName},
                new Text{TabLabel="SSN",Value="xxxxxxxxx"},
                new Text{TabLabel="DateOfBirth",Value=getData.DateOfBirth},
                new Text{TabLabel="GuamLicense",Value=getData.GuamLicenseNo},
                new Text{TabLabel="ExpirationDate",Value=getData.ExpirationDate},
                new Text {TabLabel="Course1",Value=getData.Course1},
                new Text{TabLabel="Sponsored1",Value=getData.Sponsored1},
                new Text{TabLabel="Attended1",Value=getData.Attended1},
                new Text{TabLabel="Approved1",Value=getData.Approved1},
                new Text{TabLabel="Category1", Value=getData.Category1},
                new Text {TabLabel="CreditHour1",Value=getData.CreditHour1},
                new Text {TabLabel="Course2",Value=getData.Course2},
                new Text{TabLabel="Sponsored2",Value=getData.Sponsored2},
                new Text{TabLabel="Attended2",Value=getData.Attended2},
                new Text{TabLabel="Approved2",Value=getData.Approved2},
                new Text{TabLabel="Category2", Value=getData.Category2},
                new Text{TabLabel="CreditHour2", Value=getData.CreditHour2},
                new Text{TabLabel="Course3",Value=getData.Course3},
                new Text{TabLabel="Sponsored3",Value=getData.Sponsored3},
                new Text{TabLabel="Attended3",Value=getData.Attended3},
                new Text{TabLabel="Approved3",Value=getData.Approved3},
                new Text{TabLabel="Category3",Value=getData.Category3},
                new Text{TabLabel="CreditHour3",Value=getData.CreditHour3},
                new Text{TabLabel="Course4",Value=getData.Course4},
                new Text{TabLabel="Sponsored4",Value=getData.Sponsored4},
                new Text{TabLabel="Attended4",Value=getData.Attended4},
                new Text{TabLabel="Approved4",Value=getData.Approved4},
                new Text{TabLabel="Category4",Value=getData.Category4},
                new Text{TabLabel="CreditHour4",Value=getData.CreditHour4},
                new Text{TabLabel="Course5",Value=getData.Course5},
                new Text{TabLabel="Sponsored5",Value=getData.Sponsored5},
                new Text{TabLabel="Attended5",Value=getData.Attended5},
                new Text{TabLabel="Approved5",Value=getData.Approved5},
                new Text{TabLabel="Category5",Value=getData.Category5},
                new Text{TabLabel="CreditHour5",Value=getData.CreditHour5},
                new Text{TabLabel="Course6",Value=getData.Course6},
                new Text{TabLabel="Sponsored6",Value=getData.Sponsored6},
                new Text{TabLabel="Attended6",Value=getData.Attended6},
                new Text{TabLabel="Approved6",Value=getData.Approved6},
                new Text{TabLabel="Category6",Value=getData.Category6},
                new Text{TabLabel="CreditHour6",Value=getData.CreditHour6},
                new Text{TabLabel="Course7",Value=getData.Course7},
                new Text{TabLabel="Sponsored7",Value=getData.Sponsored7},
                new Text{TabLabel="Attended7",Value=getData.Attended7},
                new Text{TabLabel="Approved7",Value=getData.Approved7},
                new Text{TabLabel="Category7",Value=getData.Category7},
                new Text{TabLabel="CreditHour7",Value=getData.CreditHour7},
                new Text{TabLabel="Course8",Value=getData.Course8},
                new Text{TabLabel="Sponsored8",Value=getData.Sponsored8},
                new Text{TabLabel="Attended8",Value=getData.Attended8},
                new Text{TabLabel="Approved8",Value=getData.Approved8},
                new Text{TabLabel="Category8",Value=getData.Category8},
                new Text{TabLabel="CreditHour8",Value=getData.CreditHour8},
                new Text{TabLabel="Course9",Value=getData.Course9},
                new Text{TabLabel="Sponsored9",Value=getData.Sponsored9},
                new Text{TabLabel="Attended9",Value=getData.Attended9},
                new Text{TabLabel="Approved9",Value=getData.Approved9},
                new Text{TabLabel="Category9",Value=getData.Category9},
                new Text{TabLabel="CreditHour9",Value=getData.CreditHour9},
                new Text{TabLabel="Course10",Value=getData.Course10},
                new Text{TabLabel="Sponsored10",Value=getData.Sponsored10},
                new Text{TabLabel="Attended10",Value=getData.Attended10},
                new Text{TabLabel="Approved10",Value=getData.Approved10},
                new Text{TabLabel="Category10",Value=getData.Category10},
                new Text{TabLabel="CreditHour10",Value=getData.CreditHour10},
                new Text{TabLabel="Course11",Value=getData.Course11},
                new Text{TabLabel="Sponsored11",Value=getData.Sponsored11},
                new Text{TabLabel="Attended11",Value=getData.Attended11},
                new Text{TabLabel="Approved11",Value=getData.Approved11},
                new Text{TabLabel="Category11",Value=getData.Category11},
                new Text{TabLabel="CreditHour11",Value=getData.CreditHour11}
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
                UserName = signerName,
                AuthenticationMethod = "Email",
                Email = signerEmail
            };

            // 4. Use the SDK to obtain a Recipient View URL
            ViewUrl viewUrl = envelopesApi.CreateRecipientView(accountId, envelopeId, viewOptions);

            return viewUrl;
        }
    }
}
