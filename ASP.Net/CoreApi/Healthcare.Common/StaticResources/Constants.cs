using System;
using System.Collections.Generic;
using System.Text;

namespace Healthcare.Common.StaticResources
{
    public static class Constants
    {
        public const int SUCCESS_CODE = 200;
        public const int FAILURE_CODE = 400;

        public const string DEFAULT_ERROR_MSG = "Something went wrong";
        public const string LOGIN_FAILURE_MSG = "Username or password is incorrect";
        public const string EMAIL_ALREADY_EXIST = "Email already exists";
        

        /* Validation Messages */
        public const string VALIDATION_FULLNAME_ERROR_MSG = "Name should contains alphabets, space and dot";
        public const string VALIDATION_PASSWORD_ERROR_MSG = "Password is not strong";
        public const string VALIDATION_PASSWORD_NOT_SAME_MSG = "Confirm password is not same as password.";
        
    }
}
