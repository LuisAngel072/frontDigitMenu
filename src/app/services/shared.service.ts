import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  private usernameSource = new BehaviorSubject<string>('') ;
  username$ = this.usernameSource.asObservable();

  private usercodeSource = new BehaviorSubject<string>('') ;
  usercode$ = this.usercodeSource.asObservable();

  private profileIMGSource = new BehaviorSubject<string>('') ;
  profileImg = this.profileIMGSource.asObservable();

  setUsername(username: string) {
    this.usernameSource.next(username);
  }

  setUsercode(usercode: string) {
    this.usercodeSource.next(usercode);
  }

  setProfileImg(profile_img:string) {
    this.profileIMGSource.next(profile_img)
  }

}
