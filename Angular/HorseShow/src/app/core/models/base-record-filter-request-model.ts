export interface BaseRecordFilterRequest{
    Page: number,
    Limit: number,
    OrderBy: string,
    OrderByDescending: boolean,
    AllRecords: boolean,
    SearchTerm:string
}

