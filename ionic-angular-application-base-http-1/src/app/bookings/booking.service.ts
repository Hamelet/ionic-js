import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';

import { Booking } from './booking.model';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  get bookings() {
    return this._bookings.asObservable();
  }

  constructor(private authService: AuthService,
              private http: HttpClient) {}

  addBooking(
    logementId: string,
    logementTitle: string,
    logementImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;

    const newBooking = new Booking(
      Math.random().toString(),
      logementId,
      this.authService.userId,
      logementTitle,
      logementImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );
    return this.http.post<{name:string}>(`https://ionic-superbnb.firebaseio.com/bookings.json`, 
    {...newBooking, id: null}).pipe(
      switchMap(resData=>{
        generatedId = resData.name;
        return this.bookings
      })
    ),
    
      take(1),
      delay(1000),
      tap(bookings => {
        this._bookings.next(bookings.concat(newBooking));
      });
    
  }

  cancelBooking(bookingId: string) {
    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(bookings => {
        this._bookings.next(bookings.filter(b => b.id !== bookingId));
      })
    );
  }
}
