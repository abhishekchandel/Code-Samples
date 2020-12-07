export interface GroupInformationViewModel
{
    GroupName:string;
    ContactName:string;
    Phone:string;
    Email:string;
    Address:string;
    City:string;
    StateId:number;
    ZipCode:string;
    AmountReceived :any;
    GroupId:number;
    groupStallAssignmentRequests:any;
}
export interface BaseResponse{
    Success:boolean,
    Message:string
}