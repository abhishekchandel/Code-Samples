using Core_API.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core_API.Shared
{
    public class GBME11Request : GBME21Request
    {
        public string ApplicantName { get; set; }
        public string ApplicantDate { get; set; }
        public string RadioLicense { get; set; }
        public string RadioConvicted { get; set; }
        public string RadioDisciplinary { get; set; }
        public string RadioVoluntarily { get; set; }
        public string RadioPractice { get; set; }
        public string RadioNarcotic { get; set; }
        public string RadioStaff { get; set; }
        public string RadioResigned { get; set; }
        public string RadioVoluntarilyResigned { get; set; }
        public string RadioJudgements { get; set; }
        public string RadioPracticeSpecialty { get; set; }
        public string RadioDrugs { get; set; }
        public string RadioPhysicalHealth { get; set; }
        public string RadioGeneralinfo { get; set; }
        public string SignatureDate { get; set; }
    }
}
