export interface YearlyMaintenanceModel{
    ShowStartDate:string,
    ShowEndDate:string,
    PreEntryCutOffDate:string,
    SponcerCutOffDate:string,
    Year:number,
    YearlyMaintenanceId:number
}

export interface ContactInfo{
    Location:string,
    Email1:string,
    Email2:string,
    Phone1:string,
    Phone2:string,
    exhibitorSponsorAddress:string,
    exhibitorSponsorCity:string,
    exhibitorSponsorZip:string,
    exhibitorSponsorState:number,
    exhibitorSponsorEmail:string,
    exhibitorSponsorPhone:string,
    exhibitorRefundAddress:string,
    exhibitorRefundCity:string,
    exhibitorRefundZip:string,
    exhibitorRefundState:number,
    exhibitorRefundEmail:string,
    exhibitorRefundPhone:string,
    returnAddress:string,
    returnCity:string,
    returnZip:string,
    returnState:number,
    returnEmail:string,
    returnPhone:string,
    AAYHSContactId:number
    yearlyMaintenanceId:number
    Address:string,
    City:string,
    State:string,
    Zipcode:string
}

export interface Statements{
    YearlyMaintenanceId:number,
    YearlyStatementTextId:number,
    StatementName:string
    StatementNumber:string
    StatementText:string
}