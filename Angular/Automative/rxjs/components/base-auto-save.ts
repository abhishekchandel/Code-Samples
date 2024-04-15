
import { delay, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { EventService, IdleService } from '@shared/services';

export abstract class BaseAutoSaveComponent {
  form: NgForm;
  subscription = new Subscription();
  abstract autoSave(manual?: boolean): void;

  constructor(public idleService: IdleService, public eventService: EventService) {
    this.subscription.add(
      this.idleService.idle$.subscribe(() => {
        this.performSave(false);
      })
    );

    this.subscription.add(
      this.eventService.saveObservable$.pipe(delay(400)).subscribe(() => {
        const apiCalled = this.performSave(true);
        if (!apiCalled) this.eventService.formErrorsObservable.next();
      })
    );

    // Pristine form after api call completions.
    this.subscription.add(
      this.eventService.backgroundCallCompletedObservable$.subscribe((success) => {
        if (success) {
          this.eventService.formPristineObservable.next();
          if (this.form) this.form?.form.markAsPristine();
        }
      })
    );

    // Touch form all fields
    this.subscription.add(
      this.eventService.formErrorsObservable$.subscribe(() => {
        if (this.form) this.form?.form.markAllAsTouched();
        this.handleErrorEvent();
      })
    );
  }

  public handleErrorEvent() {
    // Need to override in child components
  }

  private performSave(manual = false) {
    const isFormValid = this.isFormValid(),
      isFormDirty = this.isFormDirty();
    
    if (isFormValid && isFormDirty) {
      this.autoSave(manual);

      return isFormValid;
    }

    return isFormValid;
  }

  public isFormValid() {
    return this.form.valid;
  }

  public isFormDirty() {
    return this.form.dirty;
  }

  destroy(): void {
    this.subscription.unsubscribe();
  }
}



