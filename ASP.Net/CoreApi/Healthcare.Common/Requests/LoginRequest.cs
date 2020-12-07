using Healthcare.Common.StaticResources;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Healthcare.Common.Requests
{
    public class LoginRequest
    {
        [Required]
        public string Email { get; set; }

        [Required]
        [MinLength(8)]
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        [Required]
        [RegularExpression(@"^[a-zA-Z. ]+$", ErrorMessage = Constants.VALIDATION_FULLNAME_ERROR_MSG)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(8)]
        //[RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])", ErrorMessage = Constants.VALIDATION_PASSWORD_ERROR_MSG)]
        public string Password { get; set; }

        [Required]
        [Compare("Password", ErrorMessage = Constants.VALIDATION_PASSWORD_NOT_SAME_MSG)]
        public string ConfirmPassword { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }
    }
}
