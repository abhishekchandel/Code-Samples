import { NumberValueAccessor } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

export interface SponsorInformationViewModel
{
    SponsorName:string;
    ContactName:string;
    Phone:string;
    Email:string;
    Address:string;
    City:string;
    StateId:number;
    ZipCode:number;
    AmountReceived :any;
    SponsorId:number;
    sponsorExhibitors:Array<SponsorExhibitors>;
    sponsorClasses:Array<SponsorClasses>
}
export interface TypesList
{
    Id:number;
    Name:string;
}

export interface SponsorExhibitors{
    ExhibitorId:number,
    ExhibitorName:string,
    SponsorType:string,
    IdNumber:string,
    BirthYear:number
}

export interface SponsorClasses{
    ClassNumber:string,
    ClassName:string,
    FromAge:number,
    ToAge:number,
    Exhibitor:string,
    HorseName:string
}
export interface SponsorViewModel  {
    SponsorId:number,
    SponsorName:string
}

export interface BaseResponse{
    Success:boolean,
    Message:string
}