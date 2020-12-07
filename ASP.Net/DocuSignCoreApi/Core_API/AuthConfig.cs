using DocuSign.eSign.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Core_API
{
    public class AuthConfig
    {
        // Point to DocuSign Demo (sandbox) environment for requests
        public const string RestApiUrl = "https://demo.docusign.net/api/3.0/dsapi.asmx";

        // These items are all registered at the DocuSign Admin console and are required 
        // to perform the OAuth flow.
        public const string client_id = "eb4c9c8b-a87b-4b31-87e4-59ca0b699fe7";
        public const string client_secret = "0748f4b9-ed90-440e-8b33-5f940e76f88d secrate-key";
        public const string redirect_uri = "http://localhost:51139/api/DocuSign";

        // This is an application-speicifc param that may be passed around during the OAuth
        // flow. It allows the app to track its flow, in addition to more security.
        public const string stateOptional = "";

        // This will be returned to the test via the callback url after the
        // user authenticates via the browser.
        public static string AccessCode { get; internal set; }

        // This will be filled in with the access_token retrieved from the token endpoint using the code above.
        // This is the Bearer token that will be used to make API calls.
        public static string AccessToken { get; set; }
        public static string StateValue { get; internal set; }

        public static string AccountId { get; set; }
        public static string BaseUri { get; set; }

        // This event handle is used to block the self-hosted Web service in the test
        // until the OAuth login is completed.
        public static ManualResetEvent WaitForCallbackEvent = null;

        // main entry method
        //static void Main(String[] args)
        //{
        //    /////////////////////////////////////////////////////////////////
        //    // Run Code Samples        
        //    /////////////////////////////////////////////////////////////////
        //    AuthConfig samples = new AuthConfig();

        //    // first we use the OAuth authorization code grant to get an API access_token
        //    samples.OAuthAuthorizationCodeFlowTest();
        //}

        public void OAuthAuthorizationCodeFlowTest()
        {

            // Make an API call with the token
            ApiClient apiClient = new ApiClient(RestApiUrl);
            DocuSign.eSign.Client.Configuration.Default.ApiClient = apiClient;

            // Initiate the browser session to the Authentication server
            // so the user can login.
            string accountServerAuthUrl = apiClient.GetAuthorizationUri(client_id, redirect_uri, true, stateOptional);
            System.Diagnostics.Process.Start(accountServerAuthUrl);
        }
    }
}