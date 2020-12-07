import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public  searchTerm: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  constructor() { }

}
