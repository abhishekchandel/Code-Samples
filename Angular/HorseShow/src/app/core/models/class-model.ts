export interface ClassInfoModel
{
    ClassId:number;
    ClassHeaderId:number;
    ClassNumber:number;
    Name:string;
    AgeGroup:string;
    ScheduleDate:string;
    SplitNumber:number;
    ChampionShipIndicator:boolean
    getClassSplit: SplitClass[];
    IsNSBAMember:boolean
}

export interface SplitClass{
    Entries: number;
}

export interface ClassEnteries{
    Exhibitor:string,
    Horse:string,
    BirthYear:number,
    AmountPaid:number,
    AmountDue:number
}

export interface ClassResults{
    Result:string,
    BackNo:string,
    ExhibitorName:number,
    BirthYear:number,
    HorseName:string,
    AmountPaid:number,
    AmountDue:number
}

export interface ClassViewModel
{
    ClassNumber:string,
    ClassName:string,
   
    Enteries:number,
    AgeGroup:string
}